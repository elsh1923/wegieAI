import os
from typing import Dict

# In-memory storage for processing status (Use Redis/DB for production)
jobs: Dict[str, Dict] = {}

UPLOAD_DIR = "uploads"
AUDIO_DIR = "audio"
CAPTION_DIR = "captions"
OUTPUT_DIR = "output"

# Ensure directories exist
for d in [UPLOAD_DIR, AUDIO_DIR, CAPTION_DIR, OUTPUT_DIR]:
    os.makedirs(d, exist_ok=True)
