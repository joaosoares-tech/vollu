'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import imageCompression from 'browser-image-compression';
// @ts-ignore
import { optimize } from 'svgo/browser';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Zap, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileArchive,
  Maximize2,
  Trash2,
  Layers,
  BarChart3,
  X,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

interface CompressedImage {
    id: string;
    file: File;
    originalUrl: string;
    compressedUrl: string | null;
    compressedBlob: Blob | null;
    originalSize: number;
    compressedSize: number | null;
    status: 'idle' | 'processing' | 'done' | 'error';
}

export default function SmartCompressor() {
  const t = useTranslations('SmartCompressor');
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [quality, setQuality] = useState(75);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [comparisonSlider, setComparisonSlider] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  
  const processFiles = (files: File[]) => {
    const newImages: CompressedImage[] = files.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        originalUrl: URL.createObjectURL(file),
        compressedUrl: null,
        compressedBlob: null,
        originalSize: file.size,
        compressedSize: null,
        status: 'idle'
    }));
    setImages(prev => [...prev, ...newImages]);
    if (!activeId && newImages.length > 0) {
        setActiveId(newImages[0].id);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (activeId === id) {
        setActiveId(images.find(img => img.id !== id)?.id || null);
    }
  };

  const compressSingle = async (item: CompressedImage) => {
    const file = item.file;
    const type = file.type;

    try {
        if (type.includes('svg')) {
            const text = await file.text();
            const result = optimize(text, {
                multipass: true,
                plugins: ['preset-default']
            });
            const blob = new Blob([result.data], { type: 'image/svg+xml' });
            return { blob, size: blob.size };
        } else if (type.includes('gif')) {
            return { blob: file, size: file.size }; 
        } else {
            const options = {
                maxSizeMB: quality / 100 * (file.size / 1024 / 1024),
                maxWidthOrHeight: 2560,
                useWebWorker: true,
                initialQuality: quality / 100
            };
            const compressedBlob = await imageCompression(file, options);
            return { blob: compressedBlob, size: compressedBlob.size };
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
  };

  const processAll = async () => {
    if (images.length === 0 || isProcessing) return;
    setIsProcessing(true);

    const currentImages = [...images];
    for (let i = 0; i < currentImages.length; i++) {
        const img = currentImages[i];
        if (img.status === 'done') continue;
        
        setImages(prev => prev.map(p => p.id === img.id ? { ...p, status: 'processing' } : p));

        try {
            const result = await compressSingle(img);
            const compressedUrl = URL.createObjectURL(result.blob);
            setImages(prev => prev.map(p => p.id === img.id ? { 
                ...p, 
                status: 'done', 
                compressedUrl, 
                compressedBlob: result.blob, 
                compressedSize: result.size 
            } : p));
        } catch (err) {
            setImages(prev => prev.map(p => p.id === img.id ? { ...p, status: 'error' } : p));
        }
    }
    setIsProcessing(false);
  };

  const downloadSingle = (img: CompressedImage) => {
    if (!img.compressedUrl || !img.compressedBlob) return;
    const link = document.createElement('a');
    link.href = img.compressedUrl;
    link.download = `optimized-${img.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadZip = async () => {
    if (images.length === 0) return;
    const zip = new JSZip();
    let hasFiles = false;

    images.forEach(img => {
        if (img.status === 'done' && img.compressedBlob) {
            zip.file(`optimized-${img.file.name}`, img.compressedBlob);
            hasFiles = true;
        }
    });

    if (hasFiles) {
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vollu-optimized-images.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  };

  const activeImage = images.find(img => img.id === activeId);

  return (
    <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="bg-transparent text-dark font-sans"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header - Simplified for Actions only */}
        {images.length > 0 && (
            <header className="flex flex-col md:flex-row justify-end items-center mb-12 gap-6">
                <div className="flex items-center gap-3 bg-white/50 backdrop-blur-xl p-2 rounded-2xl border border-border">
                    <button 
                        onClick={processAll}
                        disabled={isProcessing}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        {t('compressAll')}
                    </button>
                    <button 
                        onClick={downloadZip}
                        disabled={images.length === 0 || !images.every(img => img.status === 'done' || img.status === 'error')}
                        className="bg-dark text-white px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center transition-all hover:bg-dark/80 disabled:opacity-20"
                    >
                        <FileArchive className="w-4 h-4 mr-2" />
                        {t('downloadZip')}
                    </button>
                </div>
            </header>
        )}

        {images.length === 0 ? (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full aspect-[21/9] min-h-[400px] border-4 border-dashed rounded-[48px] flex flex-col items-center justify-center transition-all relative overflow-hidden group ${
                    isDragging ? 'border-blue-600 bg-blue-50/20 scale-[1.02]' : 'border-border bg-transparent'
                }`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="w-32 h-32 bg-blue-600/10 rounded-[40px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <Upload className="w-12 h-12 text-blue-600" />
                </div>
                
                <h2 className="text-3xl font-black text-dark mb-4">{t('dropTitle')}</h2>
                <p className="text-secondary/40 font-bold uppercase tracking-widest text-xs mb-8">{t('dropHint')}</p>
                
                <label className="bg-dark text-white px-10 py-5 rounded-2xl font-black uppercase text-sm cursor-pointer hover:bg-dark/80 transition-all shadow-2xl active:scale-95">
                    {t('selectBtn')}
                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                </label>
                
                <div className="mt-12 flex items-center gap-8 text-[10px] font-black uppercase text-secondary/20 tracking-tighter">
                    <span className="flex items-center"><ImageIcon className="w-4 h-4 mr-2" /> JPG / PNG</span>
                    <span className="flex items-center"><Layers className="w-4 h-4 mr-2" /> WebP / AVIF</span>
                    <span className="flex items-center"><Zap className="w-4 h-4 mr-2" /> SVG Otimizado</span>
                </div>
            </motion.div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                {/* File List Panel */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Settings Card */}
                    <div className="bg-white/30 backdrop-blur-xl border border-border rounded-[32px] p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <label className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">{t('qualityLabel')}</label>
                            <span className="text-xs font-mono bg-blue-600 text-white px-2 py-0.5 rounded-full">{quality}%</span>
                        </div>
                        <input 
                            type="range" min="1" max="100" 
                            value={quality} 
                            onChange={(e) => setQuality(parseInt(e.target.value))}
                            className="w-full accent-blue-600 h-1.5 bg-dark/5 rounded-full appearance-none mb-4"
                        />
                        <p className="text-[9px] text-secondary/40 font-medium italic">{t('qualityHint')}</p>
                    </div>

                    {/* Files Card */}
                    <div className="bg-white/30 backdrop-blur-xl border border-border rounded-[32px] p-6 shadow-sm flex-1 flex flex-col min-h-[400px] max-h-[600px]">
                        <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                            <h3 className="font-black text-sm uppercase">{t('queueTitle')}</h3>
                            <button onClick={() => setImages([])} className="text-[10px] font-black uppercase text-red-500/50 hover:text-red-500">{t('clearBtn')}</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                            <AnimatePresence>
                                {images.map(img => (
                                    <motion.div 
                                        key={img.id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => setActiveId(img.id)}
                                        className={`p-3 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border group ${
                                            activeId === img.id ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-white/40 border-border/50 hover:border-blue-200'
                                        }`}
                                    >
                                        <div className="w-12 h-12 bg-dark/5 rounded-xl overflow-hidden flex-shrink-0 border border-border/20">
                                            <img src={img.originalUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[10px] font-black truncate uppercase tracking-tighter ${activeId === img.id ? 'text-white' : 'text-dark'}`}>{img.file.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[9px] font-mono ${activeId === img.id ? 'text-blue-100' : 'text-secondary/40'}`}>{(img.originalSize/1024).toFixed(0)}KB</span>
                                                {img.compressedSize && (
                                                    <>
                                                        <ArrowRight className={`w-2 h-2 ${activeId === img.id ? 'text-blue-100' : 'text-secondary/40'}`} />
                                                        <span className={`text-[9px] font-mono ${activeId === img.id ? 'text-white' : 'text-blue-600 font-bold'}`}>{(img.compressedSize/1024).toFixed(0)}KB</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {img.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {img.status === 'done' && <CheckCircle2 className={`w-4 h-4 ${activeId === img.id ? 'text-white' : 'text-green-500'}`} />}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                                className={`p-2 rounded-lg transition-all ${activeId === img.id ? 'hover:bg-white/20 text-white' : 'hover:bg-red-50 text-secondary/20 hover:text-red-500'}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        
                        <label className="mt-6 border-2 border-dashed border-border hover:border-blue-400 p-4 rounded-2xl flex items-center justify-center cursor-pointer transition-all text-secondary/40 hover:text-blue-600">
                            <Upload className="w-4 h-4 mr-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t('addMore')}</span>
                            <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>

                {/* Main View Panel */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {activeImage ? (
                        <div className="bg-white/30 backdrop-blur-xl border border-border rounded-[40px] p-8 shadow-sm flex-1 flex flex-col min-h-[600px]">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-black text-xl tracking-tight">{activeImage.file.name}</h2>
                                        <p className="text-[10px] font-black uppercase text-secondary/30 tracking-widest">{t('comparisonLabel')}</p>
                                    </div>
                                </div>
                                
                                {activeImage.status === 'done' && (
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-blue-600 flex items-center justify-end mb-1">
                                                <TrendingDown className="w-3 h-3 mr-1" />
                                                {t('savingLabel', { percentage: Math.round((1 - activeImage.compressedSize! / activeImage.originalSize) * 100) })}
                                            </p>
                                            <p className="text-xs font-mono text-secondary/40 italic">{(activeImage.originalSize / 1024).toFixed(1)} KB → {(activeImage.compressedSize! / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button 
                                            onClick={() => downloadSingle(activeImage)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 bg-dark/5 rounded-[32px] overflow-hidden relative group shadow-inner">
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    <div className="w-full h-full relative cursor-col-resize">
                                        {/* After Image (Full Background) */}
                                        <img 
                                            src={activeImage.compressedUrl || activeImage.originalUrl} 
                                            className="w-full h-full object-contain"
                                            alt="Compressed"
                                        />
                                        
                                        {/* Before Image (Clipped Overlay) */}
                                        <div 
                                            className="absolute inset-0 overflow-hidden pointer-events-none"
                                            style={{ clipPath: `inset(0 ${100 - comparisonSlider}% 0 0)` }}
                                        >
                                            <img 
                                                src={activeImage.originalUrl} 
                                                className="w-full h-full object-contain bg-white/20 backdrop-blur-sm"
                                                alt="Original"
                                            />
                                            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-border text-dark shadow-xl">{t('original')}</div>
                                        </div>

                                        <div className="absolute top-6 right-6 bg-blue-600/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-blue-400/20 text-white shadow-xl">{t('optimized')}</div>

                                        {/* Slider Line */}
                                        <div 
                                            className="absolute top-0 bottom-0 w-[2px] bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)] z-10"
                                            style={{ left: `${comparisonSlider}%` }}
                                        >
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-[3px] border-blue-600">
                                                <Maximize2 className="w-4 h-4 text-blue-600" />
                                            </div>
                                        </div>

                                        {/* Invisible Range for interaction */}
                                        <input 
                                            type="range" min="0" max="100" 
                                            value={comparisonSlider} 
                                            onChange={(e) => setComparisonSlider(parseInt(e.target.value))}
                                            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-col-resize"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 flex items-center justify-center gap-8 text-[9px] font-black uppercase text-secondary/30 tracking-widest">
                                <div className="flex items-center gap-2"><Info className="w-3 h-3" /> {t('sliderHint')}</div>
                                <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-blue-400" /> {t('svgHint')}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/30 backdrop-blur-md border border-dashed border-border rounded-[40px] flex-1 flex flex-col items-center justify-center text-secondary/10 min-h-[600px]">
                            <ImageIcon className="w-32 h-32 mb-6 opacity-5" />
                            <p className="font-black uppercase tracking-[0.4em] text-sm italic">{t('emptyHint')}</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
