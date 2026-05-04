'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
    convertedBlob: Blob | null;
    originalSize: number;
    convertedSize: number | null;
    status: 'idle' | 'processing' | 'done' | 'error';
    targetFormat: 'webp' | 'avif';
}

export default function ImageConverter() {
  const t = useTranslations('ImageConverter');
  const [items, setItems] = useState<ConversionItem[]>([]);
  const [quality, setQuality] = useState(80);
  const [globalFormat, setGlobalFormat] = useState<'webp' | 'avif'>('webp');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const processFiles = (files: File[]) => {
    const newItems: ConversionItem[] = files.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        originalUrl: URL.createObjectURL(file),
        convertedUrl: null,
        convertedBlob: null,
        originalSize: file.size,
        convertedSize: null,
        status: 'idle',
        targetFormat: globalFormat
    }));
    setItems(prev => [...prev, ...newItems]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
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
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    processFiles(files);
  };

  const convertImage = async (file: File, format: 'webp' | 'avif', q: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('No context');
            ctx.drawImage(img, 0, 0);
            
            const mimeType = `image/${format}`;
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                }
                else reject('Conversion failed');
            }, mimeType, q / 100);
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
            const resultBlob = await convertImage(item.file, item.targetFormat, quality);
            
            const convertedUrl = URL.createObjectURL(resultBlob);
            setItems(prev => prev.map(p => p.id === item.id ? { 
                ...p, 
                status: 'done', 
                convertedUrl, 
                convertedBlob: resultBlob,
                convertedSize: resultBlob.size 
            } : p));
        } catch (err) {
            setItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error' } : p));
        }
    }
    setIsProcessingAll(false);
  };

  const downloadAll = async () => {
    if (items.length === 0) return;
    const zip = new JSZip();
    let hasFiles = false;

    items.forEach(item => {
        if (item.status === 'done' && item.convertedBlob) {
            const extension = item.targetFormat;
            const fileName = item.file.name.split('.').slice(0, -1).join('.') || item.file.name;
            zip.file(`${fileName}.${extension}`, item.convertedBlob);
            hasFiles = true;
        }
    });

    if (hasFiles) {
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vollu-converted-images.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  };

  return (
    <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 font-sans text-dark"
    >
      {/* Settings Card */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`bg-white/30 backdrop-blur-xl border border-border rounded-[40px] p-8 shadow-sm flex flex-col transition-colors ${
            isDragging ? 'bg-blue-50/20 border-blue-500' : ''
        }`}
      >
        <div className="space-y-10 flex-1">
            <div>
                <label className="text-[10px] font-black uppercase text-blue-600 mb-5 block tracking-[0.2em]">{t('formatLabel')}</label>
                <div className="grid grid-cols-2 gap-3">
                    {['webp', 'avif'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setGlobalFormat(f as any)}
                            className={`py-4 rounded-2xl text-xs font-black uppercase transition-all border ${
                                globalFormat === f 
                                ? 'bg-blue-600 border-blue-400 text-white shadow-glow-sm' 
                                : 'bg-white/40 border-border text-secondary/40 hover:border-blue-200'
                            }`}
                        >
                            {f === 'avif' ? t('avifBeta') : 'WebP'}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-5">
                    <label className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">{t('qualityLabel')}</label>
                    <span className="text-xs font-mono text-blue-600 font-bold">{quality}%</span>
                </div>
                <input 
                    type="range" min="1" max="100" 
                    value={quality} 
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-dark/5 rounded-full appearance-none"
                />
            </div>

            <div className="pt-10 border-t border-border/50">
                <button 
                    onClick={processBatch}
                    disabled={isProcessingAll || items.length === 0}
                    className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white py-5 rounded-[24px] font-black uppercase text-sm flex items-center justify-center transition-all shadow-xl shadow-blue-900/20 disabled:opacity-20 active:scale-95"
                >
                    {isProcessingAll ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <RefreshCw className="w-5 h-5 mr-3" />}
                    {t('convertBtn')}
                </button>
            </div>
        </div>

        <div className="mt-10">
              <label className="cursor-pointer bg-dark/5 hover:bg-dark/10 border border-border w-full h-14 rounded-2xl flex items-center justify-center font-bold text-xs transition-all uppercase tracking-widest text-secondary/40">
                <Upload className="w-4 h-4 mr-3" />
                {t('uploadBtn')}
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
             </label>
        </div>
      </motion.div>

      {/* Main Queue Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-2 bg-white/30 backdrop-blur-xl border border-border rounded-[48px] p-8 shadow-sm relative overflow-hidden h-[700px] flex flex-col"
      >
        <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-6">
            <h2 className="font-black text-2xl tracking-tighter flex items-center">
                {t('queueTitle')}
                <span className="ml-4 bg-blue-600/10 text-blue-600 text-[10px] px-3 py-1 rounded-full font-black uppercase">{items.length} Imagens</span>
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
                    <ImageIcon className="w-32 h-32 opacity-5" />
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
                        className="bg-white/40 border border-border/50 rounded-3xl p-5 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-sm"
                    >
                        <div className="flex items-center space-x-6 min-w-0">
                            <div className="w-16 h-16 bg-dark/5 rounded-2xl overflow-hidden flex-shrink-0 border border-border/50 group-hover:scale-105 transition-transform">
                                <img src={item.originalUrl} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-sm truncate uppercase tracking-tighter mb-1 text-dark">{item.file.name}</p>
                                <div className="flex items-center space-x-3 text-[10px] font-bold text-secondary/30 uppercase tracking-widest truncate">
                                    <span>{(item.originalSize / 1024).toFixed(1)} KB</span>
                                    <ArrowRight className="w-3 h-3 text-blue-400" />
                                    <span className="text-blue-600 font-black">{item.targetFormat}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6 pl-4">
                            {item.status === 'done' && (
                                <>
                                    <div className="text-right mr-2 hidden md:block">
                                        <p className="text-[10px] font-black uppercase text-blue-600 flex items-center justify-end">
                                            <TrendingDown className="w-3 h-3 mr-1" />
                                            -{Math.round((1 - (item.convertedSize || 0) / item.originalSize) * 100)}%
                                        </p>
                                        <p className="text-[9px] font-mono text-secondary/20">{(item.convertedSize! / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <a 
                                        href={item.convertedUrl!} 
                                        download={`converted-${item.file.name.split('.')[0]}.${item.targetFormat}`}
                                        className="bg-blue-600/10 hover:bg-blue-600/30 text-blue-600 p-3 rounded-xl transition-all active:scale-90"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                </>
                            )}
                            {item.status === 'processing' && (
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            )}
                            {item.status === 'error' && (
                                <AlertCircle className="w-6 h-6 text-red-500" />
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {items.length > 0 && items.every(i => i.status === 'done' || i.status === 'error') && (
            <div className="mt-8 pt-6 border-t border-border/50">
                 <button 
                  onClick={downloadAll}
                  className="w-full bg-dark text-white py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center hover:bg-dark/80 transition-all shadow-lg active:scale-95"
                 >
                    <FileArchive className="w-4 h-4 mr-3" />
                    Download Lote (.zip)
                 </button>
            </div>
        )}
      </motion.div>
    </div>
  );
}
