import os
import sys
import whisper
import srt
import shutil
from datetime import timedelta

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

# Load whisper 'small' model for significantly better Amharic accuracy
model = whisper.load_model("small")

def process_video(job_id: str, input_path: str, overlay: bool = False):
    video = None
    try:
        # 1. Update status
        jobs[job_id]["status"] = "extracting_audio"
        
        # 2. Extract Audio
        audio_path = os.path.join(AUDIO_DIR, f"{job_id}.mp3")
        video = VideoFileClip(input_path)
        video.audio.write_audiofile(audio_path)
        
        # 3. Transcribe
        jobs[job_id]["status"] = "transcribing"
        print(f"DEBUG: Starting Whisper transcription for job {job_id}")
        # Disable verbose=True to prevent internal whisper prints that might fail on Windows console
        # Adding an Amharic initial_prompt heavily reduces the model hallucinating English translations
        result = model.transcribe(audio_path, language="am", task="transcribe", initial_prompt="እነሆ የአማርኛ ጽሑፍ: ", verbose=False)
        print(f"DEBUG: Transcription completed for job {job_id}")
        
        # 4. Generate SRT
        jobs[job_id]["status"] = "generating_srt"
        segments = result.get("segments", [])
        srt_subtitles = []
        
        for i, segment in enumerate(segments):
            start = timedelta(seconds=segment['start'])
            end = timedelta(seconds=segment['end'])
            content = segment['text'].strip()
            
            subtitle = srt.Subtitle(index=i+1, start=start, end=end, content=content)
            srt_subtitles.append(subtitle)
        
        srt_path = os.path.join(CAPTION_DIR, f"{job_id}.srt")
        with open(srt_path, "w", encoding="utf-8") as f:
            f.write(srt.compose(srt_subtitles))
        
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
