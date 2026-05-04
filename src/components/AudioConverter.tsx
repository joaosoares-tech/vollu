'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  RotateCw, 
  Music, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { getFFmpegWorker } from '../lib/ffmpeg';

interface ConversionItem {
  id: string;
  file: File;
  status: 'idle' | 'processing' | 'done' | 'error';
  progress: number;
  resultUrl?: string;
  format?: string;
  error?: string;
}

export default function AudioConverter() {
  const t = useTranslations('AudioConverter');
  const [items, setItems] = useState<ConversionItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<'mp3' | 'wav' | 'ogg'>('mp3');
  const [bitrate, setBitrate] = useState('192k');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const processFiles = (files: File[]) => {
    const newItems: ConversionItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'idle',
      progress: 0
    }));
    setItems(prev => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/'));
    processFiles(files);
  };

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const processQueue = async () => {
    if (items.length === 0 || isProcessingAll) return;
    
    setIsProcessingAll(true);
    setGlobalProgress(0);

    if (!workerRef.current) {
        workerRef.current = getFFmpegWorker();
    }

    const idleItems = items.filter(i => i.status === 'idle');
    let completedCount = 0;
    const worker = workerRef.current;
    if (!worker) return setIsProcessingAll(false);

    for (const item of idleItems) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' } : i));

      const response = await new Promise<any>((resolve) => {
        worker.onmessage = (e) => {
          const { id: msgId, type, progress, message, data, mimeType } = e.data;
          if (msgId !== item.id) return;

          if (type === 'progress') {
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, progress: progress * 100 } : i));
          } else if (type === 'done' || type === 'error') {
            resolve(e.data);
          }
        };

        worker.postMessage({
          id: item.id,
          command: 'CONVERT_AUDIO',
          data: {
            file: item.file,
            format: targetFormat,
            bitrate: targetFormat === 'mp3' ? bitrate : undefined
          }
        });
      });

      if (response.type === 'done') {
        const blob = new Blob([response.data], { type: response.mimeType });
        setItems(prev => prev.map(i => i.id === item.id ? { 
          ...i, 
          status: 'done', 
          resultUrl: URL.createObjectURL(blob),
          format: targetFormat,
          progress: 100 
        } : i));
      } else {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', error: response.error } : i));
      }

      completedCount++;
      setGlobalProgress((completedCount / idleItems.length) * 100);
    }

    setIsProcessingAll(false);
  };

  return (
    <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 transition-colors font-sans text-dark`}
    >
      {/* Sidebar Controls */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/30 backdrop-blur-xl border border-border rounded-[40px] p-8 flex flex-col shadow-sm"
      >
        <div className="space-y-10 flex-1">
          <div>
            <label className="text-[10px] font-black text-blue-600 uppercase mb-5 block tracking-[0.2em]">{t('formatLabel')}</label>
            <div className="grid grid-cols-3 gap-2">
              {['mp3', 'wav', 'ogg'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTargetFormat(f as any)}
                  className={`py-4 rounded-2xl text-xs font-black uppercase transition-all border ${
                    targetFormat === f 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-glow-sm' 
                    : 'bg-white/40 border-border hover:border-blue-200 text-secondary/40'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {targetFormat === 'mp3' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <label className="text-[10px] font-black text-blue-600 uppercase mb-5 block tracking-[0.2em]">{t('bitrateLabel')}</label>
              <div className="grid grid-cols-2 gap-2">
                {['128k', '192k', '256k', '320k'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBitrate(b)}
                    className={`py-4 rounded-xl text-xs font-mono transition-all border ${
                      bitrate === b 
                      ? 'bg-dark text-white border-dark shadow-lg' 
                      : 'bg-dark/5 text-secondary/40 border-transparent hover:bg-dark/10'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="pt-10 border-t border-border/50">
            <button 
              onClick={processQueue}
              disabled={isProcessingAll || items.filter(i => i.status === 'idle').length === 0}
              className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white py-5 rounded-[24px] font-black uppercase text-sm flex items-center justify-center transition-all shadow-xl shadow-blue-900/20 disabled:opacity-20 active:scale-95"
            >
              {isProcessingAll ? <Loader2 className="w-6 h-6 animate-spin" /> : <RotateCw className="w-6 h-6 mr-3" />}
              {t('convertBtn')}
            </button>
          </div>
        </div>

        <div className="mt-10">
              <label className="cursor-pointer bg-dark/5 hover:bg-dark/10 border border-border w-full h-14 rounded-2xl flex items-center justify-center font-bold text-xs transition-all uppercase tracking-widest text-secondary/40">
                <Upload className="w-4 h-4 mr-3" />
                {t('uploadBtn')}
                <input type="file" className="hidden" multiple accept="audio/*" onChange={handleFileChange} />
             </label>
        </div>
      </motion.div>

      {/* Main Queue Management */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-2 bg-white/30 backdrop-blur-xl border border-border rounded-[48px] p-8 flex flex-col shadow-sm relative overflow-hidden h-[700px]"
      >
        <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-6">
          <h2 className="font-black text-2xl tracking-tighter flex items-center">
            {t('queueTitle')}
            <span className="ml-4 bg-blue-600/10 text-blue-600 text-[10px] px-3 py-1 rounded-full font-black uppercase">{t('itemsCount', { count: items.length })}</span>
          </h2>
          {items.length > 0 && (
              <button 
                onClick={() => setItems([])}
                className="text-[10px] font-black uppercase text-secondary/20 hover:text-red-500 transition-colors"
              >
                {t('clearBtn')}
              </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
          {items.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-secondary/10 space-y-6">
              <FileAudio className="w-32 h-32 opacity-5" />
              <p className="font-black uppercase tracking-[0.3em] text-xs">{t('dropHint')}</p>
            </div>
          )}

          <AnimatePresence>
            {items.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/40 border border-border/50 rounded-3xl p-5 flex items-center group hover:border-blue-500/30 transition-all shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                        <Music className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-black text-sm truncate text-dark uppercase tracking-tighter">{item.file.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-secondary/30 ml-14">
                    <span>{Math.round(item.file.size / 1024)} KB</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-blue-600 font-bold">{targetFormat}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 pl-4">
                  {item.status === 'processing' && (
                    <div className="flex flex-col items-end w-32">
                       <span className="text-[10px] font-mono text-blue-600 mb-2 font-bold">{Math.round(item.progress)}%</span>
                       <div className="w-full bg-dark/5 h-1.5 rounded-full overflow-hidden border border-border/50">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                          />
                       </div>
                    </div>
                  )}

                  {item.status === 'done' && (
                    <div className="flex items-center space-x-3">
                       <div className="text-right mr-2 hidden md:block">
                           <p className="text-[10px] font-black uppercase text-green-500">{t('doneStatus')}</p>
                           <p className="text-[9px] font-mono text-secondary/20">{t('optimized')}</p>
                       </div>
                       <CheckCircle2 className="w-6 h-6 text-green-500" />
                       <a 
                        href={item.resultUrl} 
                        download={`vollu-${item.file.name.split('.')[0]}.${item.format}`}
                        className="bg-blue-600/10 hover:bg-blue-600/30 text-blue-600 p-3 rounded-xl transition-all active:scale-90"
                       >
                         <Download className="w-5 h-5" />
                       </a>
                    </div>
                  )}

                  {item.status === 'idle' && (
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-secondary/20 hover:text-red-500 transition-colors p-3"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}

                  {item.status === 'error' && (
                    <div className="flex items-center gap-2 text-red-500">
                        <span className="text-[10px] font-black uppercase">{t('error')}</span>
                        <AlertCircle className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {isProcessingAll && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-dark/5">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${globalProgress}%` }}
              className="h-full bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
             />
          </div>
        )}
      </motion.div>
    </div>
  );
}
