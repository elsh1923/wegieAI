import os
import time
from google import genai
from dotenv import load_dotenv

# Load API key
load_dotenv()
api_key = os.environ.get("GOOGLE_API_KEY")

if not api_key:
    print("Error: GOOGLE_API_KEY is not set in .env")
    exit(1)

print("Testing Gemini 1.5 Flash API connection...")
start_time = time.time()
client = genai.Client(api_key=api_key)
prompt = "Reply with exactly the word: 'Connected'."
response = client.models.generate_content(
    model="gemini-flash-latest",
    contents=prompt
)
print(f"API responds: {response.text.strip()} (took {time.time() - start_time:.2f} seconds)")
