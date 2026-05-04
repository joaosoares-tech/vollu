'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { 
  FileUp, 
  Image as ImageIcon, 
  Download, 
  RefreshCcw, 
  ShieldCheck, 
  Layers,
  Zap
} from 'lucide-react';
import JSZip from 'jszip';
import { cn } from '@/lib/utils';

export function PDFToImageEngine() {
  const t = useTranslations('PDFToImage');
  const common = useTranslations('PdfMerge');
  const legal = useTranslations('Security');

  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setImages([]);
      setError(null);
    }
  };

  const convertToImages = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setImages([]);

    try {
      // Dynamic import to avoid SSR issues
      const pdfjs = await import('pdfjs-dist');
      // Use unpkg for more reliable version matching for the worker
      const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      setTotalSteps(totalPages);

      const renderedImages: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setCurrentStep(i);
        const page = await pdf.getPage(i);
        
        // High resolution: 2.0 scale
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        }).promise;

        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        renderedImages.push(imgData);
        setProgress(Math.round((i / totalPages) * 100));
        
        // Update gallery incrementally
        if (i % 2 === 0 || i === totalPages) {
          setImages([...renderedImages]);
        }
      }
      
      setImages(renderedImages);
    } catch (err) {
      setError(t('error'));
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadZip = async () => {
    if (images.length === 0) return;
    
    const zip = new JSZip();
    images.forEach((imgData, index) => {
      const base64Data = imgData.split(',')[1];
      zip.file(`page_${index + 1}.jpg`, base64Data, { base64: true });
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file?.name?.replace('.pdf', '') || 'vollu'}${t('filenameSuffix')}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setImages([]);
    setProgress(0);
    setCurrentStep(0);
    setTotalSteps(0);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="glass-card p-10 rounded-[32px] border border-[rgba(255,255,255,0.4)] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-light/10 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-dark tracking-tight">{t('title')}</h2>
            <p className="text-secondary text-sm flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-brand" />
              {t('resolution')}
            </p>
          </div>
        </div>

        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer"
          >
            <div className="border-2 border-dashed border-[#E1E6EE] rounded-3xl p-12 transition-all duration-300 group-hover:border-brand group-hover:bg-brand/[0.02] flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#f8fafc] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <FileUp className="w-8 h-8 text-secondary group-hover:text-brand" />
              </div>
              <div className="text-center">
                <p className="text-[17px] font-semibold text-dark mb-1">{common('selectFiles')}</p>
                <p className="text-sm text-secondary">{common('dropHint')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-bold text-dark truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-secondary">{images.length > 0 ? t('imagesReady', { count: images.length }) : t('readyToConvert')}</p>
                </div>
              </div>
              <button 
                disabled={isProcessing}
                onClick={reset}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-secondary transition-all"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Gallery / Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-brand/20">
                {images.map((src, i) => (
                  <div key={i} className="relative aspect-[3/4] group rounded-xl overflow-hidden border border-border shadow-sm">
                    <img src={src} alt={t('pageAlt', { count: i + 1 })} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-brand shadow-sm">#{i+1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Area */}
            <div className="space-y-4">
              {images.length === 0 || isProcessing ? (
                <button
                  disabled={isProcessing}
                  onClick={convertToImages}
                  className="w-full h-16 rounded-2xl bg-brand text-white font-bold text-lg shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex flex-col items-center justify-center leading-tight"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-3">
                      <RefreshCcw className="w-5 h-5 animate-spin" />
                      {t('btnConverting', { current: currentStep, total: totalSteps })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5" />
                      {t('btnConvert')}
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={downloadZip}
                  className="w-full h-16 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-white font-bold text-lg shadow-xl shadow-brand/25 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all animate-glow-pulse"
                >
                  <Download className="w-6 h-6" />
                  {t('downloadAll')}
                </button>
              )}

              {/* Local Processing Notification */}
              <div className="flex items-center gap-3 p-4 bg-brand/[0.03] rounded-2xl border border-brand/10">
                <ShieldCheck className="w-5 h-5 text-brand" />
                <p className="text-xs font-medium text-brand/80">
                  {legal('statusLocal')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#EEF2F6]">
            <div 
              className="h-full bg-brand transition-all duration-300 ease-out shadow-[0_0_10px_rgba(30,74,255,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />
      </div>
    </div>
  );
}
