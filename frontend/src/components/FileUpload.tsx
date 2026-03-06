'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileVideo, X, CheckCircle2, Loader2, Music, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onUpload: (file: File, overlay: boolean) => void;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, status }) => {
  const [file, setFile] = useState<File | null>(null);
  const [overlay, setOverlay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB limit
  const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB warning

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File is too large. Maximum size is 200MB.");
        setFile(null);
      } else {
        setError(null);
        setFile(selectedFile);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/x-m4a': ['.m4a'],
      'audio/aac': ['.aac'],
      'audio/flac': ['.flac'],
    },
    multiple: false,
  });

  const handleUpload = () => {
    if (file) {
      onUpload(file, overlay);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              {...getRootProps()}
              className={`cursor-pointer group relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${
                isDragActive 
                  ? 'border-accent bg-accent/5' 
                  : error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
                <div className={`p-4 rounded-2xl ${error ? 'bg-red-500/10' : 'bg-white/5 group-hover:bg-white/10'} transition-colors`}>
                  <Upload className={`w-8 h-8 ${error ? 'text-red-500' : 'text-accent'} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-medium text-white">
                    {error || 'Drop your media here'}
                  </p>
                  <p className="text-white/50 text-sm">
                    {error ? 'Please choose a smaller file' : 'Support Video (MP4, MOV) and Audio (MP3, WAV, M4A)'}
                  </p>
                </div>
                <input {...getInputProps()} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-selected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-6 border border-white/10 glow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-accent/20">
                  {file.type.startsWith('video/') ? (
                    <FileVideo className="w-6 h-6 text-accent" />
                  ) : (
                    <Music className="w-6 h-6 text-accent" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className={`text-sm ${file.size > LARGE_FILE_THRESHOLD ? 'text-yellow-400 font-medium' : 'text-white/40'}`}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB 
                    {file.size > LARGE_FILE_THRESHOLD && " • Large file"}
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                disabled={status !== 'idle'}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all disabled:opacity-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-8 space-y-6">
              {file.size > LARGE_FILE_THRESHOLD && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-start space-x-3 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/80 text-sm"
                >
                  <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p>
                    This is a large file. High-resolution videos might take longer to upload and process. For faster results, consider using audio-only files.
                  </p>
                </motion.div>
              )}

              <div className="hidden">
                 <button onClick={() => setOverlay(!overlay)} />
              </div>

              <button
                onClick={handleUpload}
                disabled={status !== 'idle'}
                className="w-full py-4 rounded-2xl bg-accent text-white font-bold text-lg hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {status === 'idle' ? (
                  <>
                    <span>Generate Captions</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{status === 'uploading' ? 'Uploading...' : 'Processing...'}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
