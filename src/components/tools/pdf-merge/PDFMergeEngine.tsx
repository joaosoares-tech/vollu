'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { PDFDocument } from 'pdf-lib-with-encrypt';
import { mergePdfs } from '@/lib/tools/pdf/mergeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface PDFFile {
  id: string;
  name: string;
  size: number;
  file: File;
}

export function PDFMergeEngine() {
  const t = useTranslations('PdfMerge');
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (newFiles: File[]) => {
    // Reset previous result
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }

    const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length === 0) return;

    const addedFiles = pdfFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      file: file
    }));

    setFiles(prev => [...prev, ...addedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    
    setIsProcessing(true);
    try {
      // Pass actual File objects to the util function
      const mergedBlob = await mergePdfs(files.map(f => f.file));
      
      const url = URL.createObjectURL(mergedBlob);
      setResultUrl(url);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert("An error occurred while merging the PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-[800px] mx-auto animate-[fadeInUp_0.8s_both]">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-[44px] font-bold text-dark tracking-[-0.02em] mb-4">{t('title')}</h1>
        <p className="text-[17px] text-secondary max-w-[500px] mx-auto leading-[1.6]">
          {t('description')}
        </p>
      </div>

      {/* Main Glassmorphism Card */}
      <div className="glass-card rounded-[24px] p-8 md:p-12 relative overflow-hidden">
        
        {/* Dropzone */}
        {!resultUrl && (
          <div 
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 p-12 text-center cursor-pointer overflow-hidden ${isDragging ? 'border-brand bg-[rgba(30,74,255,0.03)] scale-[1.005] shadow-[0_0_0_4px_rgba(30,74,255,0.06)]' : 'border-border hover:border-[rgba(30,74,255,0.25)] hover:shadow-glow'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {/* Corner Gold Accents (like prototype) */}
            <div className={`absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gold rounded-tl-sm transition-opacity ${isDragging ? 'opacity-60' : 'opacity-30'}`} />
            <div className={`absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gold rounded-br-sm transition-opacity ${isDragging ? 'opacity-60' : 'opacity-30'}`} />
  
            <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-overlay text-brand flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="text-[17px] font-semibold text-dark mb-2">{t('selectFiles')}</h3>
            <p className="text-[14px] text-secondary">{t('dropHint')}</p>
            <input type="file" multiple accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          </div>
        )}

        {/* File List */}
        {files.length > 0 && !resultUrl && (
          <div className="mt-8 space-y-3">
            <AnimatePresence>
              {files.map((file, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={file.id} 
                  className="flex items-center justify-between p-4 bg-white/50 border border-border rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-red-50 flex items-center justify-center text-red-500 font-bold text-xs">PDF</div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-dark truncate">{file.name}</p>
                      <p className="text-[12px] text-secondary">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button onClick={() => removeFile(file.id)} className="p-2 text-secondary hover:text-red-500 transition-colors" title="Remove file">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Action Button */}
        {files.length > 1 && !resultUrl && (
          <div className="mt-10 flex justify-center">
            <button 
              onClick={handleMerge}
              disabled={isProcessing}
              className={`px-8 py-4 rounded-xl font-semibold text-[15px] transition-all flex items-center gap-2 ${isProcessing ? 'bg-secondary text-white opacity-70 cursor-not-allowed' : 'bg-brand text-white hover:bg-brand-light shadow-md hover:shadow-glow hover:-translate-y-0.5'}`}
            >
              {isProcessing ? t('btnMerging') : t('btnMerge')}
              {!isProcessing && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Result Area */}
        {resultUrl && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-4">{t('success')}</h3>
            <div className="flex justify-center gap-4">
              <a 
                href={resultUrl} 
                download="merged_document.pdf"
                className="px-6 py-3 rounded-lg bg-brand text-white font-medium shadow-md hover:shadow-glow hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t('btnDownload')}
              </a>
              <button 
                onClick={() => {
                  URL.revokeObjectURL(resultUrl);
                  setResultUrl(null);
                  setFiles([]);
                }}
                className="px-6 py-3 rounded-lg bg-white border border-border text-dark font-medium shadow-sm hover:border-gold transition-all text-sm"
              >
                {t('btnMore')}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Trust Notice */}
      <div className="mt-8 flex justify-center items-center gap-2 text-[12px] text-secondary opacity-80">
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{t('trust')}</span>
      </div>
    </div>
  );
}
