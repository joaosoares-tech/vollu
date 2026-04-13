'use client';

import React, { useState, useRef, useEffect } from 'react';
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
    // Cleanup worker on unmount
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit for browser RAM safety
        setError("Ficheiro demasiado grande para o browser (Máx 100MB)");
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
          setError(message || "Erro na conversão");
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
      setError(err.message || "Erro inesperado");
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 min-h-screen bg-[#020617] text-white font-sans">
      {/* Header / Intro Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 shadow-2xl shadow-blue-500/10"
      >
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            VOLLU Video to GIF
          </h1>
          <p className="text-blue-200/60 mt-2 font-medium">Conversão de alta qualidade 100% no cliente.</p>
        </div>
        <div className="flex space-x-2">
            {!file && (
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Video
                    <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                </label>
            )}
            {file && !processing && !gifUrl && (
                <button 
                    onClick={handleConvert}
                    className="bg-cyan-500 hover:bg-cyan-400 text-[#020617] px-8 py-3 rounded-2xl font-black flex items-center transition-all shadow-lg shadow-cyan-500/30 active:scale-95"
                >
                    <Play className="w-5 h-5 mr-2" />
                    Gerar GIF
                </button>
            )}
        </div>
      </motion.div>

      {/* Main Preview Card */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 overflow-hidden shadow-xl"
      >
        <div className="relative aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/5 group">
          {previewUrl ? (
            <video 
              ref={videoRef}
              src={previewUrl} 
              onLoadedMetadata={onLoadedMetadata}
              className="w-full h-full object-contain"
              controls
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-blue-200/20">
              <FileVideo className="w-16 h-16 mb-4" />
              <p>Esperando vídeo...</p>
            </div>
          )}
          
          {processing && (
            <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm flex flex-col items-center justify-center p-8">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
              <div className="w-full max-w-xs bg-white/10 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                />
              </div>
              <p className="mt-4 font-mono text-cyan-400 text-sm">PROCESSANDO... {Math.round(progress)}%</p>
              <p className="text-white/40 text-xs mt-2 uppercase tracking-widest font-bold">Gerando paleta de cores & otimizando frames</p>
            </div>
          )}
        </div>

        {file && !processing && (
            <div className="mt-6 space-y-6 px-4">
                <div className="flex justify-between text-sm font-bold text-blue-200/40 uppercase tracking-tighter">
                    <span>Corte de Tempo</span>
                    <span className="text-cyan-400 font-mono tracking-normal">{startTime.toFixed(2)}s - {endTime.toFixed(2)}s</span>
                </div>
                <div className="relative pt-1 pb-4">
                    <div className="h-2 bg-white/5 rounded-full relative">
                        {/* Selected Range */}
                        <div 
                            className="absolute h-full bg-cyan-500/20 border-x border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                            style={{ 
                                left: `${(startTime / duration) * 100}%`, 
                                right: `${100 - (endTime / duration) * 100}%` 
                            }}
                        />
                        {/* Sliders Overlay */}
                        <input 
                            type="range" min="0" max={duration} step="0.1" 
                            value={startTime} 
                            onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime - 0.1))}
                            className="absolute inset-0 w-full h-full appearance-none bg-transparent pointer-none [&::-webkit-slider-thumb]:pointer-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none z-10"
                        />
                        <input 
                            type="range" min="0" max={duration} step="0.1" 
                            value={endTime} 
                            onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value), startTime + 0.1))}
                            className="absolute inset-0 w-full h-full appearance-none bg-transparent pointer-none [&::-webkit-slider-thumb]:pointer-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none z-10"
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
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-xl uppercase tracking-tighter">Definições</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-blue-200/40 uppercase block mb-3">Resolução (Largura)</label>
              <div className="flex items-center space-x-4">
                <input 
                  type="range" min="240" max="720" step="40"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="font-mono text-blue-400 w-12">{width}px</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-blue-200/40 uppercase block mb-3">Frames por Segundo (FPS)</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 20, 24].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFps(f)}
                    className={`py-2 rounded-xl text-sm font-bold transition-all ${
                      fps === f 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Download / Final Result Card */}
        <AnimatePresence>
          {gifUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-cyan-400/30 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-400/20">
                <CheckCircle2 className="w-10 h-10 text-[#020617]" />
              </div>
              <h3 className="font-bold text-lg mb-2 capitalize">Conversão Concluída!</h3>
              <p className="text-sm text-blue-200/60 mb-6">O seu GIF está pronto com paleta otimizada.</p>
              
              <a 
                href={gifUrl} 
                download="vollu-converted.gif"
                className="w-full bg-cyan-400 hover:bg-cyan-300 text-[#020617] py-4 rounded-2xl font-black flex items-center justify-center transition-all group active:scale-95"
              >
                <Download className="w-5 h-5 mr-2 group-hover:bounce" />
                Download GIF
              </a>
              
              <button 
                onClick={() => setGifUrl(null)}
                className="mt-4 text-xs font-bold text-white/30 hover:text-white uppercase"
              >
                Limpar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start space-x-3"
            >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-400 font-medium">{error}</p>
            </motion.div>
        )}
      </div>
    </div>
  );
}
