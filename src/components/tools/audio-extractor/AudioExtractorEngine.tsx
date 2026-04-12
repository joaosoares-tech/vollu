'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { 
  FileVideo, 
  Music, 
  Download, 
  Loader2, 
  Zap, 
  Sliders,
  Check,
  AlertCircle,
  FileAudio
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AudioExtractorEngine() {
  const t = useTranslations('AudioExtractor');
  const [file, setFile] = useState<File | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bitrate, setBitrate] = useState('192k');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ffmpegRef = useRef(new FFmpeg());

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    if (isLoaded) return;
    
    try {
      const baseURL = '/ffmpeg'; // Local assets
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      });
      setIsLoaded(true);
    } catch (err) {
      console.error('Failed to load FFmpeg:', err);
      setError('Could not load FFmpeg. Ensure your browser supports SharedArrayBuffer (COOP/COEP).');
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

  const extractAudio = async () => {
    if (!file || !isLoaded) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('progress', ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    try {
      const inputName = 'input.' + file.name.split('.').pop();
      const outputName = 'output.mp3';

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      
      // Command: -vn (remove video) -acodec libmp3lame -b:a [bitrate] -q:a 2 (quality)
      await ffmpeg.exec([
        '-i', inputName,
        '-vn',
        '-acodec', 'libmp3lame',
        '-b:a', bitrate,
        '-q:a', '2',
        outputName
      ]);

      const data = await ffmpeg.readFile(outputName);
      // Copy to a new buffer to avoid SharedArrayBuffer issues with Blob
      const uint8 = new Uint8Array(data.length);
      uint8.set(data as Uint8Array);
      const url = URL.createObjectURL(new Blob([uint8.buffer], { type: 'audio/mp3' }));
      setResultUrl(url);
      
      // Cleanup
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      console.error('Extraction error:', err);
      setError('Error processing video. The file might be corrupted or in an unsupported format.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Input area */}
        <div className="lg:col-span-3 bg-[#0a0f1e]/90 backdrop-blur-xl rounded-[32px] border border-white/10 p-8 text-white relative min-h-[350px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <FileVideo className="w-32 h-32" />
          </div>

          {!file ? (
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('audio-input')?.click()}>
              <div className="flex flex-col items-center gap-6 p-12 border-2 border-dashed border-white/10 rounded-[28px] hover:border-brand-light/50 hover:bg-white/5 transition-all">
                 <div className="w-16 h-16 rounded-2xl bg-brand/20 flex items-center justify-center border border-brand/50 group-hover:scale-110 transition-transform">
                   <Zap className="w-8 h-8 text-brand-light" />
                 </div>
                 <div className="text-center">
                   <p className="text-lg font-bold">{t('selectVideo')}</p>
                   <p className="text-xs text-white/30 mt-2">{t('formats')}</p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="p-6 bg-white/5 border border-white/10 rounded-[24px] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center border border-brand/20">
                    <FileVideo className="w-6 h-6 text-brand" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{file.name}</p>
                    <p className="text-[10px] text-white/40 uppercase font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button onClick={() => setFile(null)} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors">
                    <Check className="w-4 h-4 rotate-45" />
                  </button>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">{t('qualityLabel')}</span>
                    <span className="text-xs font-mono text-brand-light">{bitrate}bps</span>
                  </div>
                  <div className="flex gap-2">
                    {['128k', '192k', '320k'].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setBitrate(rate)}
                        className={cn(
                          "flex-1 py-3 rounded-xl border font-mono text-xs font-bold transition-all",
                          bitrate === rate ? "bg-brand border-brand shadow-lg shadow-brand/20" : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                        )}
                      >
                        {rate.toUpperCase()}
                      </button>
                    ))}
                  </div>
               </div>

               <button
                  onClick={extractAudio}
                  disabled={!isLoaded || isProcessing}
                  className="w-full bg-brand hover:bg-brand-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-brand/10 disabled:opacity-50 transition-all"
               >
                 {isProcessing ? (
                   <>
                     <Loader2 className="w-5 h-5 animate-spin" />
                     <span>{t('extracting', { progress })}</span>
                   </>
                 ) : !isLoaded ? (
                   <>
                     <Loader2 className="w-5 h-5 animate-spin" />
                     <span>{t('loadingEngine')}</span>
                   </>
                 ) : (
                   <>
                     <Music className="w-5 h-5" />
                     <span>{t('extractBtn')}</span>
                   </>
                 )}
               </button>
            </div>
          )}
          <input type="file" id="audio-input" className="hidden" accept="video/*" onChange={handleFileChange} />
        </div>

        {/* Status / Output area */}
        <div className="lg:col-span-2 space-y-6">
           {/* Output Card */}
           <div className="h-full bg-[#1a1f2e] rounded-[32px] border border-white/5 p-8 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-all">
                <Music className="w-48 h-48" />
              </div>

              <div className="space-y-6 relative z-10">
                <h4 className="text-xs uppercase font-bold tracking-widest text-white/40 flex items-center gap-2">
                  <Sliders className="w-3 h-3 text-brand-light" />
                  STATUS & OUTPUT
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
                          ? "Processing high-fidelity discrete cosine transforms... Your browser is now a professional workstation." 
                          : "Extract audio tracks with professional LAME encoding quality. 100% Client-Side. High Privacy."}
                     </p>
                     
                     {isProcessing && (
                       <div className="w-full space-y-2">
                          <div className="flex justify-between text-[10px] font-mono text-brand-light">
                             <span>PROCESS</span>
                             <span>{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-brand transition-all duration-300" 
                                style={{ width: `${progress}%` }} 
                             />
                          </div>
                       </div>
                     )}
                  </div>
                ) : (
                  <div className="space-y-6 animate-in zoom-in duration-300">
                    <div className="p-6 bg-brand/10 border border-brand/20 rounded-2xl flex flex-col items-center gap-4">
                       <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center border-2 border-brand/40 shadow-glow shadow-brand/10">
                          <Music className="w-8 h-8 text-brand-light animate-bounce" />
                       </div>
                       <p className="text-sm font-bold text-white">Audio Extracted!</p>
                       <audio src={resultUrl} controls className="w-full h-8 opacity-80" />
                    </div>

                    <a
                      href={resultUrl}
                      download={`extracted_${file?.name.split('.')[0]}.mp3`}
                      className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      <span>{t('downloadMp3')}</span>
                    </a>
                  </div>
                )}
              </div>

              {!isLoaded && !error && (
                <div className="mt-auto pt-6 border-t border-white/5">
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
