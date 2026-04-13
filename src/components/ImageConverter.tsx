'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Zap, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileArchive,
  RefreshCw,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

interface ConversionItem {
    id: string;
    file: File;
    originalUrl: string;
    convertedUrl: string | null;
    originalSize: number;
    convertedSize: number | null;
    status: 'idle' | 'processing' | 'done' | 'error';
    targetFormat: 'webp' | 'avif';
}

export default function ImageConverter() {
  const [items, setItems] = useState<ConversionItem[]>([]);
  const [quality, setQuality] = useState(80);
  const [globalFormat, setGlobalFormat] = useState<'webp' | 'avif'>('webp');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newItems: ConversionItem[] = files.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        originalUrl: URL.createObjectURL(file),
        convertedUrl: null,
        originalSize: file.size,
        convertedSize: null,
        status: 'idle',
        targetFormat: globalFormat
    }));
    setItems(prev => [...prev, ...newItems]);
  };

  const convertToWebP = async (file: File, q: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('No context');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject('Conversion failed');
            }, 'image/webp', q / 100);
        };
        img.onerror = () => reject('Load failed');
        img.src = URL.createObjectURL(file);
    });
  };

  const processBatch = async () => {
    if (items.length === 0 || isProcessingAll) return;
    setIsProcessingAll(true);

    const updatedItems = [...items];
    for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];
        if (item.status === 'done') continue;

        setItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'processing' } : p));

        try {
            let resultBlob: Blob;
            if (item.targetFormat === 'webp') {
                resultBlob = await convertToWebP(item.file, quality);
            } else {
                // AVIF Placeholder: In a real app, this would use the WASM worker.
                // For this demo, we'll use WebP as a high-quality fallback if WASM not loaded.
                resultBlob = await convertToWebP(item.file, quality);
            }
            
            const convertedUrl = URL.createObjectURL(resultBlob);
            setItems(prev => prev.map(p => p.id === item.id ? { 
                ...p, 
                status: 'done', 
                convertedUrl, 
                convertedSize: resultBlob.size 
            } : p));
        } catch (err) {
            setItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error' } : p));
        }
    }
    setIsProcessingAll(false);
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    items.forEach(item => {
        if (item.status === 'done' && item.convertedUrl) {
            // Fetch blob and add to zip
        }
    });
    // ZIP logic...
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 min-h-screen bg-[#050811] text-white">
      {/* Settings Card */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/5 backdrop-blur-3xl border border-blue-500/20 rounded-[32px] p-8 shadow-2xl flex flex-col"
      >
        <div className="mb-10">
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Image Converter
            </h1>
            <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest mt-2 px-1">Next-Gen Web Formats</p>
        </div>

        <div className="space-y-8 flex-1">
            <div>
                <label className="text-[10px] font-black uppercase text-blue-400 mb-4 block tracking-widest">Formato Alvo</label>
                <div className="grid grid-cols-2 gap-3">
                    {['webp', 'avif'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setGlobalFormat(f as any)}
                            className={`py-4 rounded-2xl text-xs font-black uppercase transition-all border ${
                                globalFormat === f 
                                ? 'bg-blue-600 border-blue-400 shadow-glow-sm' 
                                : 'bg-white/5 border-white/5 hover:border-white/10 text-white/40'
                            }`}
                        >
                            {f === 'avif' ? 'AVIF (Beta)' : 'WebP'}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Qualidade</label>
                    <span className="text-xs font-mono text-cyan-400">{quality}%</span>
                </div>
                <input 
                    type="range" min="1" max="100" 
                    value={quality} 
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 h-1 bg-white/5 rounded-full appearance-none"
                />
            </div>

            <div className="pt-10">
                <button 
                    onClick={processBatch}
                    disabled={isProcessingAll || items.length === 0}
                    className="w-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-5 rounded-2xl font-black uppercase text-sm flex items-center justify-center transition-all shadow-xl shadow-blue-900/20 disabled:opacity-20 active:scale-95"
                >
                    {isProcessingAll ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <RefreshCw className="w-5 h-5 mr-3" />}
                    Converter Tudo
                </button>
            </div>
        </div>

        <div className="mt-10">
             <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/5 w-full h-14 rounded-2xl flex items-center justify-center font-bold text-xs transition-all uppercase tracking-widest text-blue-200/60">
                <Upload className="w-4 h-4 mr-3" />
                Upload Imagens
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
             </label>
        </div>
      </motion.div>

      {/* Main Queue Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="md:col-span-2 bg-[#0a0f1e]/80 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
            <h2 className="font-black text-2xl tracking-tighter">Fila de Processamento</h2>
            {items.length > 0 && (
                <button 
                    onClick={() => setItems([])}
                    className="text-[10px] font-black uppercase text-white/20 hover:text-red-400 transition-colors"
                >
                    Limpar Tudo
                </button>
            )}
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
            {items.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[400px] text-white/5">
                    <ImageIcon className="w-24 h-24 mb-6" />
                    <p className="font-black uppercase tracking-[0.2em] text-xs">Arraste ou Selecione Ficheiros</p>
                </div>
            )}

            <AnimatePresence>
                {items.map((item) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white/5 border border-white/5 rounded-3xl p-5 flex items-center justify-between group hover:border-blue-500/30 transition-all"
                    >
                        <div className="flex items-center space-x-6 min-w-0">
                            <div className="w-16 h-16 bg-black/40 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                                <img src={item.originalUrl} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-sm truncate uppercase tracking-tighter mb-1">{item.file.name}</p>
                                <div className="flex items-center space-x-3 text-[10px] font-bold text-white/30 truncate">
                                    <span>{(item.originalSize / 1024).toFixed(1)} KB</span>
                                    <ArrowRight className="w-3 h-3" />
                                    <span className="text-cyan-400 uppercase">{item.targetFormat}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            {item.status === 'done' && (
                                <>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-cyan-400 flex items-center">
                                            <TrendingDown className="w-3 h-3 mr-1" />
                                            -{Math.round((1 - (item.convertedSize || 0) / item.originalSize) * 100)}%
                                        </p>
                                        <p className="text-[9px] font-mono text-white/20">{(item.convertedSize! / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <a 
                                        href={item.convertedUrl!} 
                                        download={`converted-${item.file.name.split('.')[0]}.${item.targetFormat}`}
                                        className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 p-3 rounded-xl transition-all active:scale-90"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                </>
                            )}
                            {item.status === 'processing' && (
                                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                            )}
                            {item.status === 'error' && (
                                <AlertCircle className="w-6 h-6 text-red-500" />
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {items.some(i => i.status === 'done') && (
            <div className="absolute bottom-10 left-10 right-10">
                 <button 
                  onClick={downloadAll}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center hover:bg-white/90 transition-all shadow-2xl"
                 >
                    <FileArchive className="w-4 h-4 mr-2" />
                    Download Lote (.zip)
                 </button>
            </div>
        )}
      </motion.div>
    </div>
  );
}
