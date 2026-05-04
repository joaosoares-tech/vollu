'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Settings, 
  Play, 
  Scissors, 
  FileVideo, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getFFmpegWorker } from '../lib/ffmpeg';

export default function VideoToGif() {
  const t = useTranslations('VideoToGif');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [fps, setFps] = useState(15);
  const [width, setWidth] = useState(480);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError(t('errorSize'));
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setGifUrl(null);
      setError(null);
      setProgress(0);
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setEndTime(videoRef.current.duration);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      if (!workerRef.current) {
        workerRef.current = getFFmpegWorker();
      }

      const id = Math.random().toString(36).substring(7);
      const worker = workerRef.current;
      if (!worker) throw new Error("Worker failed to initialize");

      worker.onmessage = (e) => {
        const { id: msgId, type, progress, message, data } = e.data;
        if (msgId !== id) return;

        if (type === 'progress') {
          setProgress(progress * 100);
        } else if (type === 'done') {
          const blob = new Blob([data], { type: 'image/gif' });
          setGifUrl(URL.createObjectURL(blob));
          setProcessing(false);
        } else if (type === 'error') {
          setError(message || t('errorConv'));
          setProcessing(false);
        }
      };

      worker.postMessage({
        id,
        command: 'VIDEO_TO_GIF',
        data: {
          file,
          start: startTime,
          end: endTime,
          fps,
          width
        }
      });

    } catch (err: any) {
      setError(err.message || t('errorInesp'));
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 font-sans">
      {/* Action Header */}
      {file && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-3 bg-white/30 backdrop-blur-xl border border-border rounded-3xl p-6 flex flex-col md:flex-row justify-end items-center space-y-4 md:space-y-0 shadow-sm"
        >
            {!processing && !gifUrl && (
                <button 
                    onClick={handleConvert}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black flex items-center transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Play className="w-5 h-5 mr-3" />
                    {t('generateBtn')}
                </button>
            )}
        </motion.div>
      )}

      {/* Main Preview Card */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="md:col-span-2 bg-white/30 backdrop-blur-3xl border border-border rounded-[40px] p-6 overflow-hidden shadow-sm flex flex-col"
      >
        <div className="relative aspect-video bg-dark/5 rounded-[32px] overflow-hidden border border-border group flex-1">
          {previewUrl ? (
            <video 
              ref={videoRef}
              src={previewUrl} 
              onLoadedMetadata={onLoadedMetadata}
              className="w-full h-full object-contain"
              controls
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-secondary/20">
              <FileVideo className="w-20 h-20 mb-6 opacity-10" />
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black flex items-center transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                    <Upload className="w-6 h-6 mr-3" />
                    {t('uploadBtn')}
                    <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
              </label>
            </div>
          )}
          
          {processing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-8 z-30">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
              <div className="w-full max-w-xs bg-dark/5 h-2 rounded-full overflow-hidden border border-border">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                />
              </div>
              <p className="mt-6 font-mono text-blue-600 text-sm font-black">{t('processing')} {Math.round(progress)}%</p>
            </div>
          )}
        </div>

        {file && !processing && (
            <div className="mt-8 space-y-6 px-4">
                <div className="flex justify-between text-[10px] font-black text-secondary/40 uppercase tracking-widest">
                    <span>{t('segmentLabel')}</span>
                    <span className="text-blue-600 font-mono tracking-normal">{startTime.toFixed(2)}s - {endTime.toFixed(2)}s</span>
                </div>
                <div className="relative pt-2 pb-6">
                    <div className="h-2.5 bg-dark/5 rounded-full relative">
                        <div 
                            className="absolute h-full bg-blue-600/10 border-x border-blue-400/30"
                            style={{ 
                                left: `${(startTime / duration) * 100}%`, 
                                right: `${100 - (endTime / duration) * 100}%` 
                            }}
                        />
                        <input 
                            type="range" min="0" max={duration} step="0.1" 
                            value={startTime} 
                            onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime - 0.1))}
                            className="absolute inset-0 w-full h-full appearance-none bg-transparent pointer-none [&::-webkit-slider-thumb]:pointer-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none z-10"
                        />
                        <input 
                            type="range" min="0" max={duration} step="0.1" 
                            value={endTime} 
                            onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value), startTime + 0.1))}
                            className="absolute inset-0 w-full h-full appearance-none bg-transparent pointer-none [&::-webkit-slider-thumb]:pointer-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none z-10"
                        />
                    </div>
                </div>
            </div>
        )}
      </motion.div>

      {/* Settings Card */}
      <div className="flex flex-col gap-6">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/30 backdrop-blur-xl border border-border rounded-[32px] p-8 shadow-sm text-dark"
        >
          <div className="flex items-center space-x-3 mb-8">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="font-black text-xs uppercase tracking-widest">{t('settings')}</h2>
          </div>

          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-black text-secondary/40 uppercase block mb-4 tracking-widest">{t('resolutionLabel')}</label>
              <div className="flex items-center space-x-4">
                <input 
                  type="range" min="240" max="720" step="40"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="flex-1 accent-blue-600 h-1.5 bg-dark/5 rounded-full appearance-none"
                />
                <span className="font-mono text-blue-600 w-14 text-sm font-bold">{width}px</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-secondary/40 uppercase block mb-4 tracking-widest">{t('fpsLabel')}</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 20, 24].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFps(f)}
                    className={`py-3 rounded-xl text-xs font-black transition-all ${
                      fps === f 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-dark/5 text-secondary/40 hover:bg-dark/10 border border-border'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Card */}
        <AnimatePresence>
          {gifUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-xl border border-blue-200/50 rounded-[40px] p-8 flex flex-col items-center text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center mb-6 shadow-xl shadow-blue-600/30">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-black text-xl mb-2 tracking-tight">{t('success')}</h3>
              <p className="text-xs text-secondary/40 mb-8 uppercase font-bold tracking-widest">{t('paletteHint')}</p>
              
              <a 
                href={gifUrl} 
                download="vollu-converted.gif"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black flex items-center justify-center transition-all group active:scale-95 shadow-lg shadow-blue-600/20"
              >
                <Download className="w-5 h-5 mr-3" />
                {t('downloadBtn')}
              </a>
              
              <button 
                onClick={() => { setGifUrl(null); setFile(null); }}
                className="mt-6 text-[10px] font-black text-secondary/20 hover:text-red-400 uppercase tracking-widest"
              >
                {t('newBtn')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-start space-x-3"
            >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-400 font-bold leading-relaxed">{error}</p>
            </motion.div>
        )}
      </div>
    </div>
  );
}
