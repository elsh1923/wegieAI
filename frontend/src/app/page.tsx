'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpload } from '../components/FileUpload';
import { 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Video, 
  FileType,
  ArrowRight
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

type JobStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

interface Job {
  job_id: string;
  status: string;
  filename: string;
  error?: string;
  overlay?: boolean;
}

export default function Home() {
  const [status, setStatus] = useState<JobStatus>('idle');
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [detailStatus, setDetailStatus] = useState<string>('');

  // Polling for job status
  useEffect(() => {
    let interval: any;

    if (currentJob && (status === 'processing' || status === 'uploading')) {
      const jobId = currentJob.job_id;
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/status/${jobId}`);
          const data = response.data;
          
          if (data && data.status) {
            setDetailStatus(String(data.status).replace('_', ' '));
          }

          if (data.status === 'completed') {
            setStatus('completed');
            // Auto-trigger SRT download
            const downloadUrl = `${API_BASE_URL}/download/srt/${jobId}`;
            window.location.href = downloadUrl;
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setStatus('failed');
            setCurrentJob(prev => prev ? { ...prev, error: data.error } : null);
            clearInterval(interval);
          } else {
            setStatus('processing');
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [currentJob, status]);

  const handleUpload = async (file: File, overlay: boolean) => {
    setStatus('uploading');
    setDetailStatus('uploading video');

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/upload?overlay=${overlay}`, formData);
      
      setCurrentJob({
        job_id: response.data.job_id,
        status: response.data.status,
        filename: file.name,
        overlay: overlay
      });
      setStatus('processing');
    } catch (error: any) {
      console.error('Upload error:', error);
      setStatus('failed');
      setCurrentJob({
        job_id: 'error',
        status: 'failed',
        filename: file.name,
        error: error.response?.data?.detail || 'Upload failed'
      });
    }
  };

  const reset = () => {
    setStatus('idle');
    setCurrentJob(null);
    setDetailStatus('');
  };

  return (
    <main className="min-h-screen premium-gradient relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-24">
      {/* Decorative background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 space-y-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          {/* Wegie Logo */}
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg" className="h-20 sm:h-28 w-auto drop-shadow-2xl">
              <defs>
                <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="40%" stopColor="#06b6d4"/>
                  <stop offset="70%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#ef4444"/>
                </linearGradient>
                <linearGradient id="bubbleGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.15"/>
                </linearGradient>
              </defs>

              {/* Speech bubble body */}
              <rect x="6" y="6" width="108" height="82" rx="28" ry="28" fill="url(#bubbleGrad)"/>
              {/* Bubble tail */}
              <polygon points="28,88 18,110 52,88" fill="url(#bubbleGrad)"/>
              {/* Shine overlay */}
              <rect x="6" y="6" width="108" height="82" rx="28" ry="28" fill="url(#bubbleGrad2)"/>

              {/* Play triangle */}
              <polygon points="36,30 36,68 68,49" fill="white" opacity="0.95"/>

              {/* Waveform bars */}
              <rect x="76" y="38" width="7" height="22" rx="3.5" fill="white" opacity="0.95"/>
              <rect x="88" y="29" width="7" height="40" rx="3.5" fill="white" opacity="0.95"/>
              <rect x="100" y="36" width="7" height="26" rx="3.5" fill="white" opacity="0.95"/>

              {/* "Wegie" wordmark */}
              <text
                x="136"
                y="78"
                fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
                fontWeight="700"
                fontSize="62"
                fill="#f1f5f9"
                letterSpacing="-1"
              >Wegie</text>
            </svg>
          </div>

          <p className="text-white/50 text-xl max-w-xl mx-auto font-light leading-relaxed">
            Automatically generate accurate Amharic subtitles for your videos in seconds.
          </p>
        </motion.div>

        {/* Action Area */}
        <AnimatePresence mode="wait">
          {status === 'idle' || status === 'uploading' || status === 'processing' ? (
            <motion.div
              key="upload-zone"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-8"
            >
              <FileUpload onUpload={handleUpload} status={status} />
              
              {status !== 'idle' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <div className="flex items-center space-x-3 text-white/60">
                    <Clock className="w-4 h-4 animate-pulse text-accent" />
                    <span className="capitalize">{detailStatus}...</span>
                  </div>
                  <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-accent glow"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 15, ease: "linear" }}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : status === 'completed' ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-[2rem] p-10 border border-white/10 glow space-y-10"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-green-400">
                    <CheckCircle2 className="w-8 h-8" />
                    <h2 className="text-3xl font-bold">SRT Ready</h2>
                  </div>
                  <p className="text-white/60 text-lg">Your Amharic subtitle file has been generated and download should start automatically.</p>
                </div>
                <button 
                  onClick={reset}
                  className="bg-white/5 hover:bg-white/10 px-6 py-2 rounded-2xl text-white/60 hover:text-white text-sm font-medium transition-all"
                >
                  New File
                </button>
              </div>

              {currentJob && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Download SRT Button (Primary) */}
                  <a
                    href={`${API_BASE_URL}/download/srt/${currentJob.job_id}`}
                    className="group block p-8 rounded-[2.5rem] bg-accent/10 border-2 border-accent/20 hover:border-accent/40 hover:bg-accent/20 transition-all duration-500 shadow-2xl shadow-accent/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="p-4 rounded-3xl bg-accent/20 group-hover:bg-accent group-hover:scale-110 transition-all duration-500">
                          <FileType className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-2xl text-white">Download SRT</p>
                          <p className="text-white/40 uppercase tracking-widest text-xs mt-1">UTF-8 Encoded</p>
                        </div>
                      </div>
                      <Download className="w-8 h-8 text-accent/50 group-hover:text-accent group-hover:translate-y-1 transition-all" />
                    </div>
                  </a>

                  {/* Optional Video Download (Secondary) */}
                  {currentJob.overlay && (
                    <a
                      href={`${API_BASE_URL}/download/video/${currentJob.job_id}`}
                      className="group flex items-center justify-between p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-500"
                    >
                      <div className="flex items-center space-x-6">
                        <div className="p-4 rounded-3xl bg-white/5 group-hover:bg-white/10 transition-colors">
                          <Video className="w-8 h-8 text-white/60" />
                        </div>
                        <div>
                          <p className="font-bold text-xl text-white/80">Captioned Video</p>
                          <p className="text-sm text-white/30">Optional MP4 with Overlay</p>
                        </div>
                      </div>
                      <Download className="w-6 h-6 text-white/20 group-hover:text-white transition-colors" />
                    </a>
                  )}
                </div>
              )}
              
              <button 
                onClick={reset}
                className="w-full flex items-center justify-center space-x-2 text-white/40 hover:text-accent transition-colors"
              >
                <span>Upload another video</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-[2rem] p-10 border border-red-500/20 glow space-y-6 text-center"
            >
              <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-500 mb-2">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
                <p className="text-white/40 max-w-sm mx-auto">
                  {currentJob?.error || "We couldn't process your video. Please try again or check the file format."}
                </p>
              </div>
              <button
                onClick={reset}
                className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/20 text-sm font-light"
        >
          Integrated with OpenAI Whisper • Processing Amharic Language
        </motion.p>
      </div>
    </main>
  );
}
