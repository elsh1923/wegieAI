import sys
try:
    import fastapi
    print("fastapi OK")
    import uvicorn
    print("uvicorn OK")
    import whisper
    print("whisper OK")
    import moviepy
    print("moviepy OK")
    import imageio_ffmpeg
    print("imageio_ffmpeg OK")
    print("All imports SUCCESSFUL")
except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
