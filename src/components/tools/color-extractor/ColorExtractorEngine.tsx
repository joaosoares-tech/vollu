'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'use-intl';
import { Vibrant } from 'node-vibrant/browser';
import { 
  Palette, 
  Upload, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  ShieldCheck, 
  RefreshCcw,
  Pipette,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorSwatch {
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
  isDark: boolean;
}

export function ColorExtractorEngine() {
  const t = useTranslations('ColorExtractor');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [palette, setPalette] = useState<ColorSwatch[]>([]);
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImage(url);
      extractPalette(url);
    }
  };

  const extractPalette = async (url: string) => {
    setIsProcessing(true);
    setPalette([]);
    try {
      const vibrant = new Vibrant(url);
      const result = await vibrant.getPalette();
      
      const swatches: ColorSwatch[] = [];
      const keys = ['Vibrant', 'Muted', 'DarkVibrant', 'DarkMuted', 'LightVibrant', 'LightMuted'] as const;
      
      keys.forEach(key => {
        const swatch = result[key];
        if (swatch) {
          const [r, g, b] = swatch.rgb;
          const [h, s, l] = swatch.hsl;
          swatches.push({
            name: t(key.charAt(0).toLowerCase() + key.slice(1)),
            hex: swatch.hex,
            rgb: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
            hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
            isDark: l < 0.5
          });
        }
      });
      
      setPalette(swatches);
    } catch (err) {
      console.error('Error extracting palette:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const reset = () => {
    setImage(null);
    setPalette([]);
    setCopiedColor(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="glass-card rounded-[40px] border border-[rgba(255,255,255,0.4)] shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
        
        {/* Immersive Background */}
        {image && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src={image} 
              alt="" 
              className="w-full h-full object-cover blur-[80px] opacity-20 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/80" />
          </div>
        )}

        {/* Content Portal */}
        <div className="relative z-10 p-10 flex flex-col flex-1">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center shadow-inner">
                   <Pipette className="w-7 h-7 text-brand" />
                </div>
                <div>
                   <h2 className="text-2xl font-extrabold text-dark tracking-tight leading-none mb-1">{t('title')}</h2>
                   <p className="text-secondary text-sm font-medium opacity-80">{t('description')}</p>
                </div>
             </div>

             {palette.length > 0 && (
                <div className="flex bg-[#f1f5f9] p-1 rounded-2xl border border-border">
                  {(['hex', 'rgb', 'hsl'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        format === fmt ? "bg-white text-brand shadow-sm" : "text-secondary hover:text-dark"
                      )}
                    >
                      {t(`format${fmt.charAt(0).toUpperCase() + fmt.slice(1)}`)}
                    </button>
                  ))}
                </div>
             )}
          </div>

          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#E1E6EE] rounded-[48px] hover:border-brand-light hover:bg-brand/[0.02] transition-all cursor-pointer group"
            >
               <div className="w-20 h-20 rounded-full bg-[#f8fafc] flex items-center justify-center shadow-sm border border-border/40 group-hover:scale-110 transition-transform duration-700">
                  <Upload className="w-10 h-10 text-secondary group-hover:text-brand" />
               </div>
               <div className="mt-8 text-center">
                  <h3 className="text-xl font-bold text-dark mb-2">{t('selectImage')}</h3>
                  <p className="text-sm text-secondary font-medium">{t('dropHint')}</p>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1">
               
               {/* Left: Image Preview */}
               <div className="space-y-6">
                  <div className="relative aspect-square md:aspect-video rounded-[32px] overflow-hidden border border-white shadow-2xl group">
                     <img src={image} alt="Target" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={reset}
                          className="px-6 py-3 rounded-2xl bg-white text-dark font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                           <RefreshCcw className="w-4 h-4" />
                           {t('changeImage')}
                        </button>
                     </div>
                  </div>
                  
                  <div className="bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/60 flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-5 h-5 text-brand" />
                     </div>
                     <p className="text-[11px] font-medium text-secondary leading-relaxed">
                        <span className="text-dark font-bold block mb-1">{t('safeLocalAnalysis')}</span>
                        {t('analysisDesc1')} 
                        {t('analysisDesc2')}
                     </p>
                  </div>
               </div>

               {/* Right: Palette Swatches */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2 px-1">
                     <Layers className="w-4 h-4 text-brand" />
                     <span className="text-xs font-bold text-secondary uppercase tracking-widest">{t('palette')}</span>
                  </div>

                  {isProcessing ? (
                     <div className="flex-1 flex flex-col items-center justify-center gap-4 h-full min-h-[300px]">
                        <RefreshCcw className="w-10 h-10 text-brand animate-spin" />
                        <p className="text-sm font-bold text-secondary animate-pulse">{t('loading')}</p>
                     </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {palette.map((swatch, idx) => {
                        const colorValue = swatch[format];
                        const isActive = copiedColor === colorValue;
                        
                        return (
                          <div 
                            key={idx}
                            onClick={() => copyToClipboard(colorValue)}
                            className="group relative h-20 rounded-3xl overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm hover:shadow-xl border border-white/20"
                            style={{ backgroundColor: swatch.hex }}
                          >
                             <div className={cn(
                               "absolute inset-0 flex items-center justify-between px-8",
                               swatch.isDark ? "text-white" : "text-dark"
                             )}>
                                <div className="space-y-0.5">
                                   <p className="text-[10px] uppercase font-heavy tracking-widest opacity-60">{swatch.name}</p>
                                   <p className="text-sm font-black font-mono">{colorValue}</p>
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                   {isActive ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </div>
                             </div>

                             {/* Toast feedback */}
                             {isActive && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-brand px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-lg flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                                   <div className="w-1 h-1 rounded-full bg-brand animate-ping" />
                                   {t('copyHex')}
                                </div>
                             )}
                          </div>
                        );
                      })}
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImage} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}
