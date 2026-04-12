'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import SparkMD5 from 'spark-md5';
import { 
  FileUp, 
  Binary, 
  Copy, 
  Check, 
  RefreshCcw, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function HashVerifierEngine() {
  const t = useTranslations('HashVerifier');
  const common = useTranslations('PdfMerge');
  const security = useTranslations('Security');

  const [file, setFile] = useState<File | null>(null);
  const [algo, setAlgo] = useState<'SHA-256' | 'MD5'>('SHA-256');
  const [hash, setHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [compareHash, setCompareHash] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setHash('');
      setCompareHash('');
      setProgress(0);
      calculateHash(selectedFile, algo);
    }
  };

  const calculateHash = async (fileToHash: File, selectedAlgo: string) => {
    setIsProcessing(true);
    setHash('');
    setProgress(0);

    try {
      if (selectedAlgo === 'SHA-256') {
        const buffer = await fileToHash.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setHash(hashHex);
        setProgress(100);
      } else {
        // MD5 with SparkMD5 (supports chunking for progress)
        const spark = new SparkMD5.ArrayBuffer();
        const reader = new FileReader();
        const chunkSize = 1024 * 1024 * 2; // 2MB
        let offset = 0;

        const readNextChunk = () => {
          const slice = fileToHash.slice(offset, offset + chunkSize);
          reader.readAsArrayBuffer(slice);
        };

        reader.onload = (e) => {
          if (e.target?.result) {
            spark.append(e.target.result as ArrayBuffer);
            offset += (e.target.result as ArrayBuffer).byteLength;
            setProgress(Math.round((offset / fileToHash.size) * 100));

            if (offset < fileToHash.size) {
              readNextChunk();
            } else {
              setHash(spark.end());
              setIsProcessing(false);
              setProgress(100);
            }
          }
        };

        readNextChunk();
        return; // MD5 is handled async via reader
      }
    } catch (err) {
      console.error('Hashing error:', err);
    } finally {
      if (selectedAlgo === 'SHA-256') setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setFile(null);
    setHash('');
    setCompareHash('');
    setProgress(0);
  };

  const isMatch = hash && compareHash && hash.toLowerCase() === compareHash.toLowerCase().trim();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="glass-card p-10 rounded-[32px] border border-[rgba(255,255,255,0.4)] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-light/10 flex items-center justify-center">
              <Binary className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark tracking-tight">{t('title')}</h2>
              <p className="text-secondary text-sm">{t('description')}</p>
            </div>
          </div>
          
          <div className="flex bg-[#f8fafc] p-1 rounded-xl border border-border">
            {(['SHA-256', 'MD5'] as const).map((a) => (
              <button
                key={a}
                onClick={() => {
                  setAlgo(a);
                  if (file) calculateHash(file, a);
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  algo === a 
                    ? "bg-white text-brand shadow-sm" 
                    : "text-secondary hover:text-dark"
                )}
              >
                {a}
              </button>
            ))}
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
                <p className="text-[17px] font-semibold text-dark mb-1">{t('selectFile')}</p>
                <p className="text-sm text-secondary">{t('dropHint')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Binary className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-bold text-dark truncate max-w-[200px]">{file.name}</p>
                  <p className="text-[10px] text-secondary font-bold uppercase">{algo} calculation</p>
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

            {/* Hash Result */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">{t('algo')} {algo}</label>
                {hash && (
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-brand hover:opacity-70 transition-opacity"
                  >
                    {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? t('copied') : t('copy')}
                  </button>
                )}
              </div>
              <div className="relative group">
                <div className={cn(
                  "w-full p-5 rounded-2xl font-mono text-sm break-all transition-all border",
                  isProcessing ? "bg-[#f8fafc] text-secondary/30 italic" : "bg-white text-dark border-border shadow-sm"
                )}>
                  {isProcessing ? t('calculating') : (hash || 'Waiting...')}
                </div>
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-end pr-5">
                    <RefreshCcw className="w-4 h-4 animate-spin text-brand" />
                  </div>
                )}
              </div>
            </div>

            {/* Compare Hashing */}
            {!isProcessing && hash && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-2 px-1">
                   <Search className="w-4 h-4 text-secondary" />
                   <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Compare Hash</label>
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    value={compareHash}
                    onChange={(e) => setCompareHash(e.target.value)}
                    placeholder="Paste expected hash here..."
                    className={cn(
                      "w-full h-14 px-5 rounded-2xl bg-white border outline-none transition-all text-sm font-mono",
                      compareHash 
                        ? (isMatch ? "border-green-500 ring-4 ring-green-50" : "border-red-500 ring-4 ring-red-50")
                        : "border-border focus:border-brand focus:ring-4 focus:ring-brand/5"
                    )}
                  />
                  {compareHash && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                       {isMatch ? (
                         <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            {t('match')}
                         </div>
                       ) : (
                         <div className="flex items-center gap-1 text-red-600 text-[10px] font-bold">
                            <XCircle className="w-4 h-4" />
                            {t('noMatch')}
                         </div>
                       )}
                    </div>
                  )}
                </div>
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
          className="hidden"
        />
      </div>
    </div>
  );
}
