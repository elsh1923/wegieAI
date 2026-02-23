import whisper
import time

print("Testing Whisper model loading...")
start_time = time.time()
try:
    model = whisper.load_model("small")
    print(f"Model loaded successfully in {time.time() - start_time:.2f} seconds")
except Exception as e:
    print(f"Error loading model: {e}")
