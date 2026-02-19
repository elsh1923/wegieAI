# Amharic Video Captioning Backend

This is a FastAPI backend that transcribes Amharic audio from videos and generates SRT files.

## Prerequisites

- **Python 3.8+**
- **FFmpeg**: Required for MoviePy and Whisper. [Download FFmpeg](https://ffmpeg.org/download.html)
- **ImageMagick**: Required for MoviePy's `TextClip` (if you want to overlay captions). [Download ImageMagick](https://imagemagick.org/script/download.php)

## Setup

1. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`.

## API Endpoints

- `POST /upload?overlay=true`: Upload MP4/MOV video. Returns a `job_id`.
- `GET /status/{job_id}`: Check processing status.
- `GET /download/srt/{job_id}`: Download the generated SRT file.
- `GET /download/video/{job_id}`: Download the video with overlay captions (if requested).
