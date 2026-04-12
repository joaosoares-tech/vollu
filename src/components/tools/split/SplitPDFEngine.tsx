'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { PDFDocument } from 'pdf-lib-with-encrypt';
import { 
  FileUp, 
  Scissors, 
  Download, 
  RefreshCcw, 
  ShieldCheck, 
  Info,
  AlertCircle
} from 'lucide-react';
import JSZip from 'jszip';
import { cn } from '@/lib/utils';

export function SplitPDFEngine() {
  const t = useTranslations('SplitPDF');
  const common = useTranslations('PdfMerge'); // Reusing some common strings
  const legal = useTranslations('Security'); // For local processing message

  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [rangeStr, setRangeStr] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isZip, setIsZip] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setDownloadUrl(null);
      setError(null);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPageCount(pdfDoc.getPageCount());
      } catch (err) {
        setError('Error loading PDF');
      }
    }
  };

  const parseRanges = (str: string, totalPages: number): number[][] => {
    const ranges: number[][] = [];
    const parts = str.split(',').map(p => p.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end <= totalPages && start <= end) {
          const list = [];
          for (let i = start; i <= end; i++) list.push(i - 1);
          ranges.push(list);
        } else {
          throw new Error('Invalid range');
        }
      } else {
        const num = Number(part);
        if (!isNaN(num) && num > 0 && num <= totalPages) {
          ranges.push([num - 1]);
        } else if (part !== '') {
          throw new Error('Invalid number');
        }
      }
    }
    return ranges;
  };

  const handleSplit = async () => {
    if (!file || !pageCount) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const targetRanges = parseRanges(rangeStr, pageCount);
      if (targetRanges.length === 0) throw new Error('No ranges defined');

      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      
      if (targetRanges.length === 1) {
        // Single file output
        setIsZip(false);
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(sourcePdf, targetRanges[0]);
        pages.forEach(p => newPdf.addPage(p));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setDownloadUrl(URL.createObjectURL(blob));
      } else {
        // Multiple files -> ZIP
        setIsZip(true);
        const zip = new JSZip();
        
        for (let i = 0; i < targetRanges.length; i++) {
          const newPdf = await PDFDocument.create();
          const pages = await newPdf.copyPages(sourcePdf, targetRanges[i]);
          pages.forEach(p => newPdf.addPage(p));
          
          const pdfBytes = await newPdf.save();
          zip.file(`split_part_${i + 1}.pdf`, pdfBytes);
          setProgress(Math.round(((i + 1) / targetRanges.length) * 100));
        }
        
        const zipContent = await zip.generateAsync({ type: 'blob' });
        setDownloadUrl(URL.createObjectURL(zipContent));
      }
      
      setProgress(100);
    } catch (err: any) {
      setError(t('invalidRange'));
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(null);
    setRangeStr('');
    setDownloadUrl(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="glass-card p-10 rounded-[32px] border border-[rgba(255,255,255,0.4)] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-light/10 flex items-center justify-center">
            <Scissors className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-dark tracking-tight">{t('title')}</h2>
            <p className="text-secondary text-sm">{t('description')}</p>
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
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Scissors className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-bold text-dark truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-secondary">{t('pageCount', { count: pageCount ?? 0 })}</p>
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

            {/* Range Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-dark flex items-center gap-2">
                <Info className="w-4 h-4 text-brand" />
                Set Page Ranges
              </label>
              <input 
                type="text"
                placeholder={t('rangePlaceholder')}
                value={rangeStr}
                onChange={(e) => setRangeStr(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-white border border-border focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all text-dark font-medium placeholder:text-secondary/50 placeholder:font-normal"
              />
              {error && (
                <div className="flex items-center gap-2 text-danger text-xs font-semibold px-2 animate-shake">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!downloadUrl ? (
              <button
                disabled={isProcessing || !rangeStr}
                onClick={handleSplit}
                className="w-full h-16 rounded-2xl bg-brand text-white font-bold text-lg shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                    {t('btnSplitting')}
                  </>
                ) : (
                  <>
                    <Scissors className="w-5 h-5" />
                    {t('btnSplit')}
                  </>
                )}
              </button>
            ) : (
              <a
                href={downloadUrl}
                download={isZip ? 'split_files.zip' : 'split_module.pdf'}
                className="w-full h-16 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-white font-bold text-lg shadow-xl shadow-brand/25 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all animate-glow-pulse"
              >
                <Download className="w-6 h-6" />
                {common('btnDownload')}
              </a>
            )}

            {/* Local Processing Notification */}
            <div className="flex items-center gap-3 p-4 bg-brand/[0.03] rounded-2xl border border-brand/10">
              <ShieldCheck className="w-5 h-5 text-brand" />
              <p className="text-xs font-medium text-brand/80">
                {legal('statusLocal')}
              </p>
            </div>
          </div>
        )}

        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />

        {/* Progress Bar (Visible during multi-split) */}
        {isProcessing && isZip && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#EEF2F6]">
            <div 
              className="h-full bg-brand transition-all duration-500 ease-out shadow-[0_0_10px_rgba(30,74,255,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
