'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { PDFDocument } from 'pdf-lib-with-encrypt';
import { 
  FileUp, 
  Lock, 
  Unlock, 
  Download, 
  RefreshCcw, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProtectPDFEngine() {
  const t = useTranslations('Security');
  const common = useTranslations('PdfMerge');

  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'protect' | 'unlock'>('protect');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setDownloadUrl(null);
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!file || !password) return;

    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let pdfDoc: PDFDocument;

      if (mode === 'protect') {
        // Protect mode
        pdfDoc = await PDFDocument.load(arrayBuffer);
        pdfDoc.encrypt({
          userPassword: password,
          ownerPassword: password,
          permissions: {
            printing: 'highResolution',
            modifying: true,
            copying: true,
            annotating: true,
            fillingForms: true,
            contentAccessibility: true,
            documentAssembly: true,
          },
        });
      } else {
        // Unlock mode
        try {
          pdfDoc = await PDFDocument.load(arrayBuffer, { password });
        } catch (err) {
          throw new Error(t('errorPassword'));
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setDownloadUrl(null);
    setPassword('');
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass-card p-10 rounded-[32px] border border-[rgba(255,255,255,0.4)] shadow-2xl relative overflow-hidden">
        {/* Mode Switcher */}
        <div className="flex p-1.5 bg-[#EEF2F6] rounded-2xl mb-10 w-fit mx-auto">
          <button 
            onClick={() => { setMode('protect'); setDownloadUrl(null); }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
              mode === 'protect' ? "bg-white text-brand shadow-sm" : "text-secondary hover:text-dark"
            )}
          >
            <Lock className="w-4 h-4" />
            {t('modeProtect')}
          </button>
          <button 
            onClick={() => { setMode('unlock'); setDownloadUrl(null); }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
              mode === 'unlock' ? "bg-white text-brand shadow-sm" : "text-secondary hover:text-dark"
            )}
          >
            <Unlock className="w-4 h-4" />
            {t('modeUnlock')}
          </button>
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
                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center">
                  {mode === 'protect' ? <Lock className="w-5 h-5 text-brand" /> : <Unlock className="w-5 h-5 text-brand" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-dark truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-secondary">{mode === 'protect' ? t('ready') : t('prompt')}</p>
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

            {/* Password Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-dark ml-1">{t('password')}</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 pl-5 pr-14 rounded-2xl bg-white border border-border focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all text-dark font-mono placeholder:text-secondary/30"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-brand"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-danger text-xs font-semibold px-1 animate-shake">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {error}
                </div>
              )}
            </div>

            {/* Action Area */}
            <div className="pt-4 space-y-4">
              {!downloadUrl ? (
                <button
                  disabled={isProcessing || !password}
                  onClick={handleProcess}
                  className="w-full h-16 rounded-2xl bg-brand text-white font-bold text-lg shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    mode === 'protect' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />
                  )}
                  {isProcessing ? t('processing') : (mode === 'protect' ? t('btnProtect') : t('btnUnlock'))}
                </button>
              ) : (
                <a
                  href={downloadUrl}
                  download={mode === 'protect' ? t('protectedFilename') : t('unlockedFilename')}
                  className="w-full h-16 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-white font-bold text-lg shadow-xl shadow-brand/25 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all animate-glow-pulse"
                >
                  <Download className="w-6 h-6" />
                  {common('btnDownload')}
                </a>
              )}

              {/* Local Processing Notification */}
              <div className="flex items-center gap-3 p-4 bg-brand/[0.03] rounded-2xl border border-brand/10">
                <ShieldCheck className="w-5 h-5 text-brand" />
                <p className="text-xs font-medium text-brand/80 leading-snug">
                  {t('statusLocal')}
                </p>
              </div>
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
      </div>
    </div>
  );
}
