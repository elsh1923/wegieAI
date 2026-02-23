import os
import sys
import srt
import shutil
from google import genai
from google.genai import types
from dotenv import load_dotenv
from datetime import timedelta

# Load API key
load_dotenv()
api_key = os.environ.get("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key) if api_key else genai.Client()

# --- Configure ffmpeg path before everything else ---
import imageio_ffmpeg
import io
import sys

# Force UTF-8 for all stdout/stderr to avoid 'charmap' codec errors with Amharic on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

_ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
_ffmpeg_dir = os.path.dirname(_ffmpeg_exe)
_target_ffmpeg = os.path.join(_ffmpeg_dir, "ffmpeg.exe")

# Whisper/ffmpeg-python looks for "ffmpeg.exe", not the versioned name from imageio-ffmpeg
if not os.path.exists(_target_ffmpeg):
    try:
        shutil.copy2(_ffmpeg_exe, _target_ffmpeg)
    except Exception as e:
        print(f"Warning: Could not create ffmpeg alias: {e}")

# Inject into PATH so all sub-processes (Whisper, MoviePy) find it
os.environ["PATH"] = _ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
os.environ["FFMPEG_BINARY"] = _target_ffmpeg

from moviepy import VideoFileClip, CompositeVideoClip, TextClip
from state import jobs, UPLOAD_DIR, AUDIO_DIR, CAPTION_DIR, OUTPUT_DIR

# Using Gemini 1.5 Flash for accurate Amharic transcription and translation prevention
generation_config = types.GenerateContentConfig(
  temperature=0.0,
  top_p=0.95,
  top_k=40,
  max_output_tokens=8192,
  response_mime_type="text/plain",
  system_instruction="""
  You are an Amharic language expert. Your ONLY job is to listen to the audio and transcribe the spoken Amharic language directly into the Ge'ez script (አማርኛ ፊደል).
  
  CRITICAL RULES:
  1. The output MUST be entirely in the Ge'ez script. Example: ሰላም እንዴት ነህ
  2. You are FORBIDDEN from using Arabic, Urdu, or Persian characters (e.g. سلام اندیٹ نیہ).
  3. You are FORBIDDEN from using the Latin alphabet (e.g. Selam indet neh).
  4. DO NOT translate the Amharic into English.
  
  Format the output as a valid SRT file (with counter, timestamp, and text). Make sure the timestamps are accurate to the audio.
  """
)


def process_video(job_id: str, input_path: str, overlay: bool = False):
    video = None
    try:
        # 1. Update status
        jobs[job_id]["status"] = "extracting_audio"
        
        # 2. Extract Audio
        audio_path = os.path.join(AUDIO_DIR, f"{job_id}.mp3")
        video = VideoFileClip(input_path)
        video.audio.write_audiofile(audio_path)
        
        # 3. Upload to Gemini and Transcribe
        jobs[job_id]["status"] = "transcribing"
        print(f"DEBUG: Uploading audio to Gemini for job {job_id}")
        
        audio_file = client.files.upload(file=audio_path, mime_type="audio/mp3")
        
        print(f"DEBUG: Starting Gemini transcription for job {job_id}")
        
        prompt = "Transcribe the audio."
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[audio_file, prompt],
            config=generation_config
        )
        print(f"DEBUG: Transcription completed for job {job_id}")
        
        srt_content = response.text.strip()
        
        # Clean up the file from Google's servers
        client.files.delete(name=audio_file.name)
        
        # 4. Save SRT
        jobs[job_id]["status"] = "generating_srt"
        srt_path = os.path.join(CAPTION_DIR, f"{job_id}.srt")
        with open(srt_path, "w", encoding="utf-8") as f:
            f.write(srt_content)
            
        # Parse the custom SRT back into objects for the MoviePy overlay loop below
        srt_subtitles = list(srt.parse(srt_content))
        
        # 4.5 Optional Overlay
        if overlay:
            jobs[job_id]["status"] = "overlaying_captions"
            subtitle_clips = []
            for sub in srt_subtitles:
                # Use Segoe UI which has excellent Amharic support on Windows
                txt_clip = (
                    TextClip(
                        text=sub.content,
                        font="Segoe UI",
                        font_size=32,
                        color='white',
                        bg_color='rgba(0,0,0,0.6)',
                        size=(video.w * 0.8, None),
                        method='caption',
                    )
                    .with_start(sub.start.total_seconds())
                    .with_end(sub.end.total_seconds())
                    .with_position(('center', video.h * 0.85))
                )
                subtitle_clips.append(txt_clip)
            
            result_video = CompositeVideoClip([video] + subtitle_clips)
            output_path = os.path.join(OUTPUT_DIR, f"{job_id}.mp4")
            result_video.write_videofile(output_path, codec="libx264", audio_codec="aac")
            jobs[job_id]["video_path"] = output_path
        
        # 5. Done
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["srt_path"] = srt_path
        
    except Exception as e:
        print(f"Error processing {job_id}: {str(e)}")
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
    finally:
        if video is not None:
            video.close()
