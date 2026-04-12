'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { 
  Volume2, 
  Download, 
  Loader2, 
  Zap, 
  Check,
  AlertCircle,
  FileAudio,
  FileVideo,
  Activity,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function VolumeBoosterEngine() {
  const t = useTranslations('VolumeBooster');
  const [file, setFile] = useState<File | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volumeMult, setVolumeMult] = useState(2); // 200% default
  const [useNormalization, setUseNormalization] = useState(true);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ffmpegRef = useRef(new FFmpeg());

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    if (isLoaded) return;
    
    try {
      const baseURL = '/ffmpeg';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      });
      setIsLoaded(true);
    } catch (err) {
      console.error('Failed to load FFmpeg:', err);
      setError('Could not load FFmpeg. Check SharedArrayBuffer support.');
    }
  };

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResultUrl(null);
      setProgress(0);
      setError(null);
    }
  };

  const boostVolume = async () => {
    if (!file || !isLoaded) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('progress', ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    try {
      const ext = file.name.split('.').pop();
      const inputName = `input.${ext}`;
      const outputName = `output.${ext}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      
      // Filter logic
      // volume=X.X is the basic gain.
      // If normalization is on, we can use 'dynaudnorm' for a pro feel without complex 2-pass.
      let audioFilter = `volume=${volumeMult}`;
      if (useNormalization) {
        audioFilter = `volume=${volumeMult},dynaudnorm=p=0.9:s=5`; // Dynamic Normalization
      }

      await ffmpeg.exec([
        '-i', inputName,
        '-filter:a', audioFilter,
        '-c:v', 'copy', // Copy video stream without re-encoding for speed
        outputName
      ]);

      const data = await ffmpeg.readFile(outputName);
      // Copy to a new buffer to avoid SharedArrayBuffer issues with Blob
      const uint8 = new Uint8Array(data.length);
      uint8.set(data as Uint8Array);
      const url = URL.createObjectURL(new Blob([uint8.buffer], { type: file.type }));
      setResultUrl(url);
      
      // Cleanup
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      console.error('Processing error:', err);
      setError('Error boosting audio. Check file format support.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Input & Controls */}
        <div className="lg:col-span-3 bg-[#0a0f1e]/90 backdrop-blur-xl rounded-[32px] border border-white/10 p-8 text-white relative min-h-[400px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Volume2 className="w-32 h-32" />
          </div>

          {!file ? (
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('volume-input')?.click()}>
              <div className="flex flex-col items-center gap-6 p-12 border-2 border-dashed border-white/10 rounded-[28px] hover:border-brand-light/50 hover:bg-white/5 transition-all">
                 <div className="w-16 h-16 rounded-2xl bg-brand/20 flex items-center justify-center border border-brand/50 group-hover:scale-110 transition-transform shadow-glow shadow-brand/10">
                   <Maximize2 className="w-8 h-8 text-brand-light" />
                 </div>
                 <div className="text-center">
                   <p className="text-lg font-bold">{t('selectMedia')}</p>
                   <p className="text-xs text-white/30 mt-2">MP4, MOV, WebM, MP3, WAV</p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="p-6 bg-white/5 border border-white/10 rounded-[24px] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center border border-brand/20">
                    {file.type.startsWith('video') ? <FileVideo className="w-6 h-6 text-brand" /> : <FileAudio className="w-6 h-6 text-brand" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{file.name}</p>
                    <p className="text-[10px] text-white/40 uppercase font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button onClick={() => setFile(null)} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors">
                    <Check className="w-4 h-4 rotate-45" />
                  </button>
               </div>

               {/* Boost Control */}
               <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3 text-brand-light" />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">{t('boostLabel')}</span>
                    </div>
                    <span className="text-xl font-bold font-mono text-brand-light">{(volumeMult * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="0.5" 
                    value={volumeMult} 
                    onChange={(e) => setVolumeMult(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-white/20 px-1">
                    <span>100%</span>
                    <span>300%</span>
                    <span>500%</span>
                  </div>
               </div>

               {/* Normalization Toggle */}
               <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold">{t('normalizationLabel')}</span>
                    <span className="text-[10px] text-white/40">{t('normalizationDesc')}</span>
                  </div>
                  <button
                    onClick={() => setUseNormalization(!useNormalization)}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-all flex items-center",
                      useNormalization ? "bg-brand" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white transition-all shadow-md",
                      useNormalization ? "ml-6" : "ml-0"
                    )} />
                  </button>
               </div>

               <button
                  onClick={boostVolume}
                  disabled={!isLoaded || isProcessing}
                  className="w-full bg-brand hover:bg-brand-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-brand/10 disabled:opacity-50 transition-all"
               >
                 {isProcessing ? (
                   <>
                     <Loader2 className="w-5 h-5 animate-spin" />
                     <span>{t('processing', { progress })}</span>
                   </>
                 ) : !isLoaded ? (
                   <>
                     <Loader2 className="w-5 h-5 animate-spin" />
                     <span>{t('loadingEngine')}</span>
                   </>
                 ) : (
                   <>
                     <Zap className="w-5 h-5" />
                     <span>{t('processBtn')}</span>
                   </>
                 )}
               </button>
            </div>
          )}
          <input type="file" id="volume-input" className="hidden" accept="video/*,audio/*" onChange={handleFileChange} />
        </div>

        {/* Info & Output area */}
        <div className="lg:col-span-2 space-y-6">
           {/* Output Card */}
           <div className="h-full bg-[#1a1f2e] rounded-[32px] border border-white/5 p-8 flex flex-col group overflow-hidden relative">
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-all">
                <Volume2 className="w-48 h-48" />
              </div>

              <div className="space-y-6 relative z-10 flex-1">
                <h4 className="text-xs uppercase font-bold tracking-widest text-white/40 flex items-center gap-2">
                  <Activity className="w-3 h-3 text-brand-light" />
                  PROCESSING HUB
                </h4>

                {error ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 mt-4">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-[11px] text-red-200 leading-relaxed">{error}</p>
                  </div>
                ) : !resultUrl ? (
                  <div className="space-y-4">
                     <p className="text-[11px] text-white/30 leading-relaxed italic">
                        {isProcessing 
                          ? "Applying dynamic normalization and gain filters. This ensures high volume without peak clipping." 
                          : "Rescue low-volume recordings. Boost audio levels and apply smart normalization 100% locally."}
                     </p>
                     
                     {isProcessing && (
                       <div className="w-full space-y-2 mt-8">
                          <div className="flex justify-between text-[10px] font-mono text-brand-light">
                             <span>BOOSTING</span>
                             <span>{progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                             <div 
                                className="h-full bg-gradient-to-r from-brand to-brand-light transition-all duration-300 rounded-full" 
                                style={{ width: `${progress}%` }} 
                             />
                          </div>
                       </div>
                     )}
                  </div>
                ) : (
                  <div className="space-y-8 animate-in zoom-in duration-300">
                    <div className="p-6 bg-brand/10 border border-brand/20 rounded-2xl flex flex-col items-center gap-5">
                       <div className="w-20 h-20 rounded-3xl bg-brand/20 flex items-center justify-center border-2 border-brand/40 shadow-glow shadow-brand/20 transform hover:scale-105 transition-transform">
                          <Check className="w-10 h-10 text-brand-light" />
                       </div>
                       <div className="text-center">
                          <p className="text-sm font-bold text-white">Audio Boosted!</p>
                          <p className="text-[10px] text-white/40 uppercase font-mono mt-1">Smart normalization applied</p>
                       </div>
                       <audio src={resultUrl} controls className="w-full h-8 opacity-80" />
                    </div>

                    <a
                      href={resultUrl}
                      download={`boosted_${file?.name}`}
                      className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                      <span>{t('downloadResult')}</span>
                    </a>
                  </div>
                )}
              </div>

              {!isLoaded && !error && (
                <div className="mt-8 pt-6 border-t border-white/5">
                   <div className="flex items-center gap-3 text-white/40">
                      <Loader2 className="w-4 h-4 animate-spin text-brand" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">{t('loadingEngine')}</span>
                   </div>
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
