import os
import moviepy.editor as mp
import whisper
import srt
from datetime import timedelta
from main import jobs, AUDIO_DIR, CAPTION_DIR, OUTPUT_DIR

from moviepy.video.tools.subtitles import SubtitlesClip
from moviepy.video.VideoClip import TextClip

# Load whisper model
model = whisper.load_model("base")

def process_video(job_id: str, input_path: str, overlay: bool = False):
    try:
        # 1. Update status
        jobs[job_id]["status"] = "extracting_audio"
        
        # 2. Extract Audio
        audio_path = os.path.join(AUDIO_DIR, f"{job_id}.mp3")
        video = mp.VideoFileClip(input_path)
        video.audio.write_audiofile(audio_path)
        
        # 3. Transcribe
        jobs[job_id]["status"] = "transcribing"
        # task="transcribe" or "translate". Amharic transcription requested.
        result = model.transcribe(audio_path, language="am", task="transcribe")
        
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
            generator = lambda txt: TextClip(txt, font='Arial', fontsize=24, color='white', 
                                           bg_color='black', method='caption', size=video.size)
            subtitles = SubtitlesClip(srt_path, generator)
            
            result_video = mp.CompositeVideoClip([video, subtitles.set_pos(('center', 'bottom'))])
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
        # Optionally close video to release file
        if 'video' in locals():
            video.close()
