'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Play, 
  Pause, 
  Scissors, 
  Music, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ZoomIn,
  Activity
} from 'lucide-react';
import { getFFmpegWorker } from '../lib/ffmpeg';

export default function Mp3Cutter() {
  const t = useTranslations('Mp3Cutter');
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fadeIn, setFadeIn] = useState(1);
  const [fadeOut, setFadeOut] = useState(1);
  const [format, setFormat] = useState<'mp3' | 'wav'>('mp3');
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<any>(null);
  const workerRef = useRef<Worker | null>(null);

  const initWavesurfer = useCallback((url: string) => {
    if (!waveformRef.current) return;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#3b82f6',
      progressColor: '#22d3ee',
      cursorColor: '#22d3ee',
      barWidth: 2,
      barRadius: 3,
      height: 120,
      plugins: []
    });

    const regions = ws.registerPlugin(RegionsPlugin.create());
    regionsRef.current = regions;

    ws.load(url);

    ws.on('ready', () => {
      regions.addRegion({
        start: 0,
        end: ws.getDuration() * 0.5,
        color: 'rgba(34, 211, 238, 0.2)',
        drag: true,
        resize: true,
      });
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));

    wavesurferRef.current = ws;
  }, []);

  useEffect(() => {
    return () => {
      wavesurferRef.current?.destroy();
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.zoom(zoom);
    }
  }, [zoom]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResultUrl(null);
      setError(null);
      const url = URL.createObjectURL(selectedFile);
      initWavesurfer(url);
    }
  };

  const handlePlaySelection = () => {
    const region = regionsRef.current.getRegions()[0];
    if (region && wavesurferRef.current) {
      region.play();
    }
  };

  const handleCut = async () => {
    if (!file || !regionsRef.current) return;
    const region = regionsRef.current.getRegions()[0];
    if (!region) return;

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
        const { id: msgId, type, progress, message, data, mimeType } = e.data;
        if (msgId !== id) return;

        if (type === 'progress') {
          setProgress(progress * 100);
        } else if (type === 'done') {
          const blob = new Blob([data], { type: mimeType });
          setResultUrl(URL.createObjectURL(blob));
          setProcessing(false);
        } else if (type === 'error') {
          setError(message || t('errorConv'));
          setProcessing(false);
        }
      };

      worker.postMessage({
        id,
        command: 'CUT_AUDIO',
        data: {
          file,
          start: region.start,
          end: region.end,
          format,
          fadeIn,
          fadeOut
        }
      });

    } catch (err: any) {
      setError(err.message || t('errorInesp'));
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 font-sans">
      {/* Actions Card */}
      {file && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-3 bg-white/30 backdrop-blur-xl border border-border rounded-3xl p-6 flex flex-col md:flex-row justify-end items-center space-y-4 md:space-y-0 shadow-sm"
        >
            <div className="flex space-x-3">
                <button 
                onClick={handlePlaySelection}
                className="bg-dark/5 hover:bg-dark/10 text-dark px-6 py-4 rounded-2xl font-bold flex items-center transition-all active:scale-95 border border-border"
                >
                <Play className="w-5 h-5 mr-2" />
                {t('playSelection')}
                </button>
                <button 
                onClick={handleCut}
                disabled={processing}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black flex items-center transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scissors className="w-5 h-5 mr-2" />}
                {t('cutBtn')}
                </button>
            </div>
        </motion.div>
      )}

      {/* Waveform Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="md:col-span-2 bg-white/30 backdrop-blur-3xl border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2 text-blue-600">
            <Activity className="w-5 h-5" />
            <span className="font-bold uppercase text-xs tracking-widest">{t('visualizerLabel')}</span>
          </div>
          <div className="flex items-center space-x-4">
            <ZoomIn className="w-4 h-4 text-secondary/40" />
            <input 
              type="range" min="1" max="100" 
              value={zoom} 
              onChange={(e) => setZoom(parseInt(e.target.value))}
              className="w-32 accent-blue-600 h-1.5 bg-dark/5 rounded-full appearance-none"
            />
          </div>
        </div>

        <div ref={waveformRef} className="w-full relative z-10" />
        
        {!file && (
            <div className="h-[120px] flex flex-col items-center justify-center text-secondary/20">
                <Music className="w-12 h-12 mb-4 opacity-10" />
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black flex items-center transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                    <Upload className="w-5 h-5 mr-3" />
                    {t('selectingAudio')}
                    <input type="file" className="hidden" accept="audio/*" onChange={handleFileChange} />
                </label>
            </div>
        )}

        {processing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <div className="w-48 bg-dark/5 h-1.5 rounded-full overflow-hidden border border-border">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                />
            </div>
            <p className="mt-4 font-mono text-blue-600 text-xs text-center font-bold">{t('processing')} {Math.round(progress)}%</p>
          </div>
        )}
      </motion.div>

      {/* Controls Card */}
      <div className="flex flex-col gap-6">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/30 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-sm"
        >
          <h3 className="font-black text-xs uppercase tracking-widest text-blue-600 mb-6 flex items-center">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
            {t('settings')}
          </h3>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase text-secondary/40 mb-3 tracking-tighter">
                <span>{t('fadeIn')}</span>
                <span className="text-blue-600">{fadeIn}s</span>
              </div>
              <input 
                type="range" min="0" max="5" step="0.5"
                value={fadeIn}
                onChange={(e) => setFadeIn(parseFloat(e.target.value))}
                className="w-full accent-blue-600 bg-dark/5 rounded-lg appearance-none h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-black uppercase text-secondary/40 mb-3 tracking-tighter">
                <span>{t('fadeOut')}</span>
                <span className="text-blue-600">{fadeOut}s</span>
              </div>
              <input 
                type="range" min="0" max="5" step="0.5"
                value={fadeOut}
                onChange={(e) => setFadeOut(parseFloat(e.target.value))}
                className="w-full accent-blue-600 bg-dark/5 rounded-lg appearance-none h-1.5"
              />
            </div>

            <div>
                <label className="text-[10px] font-black uppercase text-secondary/40 mb-3 block tracking-tighter">{t('formatLabel')}</label>
                <div className="grid grid-cols-2 gap-2">
                    {['mp3', 'wav'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFormat(f as any)}
                            className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${
                                format === f 
                                ? 'bg-blue-600 text-white shadow-md' 
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

        {/* Download Result Card */}
        <AnimatePresence>
          {resultUrl && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-xl border border-blue-200/50 rounded-3xl p-6 shadow-sm"
            >
              <div className="flex items-center space-x-3 mb-6">
                 <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                 </div>
                 <span className="font-black uppercase text-[10px] tracking-widest text-blue-600">{t('readyDownload')}</span>
              </div>
              
              <a 
                href={resultUrl} 
                download={`vollu-cut.${format}`}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('downloadBtn')}
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start space-x-2 text-red-500 text-xs font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
            </div>
        )}
      </div>
    </div>
  );
}
