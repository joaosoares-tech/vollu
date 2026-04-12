'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { optimize } from 'svgo/browser';
import JSZip from 'jszip';
import { 
  FileCode, 
  Trash2, 
  Download, 
  RefreshCcw, 
  ShieldCheck, 
  Settings2,
  FileUp,
  Files,
  CheckCircle2,
  ArrowRight,
  Eye,
  Percent
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedSvg {
  id: string;
  name: string;
  originalSize: number;
  optimizedSize: number;
  originalContent: string;
  optimizedContent: string;
  saving: number;
}

export function SvgOptimizerEngine() {
  const t = useTranslations('SvgOptimizer');
  
  const [files, setFiles] = useState<OptimizedSvg[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [configMode, setConfigMode] = useState<'basic' | 'advanced'>('basic');
  const [precision, setPrecision] = useState(2);
  const [multipass, setMultipass] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (selectedFiles: FileList | File[]) => {
    setIsProcessing(true);
    const newFiles: OptimizedSvg[] = [];

    for (const file of Array.from(selectedFiles)) {
      if (!file.name.endsWith('.svg')) continue;

      try {
        const content = await file.text();
        const optimized = runOptimization(content);
        
        const originalSize = new Blob([content]).size;
        const optimizedSize = new Blob([optimized]).size;
        const saving = Math.round(((originalSize - optimizedSize) / originalSize) * 100);

        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          originalSize,
          optimizedSize,
          originalContent: content,
          optimizedContent: optimized,
          saving: Math.max(0, saving)
        });
      } catch (err) {
        console.error('Error optimizing SVG:', err);
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(false);
  };

  const runOptimization = (svgString: string) => {
    try {
      const result = optimize(svgString, {
        multipass: multipass,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeMetadata: removeMetadata,
                cleanupNumericValues: { floatPrecision: precision },
                convertPathData: { floatPrecision: precision }
              }
            }
          }
        ]
      } as any);
      return result.data;
    } catch (err) {
      console.error('Optimization failed:', err);
      return svgString;
    }
  };

  const reOptimizeAll = () => {
    const updated = files.map(f => {
      const optimized = runOptimization(f.originalContent);
      const optimizedSize = new Blob([optimized]).size;
      const saving = Math.round(((f.originalSize - optimizedSize) / f.originalSize) * 100);
      return { ...f, optimizedContent: optimized, optimizedSize, saving: Math.max(0, saving) };
    });
    setFiles(updated);
  };

  useEffect(() => {
    if (files.length > 0) {
      reOptimizeAll();
    }
  }, [precision, multipass, removeMetadata]);

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    if (previewId === id) setPreviewId(null);
  };

  const downloadOne = (file: OptimizedSvg) => {
    const blob = new Blob([file.optimizedContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized_${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    if (files.length === 1) return downloadOne(files[0]);
    
    const zip = new JSZip();
    files.forEach(f => {
      zip.file(`optimized_${f.name}`, f.optimizedContent);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized_svgs.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const previewFile = files.find(f => f.id === previewId);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="glass-card p-10 rounded-[32px] border border-[rgba(255,255,255,0.4)] shadow-2xl relative overflow-hidden animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center shadow-inner">
               <FileCode className="w-7 h-7 text-brand" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-dark tracking-tight leading-none mb-2">{t('title')}</h2>
              <p className="text-secondary text-sm font-medium opacity-80">{t('description')}</p>
            </div>
          </div>

          <div className="flex bg-[#f1f5f9] p-1 rounded-2xl border border-border">
            <button
              onClick={() => setConfigMode('basic')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
                configMode === 'basic' ? "bg-white text-brand shadow-sm" : "text-secondary hover:text-dark"
              )}
            >
              {t('configBasic')}
            </button>
            <button
              onClick={() => setConfigMode('advanced')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
                configMode === 'advanced' ? "bg-white text-brand shadow-sm" : "text-secondary hover:text-dark"
              )}
            >
              {t('configAdvanced')}
            </button>
          </div>
        </div>

        {/* Setup Controls (Advanced) */}
        {configMode === 'advanced' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-brand/[0.02] rounded-3xl border border-brand/10 mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="space-y-3">
               <label className="text-[10px] font-bold text-secondary uppercase tracking-[0.1em] flex items-center gap-2">
                 <Settings2 className="w-3.5 h-3.5 text-brand" />
                 {t('precision')}
               </label>
               <input 
                 type="range" min="0" max="10" step="1" 
                 value={precision} onChange={(e) => setPrecision(Number(e.target.value))}
                 className="w-full accent-brand h-1.5 rounded-lg appearance-none bg-border mt-2"
               />
               <div className="flex justify-between text-[10px] font-bold text-dark italic">
                  <span>0</span>
                  <span className="text-xs text-brand">{precision}</span>
                  <span>10</span>
               </div>
            </div>

            <div className="flex flex-col justify-center">
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={cn(
                    "w-10 h-6 rounded-full transition-colors relative",
                    multipass ? "bg-brand" : "bg-border"
                  )}>
                    <div className={cn(
                      "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                      multipass ? "translate-x-4" : ""
                    )} />
                    <input type="checkbox" className="hidden" checked={multipass} onChange={() => setMultipass(!multipass)} />
                  </div>
                  <span className="text-xs font-bold text-secondary group-hover:text-dark transition-colors">{t('multipass')}</span>
               </label>
            </div>

            <div className="flex flex-col justify-center">
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={cn(
                    "w-10 h-6 rounded-full transition-colors relative",
                    removeMetadata ? "bg-brand" : "bg-border"
                  )}>
                    <div className={cn(
                      "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                      removeMetadata ? "translate-x-4" : ""
                    )} />
                    <input type="checkbox" className="hidden" checked={removeMetadata} onChange={() => setRemoveMetadata(!removeMetadata)} />
                  </div>
                  <span className="text-xs font-bold text-secondary group-hover:text-dark transition-colors">{t('removeMetadata')}</span>
               </label>
            </div>
          </div>
        )}

        {/* Dropzone */}
        {files.length === 0 ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer"
          >
            <div className="border-2 border-dashed border-[#E1E6EE] rounded-[40px] p-20 transition-all duration-300 group-hover:border-brand-light group-hover:bg-brand/[0.03] flex flex-col items-center gap-6 relative">
              <div className="w-20 h-20 rounded-full bg-[#f8fafc] flex items-center justify-center group-hover:scale-110 transition-transform duration-700 shadow-sm border border-border/50">
                <FileUp className="w-10 h-10 text-secondary group-hover:text-brand" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-dark">{t('selectSvgs')}</p>
                <p className="text-sm text-secondary font-medium">{t('dropHint')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* List Header */}
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-2">
                  <Files className="w-4 h-4 text-brand" />
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">{files.length} {files.length === 1 ? 'FILE' : 'FILES'}</span>
               </div>
               <button 
                 onClick={() => setFiles([])}
                 className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 hover:underline"
               >
                 <Trash2 className="w-3 h-3" />
                 Limpar Tudo
               </button>
            </div>

            {/* Files Grid */}
            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {files.map(file => (
                <div 
                  key={file.id}
                  className={cn(
                    "p-5 rounded-3xl border transition-all flex flex-col md:flex-row items-center gap-6",
                    previewId === file.id ? "bg-brand/[0.04] border-brand shadow-lg" : "bg-white/50 border-border/50 hover:bg-white hover:shadow-md"
                  )}
                >
                  {/* Minipreview */}
                  <div className="w-16 h-16 bg-white rounded-2xl border border-border flex items-center justify-center p-2 flex-shrink-0 shadow-inner overflow-hidden">
                    <div dangerouslySetInnerHTML={{ __html: file.optimizedContent }} className="w-full h-full object-contain" />
                  </div>

                  <div className="flex-1 min-w-0 w-full text-center md:text-left">
                    <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                      <p className="text-sm font-bold text-dark truncate max-w-[200px]">{file.name}</p>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-[10px] font-bold text-green-700">
                         <Percent className="w-2.5 h-2.5" />
                         {file.saving}%
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-bold justify-center md:justify-start">
                       <div className="text-secondary flex items-center gap-1.5">
                         <span className="opacity-50 uppercase">{t('original')}:</span>
                         {formatSize(file.originalSize)}
                       </div>
                       <ArrowRight className="w-3 h-3 text-brand opacity-30" />
                       <div className="text-brand flex items-center gap-1.5">
                         <span className="opacity-50 uppercase">{t('optimized')}:</span>
                         {formatSize(file.optimizedSize)}
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => setPreviewId(file.id === previewId ? null : file.id)}
                      className={cn(
                        "flex-1 md:flex-none h-11 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs",
                        previewId === file.id ? "bg-brand text-white shadow-brand/20" : "bg-brand/5 text-brand hover:bg-brand/10"
                      )}
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button 
                      onClick={() => downloadOne(file)}
                      className="h-11 w-11 rounded-xl bg-green-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-200"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="h-11 w-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Footer */}
            <div className="pt-6 border-t border-border flex flex-col md:flex-row gap-4">
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="flex-1 h-16 rounded-2xl border-2 border-dashed border-brand/20 text-brand font-bold flex items-center justify-center gap-2 hover:bg-brand/[0.02] transition-all"
               >
                 <FileUp className="w-5 h-5" />
                 Add More SVGs
               </button>
               <button 
                 onClick={downloadAll}
                 className="flex-1 h-16 rounded-2xl bg-brand text-white font-bold text-lg shadow-xl shadow-brand/25 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all group"
               >
                 <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                 {files.length > 1 ? t('downloadZip') : t('download')}
               </button>
            </div>
          </div>
        )}

        {/* Local Processing Notification */}
        <div className="mt-10 p-5 bg-[#f8fafc] rounded-[24px] border border-border relative overflow-hidden group">
           <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
           <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                 <ShieldCheck className="w-5 h-5 text-brand" />
              </div>
              <div>
                <span className="text-xs font-bold text-dark block mb-1">Local Processing</span>
                <p className="text-[11px] leading-relaxed text-secondary opacity-80">
                  Your SVGs are optimized strictly on your device. We use SVGO client-side engine to ensure your data never touches our servers.
                </p>
              </div>
           </div>
        </div>
      </div>

      {/* Full Preview Area */}
      {previewFile && (
        <div className="glass-card p-10 rounded-[32px] border border-brand/20 shadow-2xl animate-in zoom-in-95 fade-in duration-500">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <Eye className="w-6 h-6 text-brand" />
                 <div>
                    <h3 className="text-lg font-bold text-dark leading-none">{t('preview')}</h3>
                    <p className="text-xs text-secondary mt-1">{previewFile.name}</p>
                 </div>
              </div>
              <button 
                onClick={() => setPreviewId(null)}
                className="w-10 h-10 rounded-full hover:bg-[#f8fafc] flex items-center justify-center text-secondary transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-none">{t('before')}</span>
                    <span className="text-[10px] font-bold text-secondary">{formatSize(previewFile.originalSize)}</span>
                 </div>
                 <div className="w-full h-80 bg-white border border-border rounded-3xl p-8 flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 rounded-3xl" />
                    <div dangerouslySetInnerHTML={{ __html: previewFile.originalContent }} className="w-full h-full object-contain relative z-10" />
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-widest leading-none bg-brand/5 px-2 py-0.5 rounded">{t('after')}</span>
                    <span className="text-[10px] font-bold text-brand">{formatSize(previewFile.optimizedSize)}</span>
                 </div>
                 <div className="w-full h-80 bg-white border border-brand/20 rounded-3xl p-8 flex items-center justify-center relative shadow-inner">
                    <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 rounded-3xl" />
                    <div dangerouslySetInnerHTML={{ __html: previewFile.optimizedContent }} className="w-full h-full object-contain relative z-10 drop-shadow-sm" />
                    <div className="absolute top-4 right-4 flex flex-col items-center">
                       <CheckCircle2 className="w-5 h-5 text-green-500" />
                       <span className="text-[10px] font-bold text-green-600 mt-1">-{previewFile.saving}%</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Hidden Input */}
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && handleFiles(e.target.files)} 
        accept=".svg" 
        className="hidden" 
      />
    </div>
  );
}
