import os
import uuid
import shutil
from typing import Dict
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import processor
from state import jobs, UPLOAD_DIR, AUDIO_DIR, CAPTION_DIR, OUTPUT_DIR

app = FastAPI(title="Amharic Video Captioning API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for initial deployment ease
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...), overlay: bool = False):
    allowed_video = ('.mp4', '.mov')
    allowed_audio = ('.mp3', '.wav', '.m4a', '.aac', '.flac')
    
    filename_lower = file.filename.lower()
    if not (filename_lower.endswith(allowed_video) or filename_lower.endswith(allowed_audio)):
        raise HTTPException(status_code=400, detail="Invalid file format. Supported: MP4, MOV, MP3, WAV, M4A, AAC, FLAC.")
    
    job_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    input_path = os.path.join(UPLOAD_DIR, f"{job_id}{file_ext}")
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    jobs[job_id] = {"status": "queued", "filename": file.filename, "overlay": overlay}
    
    # Start async processing
    background_tasks.add_task(processor.process_media, job_id, input_path, overlay)
    
    return {"job_id": job_id, "status": "queued"}

@app.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

@app.get("/download/srt/{job_id}")
async def download_srt(job_id: str):
    path = os.path.join(CAPTION_DIR, f"{job_id}.srt")
    if os.path.exists(path):
        original_filename = jobs[job_id]['filename']
        # Remove original extension (like .mp4) to avoid double extensions like .mp4.srt
        base_name = os.path.splitext(original_filename)[0]
        return FileResponse(
            path, 
            filename=f"{base_name}.srt",
            media_type="text/plain"
        )
    raise HTTPException(status_code=404, detail="SRT not found")

@app.get("/download/video/{job_id}")
async def download_video(job_id: str):
    path = os.path.join(OUTPUT_DIR, f"{job_id}.mp4")
    if os.path.exists(path):
        return FileResponse(path, filename=f"captioned_{jobs[job_id]['filename']}")
    raise HTTPException(status_code=412, detail="Video with captions not ready or not requested")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
