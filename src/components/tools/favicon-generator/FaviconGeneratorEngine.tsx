'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Upload, 
  Download, 
  Smartphone, 
  Code2, 
  Check, 
  Copy,
  Layers,
  Monitor,
  Globe,
  Loader2
} from 'lucide-react';
import JSZip from 'jszip';
import { cn } from '@/lib/utils';

export function FaviconGeneratorEngine() {
  const t = useTranslations('FaviconGenerator');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (prev) => setImage(prev.target?.result as string);
      reader.readAsDataURL(file);
      setZipBlob(null);
    }
  };

  const generateIcons = async () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(0);

    const zip = new JSZip();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.src = image;
    await new Promise((resolve) => (img.onload = resolve));

    const sizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 },
    ];

    for (let i = 0; i < sizes.length; i++) {
      const { name, size } = sizes[i];
      canvas.width = size;
      canvas.height = size;
      ctx?.clearRect(0, 0, size, size);
      
      // High quality scaling
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = 'high';
      
      ctx?.drawImage(img, 0, 0, size, size);
      
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      
      zip.file(name, blob);
      
      // Favicon.ico (for browser client-side, we wrap the 32x32 PNG)
      if (size === 32) {
        zip.file('favicon.ico', blob);
      }
      
      setProgress(Math.round(((i + 1) / sizes.length) * 80));
    }

    // site.webmanifest
    const manifest = {
      name: 'VOLLU App',
      short_name: 'VOLLU',
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
      ],
      theme_color: '#1E4AFF',
      background_color: '#ffffff',
      display: 'standalone'
    };
    zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

    const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
      setProgress(80 + Math.round(metadata.percent * 0.2));
    });

    setZipBlob(content);
    setIsProcessing(false);
  };

  const downloadZip = () => {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vollu-favicon-pack.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const snippet = `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">`;

  const copySnippet = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload & Controls */}
        <div className="bg-[#0a0f1e]/90 backdrop-blur-xl rounded-[32px] border border-white/10 p-8 text-white relative flex flex-col items-center justify-center min-h-[400px]">
          {!image ? (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center gap-6 p-12 border-2 border-dashed border-white/10 rounded-[24px] hover:border-brand-light/50 hover:bg-white/5 transition-all w-full h-full"
            >
              <div className="w-20 h-20 rounded-2xl bg-brand/20 flex items-center justify-center border border-brand/50 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-brand-light" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{t('selectImage')}</p>
                <p className="text-sm text-white/40 mt-2">SVG, PNG, JPG (Max 5MB)</p>
              </div>
            </button>
          ) : (
            <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative w-48 h-48 mx-auto rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
                <img src={image} className="w-full h-full object-contain bg-white/5 p-4" alt="Preview Source" />
                <button 
                  onClick={() => { setImage(null); setZipBlob(null); }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors"
                >
                  <Copy className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {!zipBlob ? (
                  <button
                    onClick={generateIcons}
                    disabled={isProcessing}
                    className="w-full bg-brand hover:bg-brand-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t('generating')} {progress}%</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-5 h-5" />
                        <span>{t('generateBtn')}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={downloadZip}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all animate-bounce"
                  >
                    <Download className="w-5 h-5" />
                    <span>{t('downloadZip')}</span>
                  </button>
                )}
              </div>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Browser Preview & Code */}
        <div className="space-y-8 flex flex-col">
          {/* Browser Tab Preview */}
          <div className="bg-[#1a1f2e] rounded-[32px] border border-white/5 p-8 text-white flex-1 relative overflow-hidden group">
            <h4 className="text-xs uppercase font-bold tracking-widest text-white/40 mb-6 flex items-center gap-2">
              <Globe className="w-3 h-3 text-brand-light" />
              {t('previewTitle')}
            </h4>
            
            <div className="space-y-8">
              {/* Fake Chrome Bar Light */}
              <div className="space-y-2">
                <p className="text-[10px] text-white/40 font-mono tracking-tighter uppercase">{t('previewLight')}</p>
                <div className="w-full bg-slate-100 rounded-xl p-2 flex items-center gap-3 border border-slate-200">
                  <div className="flex gap-1.5 ml-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <div className="bg-white rounded-lg px-4 py-1.5 flex items-center gap-2 shadow-sm border border-slate-200 min-w-0 flex-1">
                    <div className="w-4 h-4 rounded-sm bg-slate-200 overflow-hidden flex-shrink-0">
                      {image && <img src={image} className="w-full h-full object-contain" alt="Favicon Preview" />}
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 truncate">Vollu App | Secure...</span>
                  </div>
                </div>
              </div>

               {/* Fake Chrome Bar Dark */}
               <div className="space-y-2">
                <p className="text-[10px] text-white/40 font-mono tracking-tighter uppercase">{t('previewDark')}</p>
                <div className="w-full bg-[#35363a] rounded-xl p-2 flex items-center gap-3 border border-white/5">
                  <div className="flex gap-1.5 ml-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <div className="bg-[#202124] rounded-lg px-4 py-1.5 flex items-center gap-2 border border-white/10 min-w-0 flex-1">
                    <div className="w-4 h-4 rounded-sm bg-white/5 overflow-hidden flex-shrink-0">
                      {image && <img src={image} className="w-full h-full object-contain" alt="Favicon Preview" />}
                    </div>
                    <span className="text-[10px] font-medium text-white/80 truncate">Vollu App | Secure...</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-20 transition-all">
              <Monitor className="w-40 h-40 transform -rotate-12" />
            </div>
          </div>

          {/* Integration Guide */}
          <div className="bg-[#0a0f1e]/80 backdrop-blur-xl rounded-[32px] border border-white/10 p-8 text-white">
            <h4 className="text-xs uppercase font-bold tracking-widest text-brand-light mb-2">{t('usageTitle')}</h4>
            <p className="text-xs text-white/50 mb-6">{t('usageDesc')}</p>
            
            <div className="relative">
              <pre className="bg-black/50 rounded-2xl p-6 font-mono text-[10px] text-white/70 overflow-x-auto leading-relaxed border border-white/5">
                {snippet}
              </pre>
              <button 
                onClick={copySnippet}
                className={cn(
                  "absolute top-4 right-4 p-2 rounded-xl transition-all",
                  copied ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                )}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Circle Progress Tracker (While generating) */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
           <div className="relative flex flex-col items-center gap-8 animate-in zoom-in duration-300">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * progress) / 100}
                    strokeLinecap="round"
                    className="text-brand transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono text-3xl font-bold text-white">
                  {progress}%
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">{t('generating')}</h3>
                <p className="text-white/40 animate-pulse font-mono text-sm tracking-widest">WAKING UP DIGITAL ASSETS HUB</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
