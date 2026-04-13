'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Play, 
  RotateCw, 
  Music, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Trash2,
  ChevronRight,
  Settings2
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
  const [items, setItems] = useState<ConversionItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<'mp3' | 'wav' | 'ogg'>('mp3');
  const [bitrate, setBitrate] = useState('192k');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newItems: ConversionItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'idle',
      progress: 0
    }));
    setItems(prev => [...prev, ...newItems]);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 min-h-screen bg-[#0a0f1e] text-white font-sans">
      {/* Sidebar Controls */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col shadow-2xl"
      >
        <div className="mb-10">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Audio Converter
          </h1>
          <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest mt-2">Versão 1.0 • WASM Core</p>
        </div>

        <div className="space-y-8 flex-1">
          <div>
            <label className="text-xs font-black text-blue-400 uppercase mb-4 block tracking-tighter">Formato de Saída</label>
            <div className="grid grid-cols-3 gap-2">
              {['mp3', 'wav', 'ogg'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTargetFormat(f as any)}
                  className={`py-3 rounded-2xl text-xs font-bold uppercase transition-all ${
                    targetFormat === f 
                    ? 'bg-blue-600 border border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                    : 'bg-white/5 border border-white/5 hover:border-white/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {targetFormat === 'mp3' && (
            <div>
              <label className="text-xs font-black text-blue-400 uppercase mb-4 block tracking-tighter">Bitrate (Qualidade)</label>
              <div className="grid grid-cols-2 gap-2">
                {['128k', '192k', '256k', '320k'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBitrate(b)}
                    className={`py-3 rounded-xl text-xs font-mono transition-all ${
                      bitrate === b 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white/5 text-white/30'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-10 border-t border-white/5">
            <button 
              onClick={processQueue}
              disabled={isProcessingAll || items.filter(i => i.status === 'idle').length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-5 rounded-2xl font-black flex items-center justify-center transition-all shadow-xl shadow-blue-900/40 disabled:opacity-50 active:scale-95"
            >
              {isProcessingAll ? <Loader2 className="w-6 h-6 animate-spin" /> : <RotateCw className="w-6 h-6 mr-3" />}
              Converter Tudo
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Queue Management */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-xl flex items-center">
            Fila de Conversão
            <span className="ml-3 bg-blue-500/20 text-blue-400 text-[10px] px-2 py-1 rounded-full">{items.length} Ficheiros</span>
          </h2>
          <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center">
             <Upload className="w-4 h-4 mr-2" />
             Adicionar
             <input type="file" className="hidden" multiple accept="audio/*" onChange={handleFileChange} />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {items.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-4">
              <FileAudio className="w-20 h-20" />
              <p className="font-black uppercase tracking-widest text-sm">Arraste ficheiros ou clique em Adicionar</p>
            </div>
          )}

          <AnimatePresence>
            {items.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center group hover:border-blue-500/30 transition-all shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <Music className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="font-bold text-sm truncate">{item.file.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-tighter text-white/40">
                    <span>{Math.round(item.file.size / 1024)} KB</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-blue-400">{targetFormat}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 pl-4">
                  {item.status === 'processing' && (
                    <div className="flex flex-col items-end w-24">
                       <span className="text-[10px] font-mono text-cyan-400 mb-1">{Math.round(item.progress)}%</span>
                       <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            className="h-full bg-cyan-400"
                          />
                       </div>
                    </div>
                  )}

                  {item.status === 'done' && (
                    <div className="flex items-center space-x-2">
                       <CheckCircle2 className="w-5 h-5 text-green-500" />
                       <a 
                        href={item.resultUrl} 
                        download={`vollu-${item.file.name.split('.')[0]}.${item.format}`}
                        className="bg-green-500/20 hover:bg-green-500/40 text-green-400 p-2 rounded-lg transition-all"
                       >
                         <Download className="w-4 h-4" />
                       </a>
                    </div>
                  )}

                  {item.status === 'idle' && (
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-white/20 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {item.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {isProcessingAll && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${globalProgress}%` }}
              className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
             />
          </div>
        )}
      </motion.div>
    </div>
  );
}
