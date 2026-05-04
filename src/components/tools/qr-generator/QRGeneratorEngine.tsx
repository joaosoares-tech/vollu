'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Download, 
  Type, 
  Settings, 
  ShieldCheck,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function QRGeneratorEngine() {
  const t = useTranslations('QRGenerator');
  const security = useTranslations('Security');

  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  const downloadPNG = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode_${Date.now()}.png`;
      link.click();
    }
  };

  const downloadSVG = () => {
    const svg = svgRef.current?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode_${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Left Column: Input & Controls */}
      <div className="flex-1 space-y-6">
        <div className="glass-card p-8 rounded-[32px] border border-[rgba(255,255,255,0.4)] shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-light/10 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark tracking-tight">{t('title')}</h2>
              <p className="text-secondary text-xs">{t('description')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                <Type className="w-3 h-3" />
                {t('inputLabel')}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('inputPlaceholder')}
                className="w-full h-32 px-5 py-4 rounded-2xl bg-[#f8fafc] border border-border focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all text-dark font-medium placeholder:text-secondary/40 resize-none"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-3 h-3" />
                {t('options')}
              </label>
              <div className="flex items-center gap-4 p-4 bg-[#f8fafc] rounded-2xl border border-border">
                <span className="text-xs font-semibold text-secondary">{t('size')}</span>
                <input 
                  type="range"
                  min="128"
                  max="1024"
                  step="64"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="flex-1 accent-brand h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] font-bold text-brand w-12 text-right">{size}px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Box */}
        <div className="flex items-center gap-3 p-4 bg-brand/[0.03] rounded-2xl border border-brand/10">
          <ShieldCheck className="w-5 h-5 text-brand" />
          <p className="text-xs font-medium text-brand/80">
            {security('statusLocal')}
          </p>
        </div>
      </div>

      {/* Right Column: Live Preview */}
      <div className="w-full md:w-[340px] flex flex-col gap-5">
        <div className="glass-card p-8 rounded-[32px] border border-[rgba(255,255,255,0.4)] shadow-2xl flex flex-col items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-brand-light/20 to-brand/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative bg-white p-6 rounded-[32px] shadow-xl border border-border/50">
              {text ? (
                <>
                  <div ref={canvasRef}>
                    <QRCodeCanvas 
                      value={text} 
                      size={256} 
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div ref={svgRef} className="hidden">
                    <QRCodeSVG 
                      value={text} 
                      size={1000} 
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </>
              ) : (
                <div className="w-[256px] h-[256px] flex flex-col items-center justify-center gap-3 text-secondary/30">
                  <QrCode className="w-16 h-16 stroke-[1]" />
                  <p className="text-xs font-medium italic">{t('waitingInput')}</p>
                </div>
              )}
            </div>
            
            {text && (
              <button 
                onClick={handleCopy}
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center text-secondary hover:text-brand hover:scale-110 active:scale-90 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="w-full mt-10 space-y-3">
            <button
              disabled={!text}
              onClick={downloadPNG}
              className="w-full h-14 rounded-2xl bg-brand text-white font-bold text-sm shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t('downloadPng')}
            </button>
            <button
              disabled={!text}
              onClick={downloadSVG}
              className="w-full h-14 rounded-2xl bg-overlay text-brand font-bold text-sm border border-brand/20 hover:bg-brand/5 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {t('downloadSvg')}
            </button>
          </div>

          <p className="mt-6 text-[10px] text-secondary/60 text-center font-medium uppercase tracking-[0.1em]">
            {t('highQuality')}
          </p>
        </div>
      </div>
    </div>
  );
}
