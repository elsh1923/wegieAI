<div align="center">

# Wegie ወጌ - AI
### Amharic Subtitle Generator

[![Live Demo](https://img.shields.io/badge/Live_Demo-wegie--ai--fz1a.vercel.app-C9A24B?style=for-the-badge)](https://wegie-ai-fz1a.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)]()
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)]()

An AI-powered tool that automatically generates accurate Amharic subtitles for video and audio in seconds.

</div>

---

## 📌 The Problem
Manual transcription for Amharic is slow, labor-intensive, and highly error-prone. Traditional subtitle and transcription tools completely lack support for Amharic's complex script (Ge'ez), leaving content creators, educators, and journalists without a modern solution.

## 💡 The Solution: Wegie AI
**Wegie AI** bridges this gap by providing an automated, AI-driven transcription pipeline specifically tailored for the Amharic language. Simply upload your media, and the platform will accurately generate Amharic subtitles in a matter of seconds.

## ✨ Key Features
- **Accurate Amharic AI Transcription**: Leverages a custom AI pipeline to transcribe spoken Amharic into accurate Ge'ez script text.
- **Video & Audio Support**: 
  - 🎥 Video formats: `.mp4`, `.mov`
  - 🎵 Audio formats: `.mp3`, `.wav`, `.m4a`
- **Lightning Fast Processing**: Automated subtitle generation completed in seconds rather than hours.
- **Modern User Interface**: Clean, accessible, and responsive frontend built for ease of use.

## 🛠️ Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend / AI Processing**: Python, AI Transcription Models
- **Deployment**: Vercel (Frontend), Docker Supported

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and Python installed, or use Docker.

### Standard Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/elsh1923/wegieAI.git
   cd wegieAI
   ```

2. **Frontend Setup (Next.js):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

3. **Backend Setup (Python):**
   ```bash
   cd backend
   python -m venv venv
   # Windows: venv\Scripts\activate
   # macOS/Linux: source venv/bin/activate
   pip install -r requirements.txt
   python main.py
   ```

### 🐳 Running with Docker

#### Frontend (Next.js)
The frontend uses a multi-stage Docker build for an optimized standalone deployment.
```bash
cd frontend
docker build -t wegieai-frontend .
docker run -p 3000:3000 -d wegieai-frontend
```

#### Backend (Python)
The backend also includes its own `Dockerfile`.
```bash
cd backend
docker build -t wegieai-backend .
docker run -p 8000:8000 -d wegieai-backend
```

## 🌍 Links & Contact
- **Live Platform**: [https://wegie-ai-fz1a.vercel.app/](https://wegie-ai-fz1a.vercel.app/)
- **Developer**: Elshaday Dagne Demessie ([Portfolio](https://github.com/elsh1923/portfoliowebsite))
- **Email**: [elshadaydagne480@gmail.com](mailto:elshadaydagne480@gmail.com)
