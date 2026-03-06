import os
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

test_file = "uploads/00ecc13f-9352-40cc-a902-36aca8c6dab2.mp4"

print(f"Testing Gemini prompt on: {test_file}")

# Upload
audio_obj = client.files.upload(file=test_file)

print("Waiting for audio processing...")
while audio_obj.state.name == "PROCESSING":
    time.sleep(2)
    audio_obj = client.files.get(name=audio_obj.name)

if audio_obj.state.name == "FAILED":
    print("Audio processing failed.")
    client.files.delete(name=audio_obj.name)
    exit(1)

# Using system_instruction instead of prompt
generation_config = types.GenerateContentConfig(
  temperature=0.0,
  max_output_tokens=2000,
  system_instruction="""
  You are an Amharic language expert. Your ONLY job is to listen to the audio and transcribe the spoken Amharic language directly into the Ge'ez script (አማርኛ ፊደል).
  
  CRITICAL RULES:
  1. The output MUST be entirely in the Ge'ez script. Example: ሰላም እንዴት ነህ
  2. You are FORBIDDEN from using Arabic, Urdu, or Persian characters (e.g. سلام اندیٹ نیہ).
  3. You are FORBIDDEN from using the Latin alphabet (e.g. Selam indet neh).
  4. DO NOT translate the Amharic into English.
  
  Format the output as a valid SRT file.
  """
)

prompt = "Transcribe the audio."

print("Starting generation...")
response = client.models.generate_content(
    model='gemini-1.5-flash',
    contents=[audio_obj, prompt],
    config=generation_config
)

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("--- OUTPUT ---")
print(response.text)
print("--------------")

client.files.delete(name=audio_obj.name)
