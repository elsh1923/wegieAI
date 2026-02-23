import requests
import time
import os
import glob

# Try to find a file to upload
audio_files = glob.glob('uploads/*.mp4') + glob.glob('audio/*.mp3')
if not audio_files:
    print("No audio/video available to test via API")
    exit(0)

test_file = audio_files[0]
print(f"Testing API with {test_file}")

with open(test_file, 'rb') as f:
    files = {'file': (os.path.basename(test_file), f, 'video/mp4')}
    response = requests.post('http://localhost:8000/upload', files=files)
    
if response.status_code != 200:
    print(f"Upload failed: {response.text}")
    print("Make sure the backend is running!")
    exit(1)

job_id = response.json()['job_id']
print(f"Upload successful. Job ID: {job_id}")

while True:
    res = requests.get(f'http://localhost:8000/status/{job_id}')
    status = res.json()['status']
    print(f"Status: {status}")
    if status == 'completed':
        print("Done!")
        break
    if status == 'failed':
        print(f"Failed: {res.json().get('error')}")
        break
    time.sleep(2)
