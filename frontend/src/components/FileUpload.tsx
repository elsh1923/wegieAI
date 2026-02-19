'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileVideo, X, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onUpload: (file: File, overlay: boolean) => void;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, status }) => {
  const [file, setFile] = useState<File | null>(null);
  const [overlay, setOverlay] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
    },
    multiple: false,
  });

  const handleUpload = () => {
    if (file) {
      onUpload(file, overlay);
    }
  };

  const removeFile = () => setFile(null);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            {...getRootProps()}
            className={`cursor-pointer group relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${
              isDragActive 
                ? 'border-accent bg-accent/5' 
                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                <Upload className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-medium text-white">
                  Drop your video here
                </p>
                <p className="text-white/50 text-sm">
                  Support MP4 and MOV formats (Max 500MB)
                </p>
              </div>
              <input {...getInputProps()} />
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
                  <FileVideo className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-white font-medium truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-white/40 text-sm">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
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
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="space-y-1">
                  <p className="font-medium text-white">Overlay Captions</p>
                  <p className="text-xs text-white/40">Directly embed Amharic text into video</p>
                </div>
                <button
                  onClick={() => setOverlay(!overlay)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                    overlay ? 'bg-accent' : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    animate={{ x: overlay ? 26 : 4 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </button>
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
                    <span>Processing...</span>
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
