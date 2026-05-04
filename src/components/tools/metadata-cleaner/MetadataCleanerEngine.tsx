'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import ExifReader from 'exifreader';
import { 
  FileUp, 
  Trash2, 
  Download, 
  RefreshCcw, 
  ShieldCheck, 
  Image as ImageIcon,
  Info,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MetadataCleanerEngine() {
  const t = useTranslations('MetadataCleaner');
  const common = useTranslations('PdfMerge');
  const security = useTranslations('Security');

  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [newSize, setNewSize] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setDownloadUrl(null);
      setNewSize(null);
      
      const pUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(pUrl);

      try {
        const tags = await ExifReader.load(selectedFile);
        // Filter out some system-level noise if needed, or just show everything
        const filteredTags: Record<string, any> = {};
        Object.entries(tags).forEach(([key, value]) => {
           if (typeof value.description === 'string' || typeof value.description === 'number') {
             filteredTags[key] = value.description;
           }
        });
        setTags(filteredTags);
      } catch (err) {
        console.error('Error reading EXIF:', err);
        setTags({});
      }
    }
  };

  const stripMetadata = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      const pUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = pUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(img, 0, 0);

      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = 1.0;

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, mimeType, quality);
      });

      if (blob) {
        setDownloadUrl(URL.createObjectURL(blob));
        setNewSize(blob.size);
      }
      
      URL.revokeObjectURL(pUrl);
    } catch (err) {
      console.error('Error stripping metadata:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setTags({});
    setDownloadUrl(null);
    setNewSize(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tagCount = Object.keys(tags).length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="glass-card p-10 rounded-[32px] border border-[rgba(255,255,255,0.4)] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-light/10 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-brand" />
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
                <p className="text-[17px] font-semibold text-dark mb-1">{t('selectImage')}</p>
                <p className="text-sm text-secondary">{t('dropHint')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info & Preview */}
            <div className="flex flex-col md:flex-row gap-6 p-4 bg-[#f8fafc] rounded-2xl border border-border">
              {previewUrl && (
                <div className="w-32 h-32 rounded-xl border border-border overflow-hidden bg-white flex-shrink-0">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-dark truncate max-w-[300px] mb-1">{file.name}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-border text-[10px] font-bold text-secondary uppercase">
                      {file.type.split('/')[1]}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-border text-[10px] font-bold text-brand italic">
                      {tagCount > 0 ? t('tagsFound', { count: tagCount }) : t('noTags')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                   <div className="text-[11px] text-secondary">
                      <span className="font-bold opacity-60 uppercase mr-1">{t('originalSize')}:</span>
                      {formatSize(originalSize)}
                   </div>
                   {newSize && (
                      <div className="text-[11px] text-brand font-bold">
                        <span className="opacity-60 uppercase mr-1">{t('newSize')}:</span>
                        {formatSize(newSize)}
                      </div>
                   )}
                </div>
              </div>
              <button 
                disabled={isProcessing}
                onClick={reset}
                className="self-start p-2 hover:bg-white hover:shadow-sm rounded-lg text-secondary transition-all"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Tags Grid (If any found) */}
            {tagCount > 0 && !downloadUrl && (
              <div className="p-4 bg-white/50 rounded-2xl border border-border max-h-40 overflow-y-auto scrollbar-thin">
                <div className="flex items-center gap-2 mb-3 text-[11px] font-bold text-secondary uppercase tracking-wider">
                  <Info className="w-3 h-3" />
                  {t('detectedMetadata')}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {Object.entries(tags).slice(0, 20).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-baseline border-b border-border/50 pb-1">
                      <span className="text-[10px] text-secondary font-medium truncate max-w-[100px]">{key}</span>
                      <span className="text-[10px] text-dark font-bold truncate max-w-[120px]">{String(val)}</span>
                    </div>
                  ))}
                  {tagCount > 20 && (
                    <div className="col-span-2 text-center text-[10px] text-secondary italic mt-1">
                      {t('moreTags', { count: tagCount - 20 })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!downloadUrl ? (
              <button
                disabled={isProcessing}
                onClick={stripMetadata}
                className="w-full h-16 rounded-2xl bg-brand text-white font-bold text-lg shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                    {t('btnCleaning')}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    {t('btnClean')}
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-center gap-2 text-brand text-sm font-bold">
                   <CheckCircle2 className="w-5 h-5" />
                   {t('success')}
                </div>
                <a
                  href={downloadUrl}
                  download={`clean_${file.name}`}
                  className="w-full h-16 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-white font-bold text-lg shadow-xl shadow-brand/25 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all animate-glow-pulse"
                >
                  <Download className="w-6 h-6" />
                  {t('download')}
                </a>
              </div>
            )}

            {/* Local Processing Notification */}
            <div className="flex items-center gap-3 p-4 bg-brand/[0.03] rounded-2xl border border-brand/10">
              <ShieldCheck className="w-5 h-5 text-brand" />
              <p className="text-xs font-medium text-brand/80">
                {security('statusLocal')}
              </p>
            </div>
          </div>
        )}

        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
      </div>
    </div>
  );
}
