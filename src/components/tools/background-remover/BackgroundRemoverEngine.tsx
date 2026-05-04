'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Loader2,
  Trash2,
  Zap,
  Settings2,
  Eraser,
  Eye,
  Maximize2,
  Shield,
  ShieldCheck,
  Layout as LayoutIcon,
  CloudOff
} from 'lucide-react';

// Dynamic import for TensorFlow to avoid SSR issues and heavy initial bundle
let tf: any;
let bodySegmentation: any;

export default function BackgroundRemoverEngine() {
  const t = useTranslations('BackgroundRemover');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [feathering, setFeathering] = useState(2);
  const [error, setError] = useState<string | null>(null);
  
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);

  // Initialize TensorFlow and Model
  const initModel = useCallback(async () => {
    if (modelRef.current) return modelRef.current;
    
    setIsModelLoading(true);
    try {
      // Import TFJS and Model
      if (!tf) {
        tf = await import('@tensorflow/tfjs');
        await tf.ready();
        await tf.setBackend('webgl');
      }
      
      if (!bodySegmentation) {
        bodySegmentation = await import('@/lib/body-segmentation');
      }

      const model = await bodySegmentation.createSegmenter(
        bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
        {
            runtime: 'tfjs',
            modelType: 'general'
        }
      );
      
      modelRef.current = model;
      setIsModelLoading(false);
      return model;
    } catch (err) {
      console.error('Failed to load TFJS model:', err);
      setError(t('error'));
      setIsModelLoading(false);
      return null;
    }
  }, [t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setResultImage(null);
      setError(null);
    }
  };

  const processImage = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setError(null);
    const model = await initModel();
    if (!model) {
        setIsProcessing(false);
        return;
    }

    try {
      const img = new Image();
      img.src = image;
      await img.decode();

      // 1. Calculate dimensions
      const originalWidth = img.width;
      const originalHeight = img.height;
      
      // Limit processing dimension for stability and speed
      // WebGL has texture size limits, and high-res images can crash the context
      const maxProcDim = 1600;
      let procWidth = originalWidth;
      let procHeight = originalHeight;
      
      if (originalWidth > maxProcDim || originalHeight > maxProcDim) {
        if (originalWidth > originalHeight) {
          procHeight = Math.round((originalHeight * maxProcDim) / originalWidth);
          procWidth = maxProcDim;
        } else {
          procWidth = Math.round((originalWidth * maxProcDim) / originalHeight);
          procHeight = maxProcDim;
        }
      }

      // 2. Setup processing canvas
      const procCanvas = document.createElement('canvas');
      procCanvas.width = procWidth;
      procCanvas.height = procHeight;
      const procCtx = procCanvas.getContext('2d')!;
      procCtx.drawImage(img, 0, 0, procWidth, procHeight);

      // 3. Run inference
      const segmentation = await model.segmentPeople(procCanvas);

      if (segmentation && segmentation.length > 0) {
        // 4. Get mask tensor (toAlphaMask does not exist in this version)
        const maskTensor = await segmentation[0].mask.toTensor();
        const maskData = await maskTensor.data();
        
        // Cleanup tensor immediately
        if (maskTensor.dispose) maskTensor.dispose();
        
        // 5. Create processing-size mask canvas
        const maskProcCanvas = document.createElement('canvas');
        maskProcCanvas.width = procWidth;
        maskProcCanvas.height = procHeight;
        const maskProcCtx = maskProcCanvas.getContext('2d')!;
        
        const maskImageData = maskProcCtx.createImageData(procWidth, procHeight);
        // maskData is a 1-channel Float32Array with values [0, 1]
        for (let i = 0; i < maskData.length; i++) {
            const idx = i * 4;
            let val = maskData[i]; 
            
            // Apply a sigmoid-like contrast adjustment to sharpen the mask edges
            // and reduce the "fuzzy" halo effect before upscaling.
            val = 1 / (1 + Math.exp(-20 * (val - 0.5)));
            
            maskImageData.data[idx] = 0;
            maskImageData.data[idx + 1] = 0;
            maskImageData.data[idx + 2] = 0;
            maskImageData.data[idx + 3] = Math.round(val * 255);
        }
        maskProcCtx.putImageData(maskImageData, 0, 0);

        // 6. Setup result canvas (Full Resolution)
        const resultCanvas = resultCanvasRef.current;
        if (!resultCanvas) return;
        resultCanvas.width = originalWidth;
        resultCanvas.height = originalHeight;
        const resultCtx = resultCanvas.getContext('2d')!;
        
        // 7. Prepare final mask (Upscaled & Feathered)
        const finalMaskCanvas = document.createElement('canvas');
        finalMaskCanvas.width = originalWidth;
        finalMaskCanvas.height = originalHeight;
        const finalMaskCtx = finalMaskCanvas.getContext('2d')!;
        
        // Upscale mask to original size using bilinear interpolation (default)
        finalMaskCtx.drawImage(maskProcCanvas, 0, 0, originalWidth, originalHeight);
        
        if (feathering > 0) {
            // Create a blurred version on a separate layer to avoid self-referencing canvas issues
            const blurredMaskCanvas = document.createElement('canvas');
            blurredMaskCanvas.width = originalWidth;
            blurredMaskCanvas.height = originalHeight;
            const blurredMaskCtx = blurredMaskCanvas.getContext('2d')!;
            blurredMaskCtx.filter = `blur(${feathering}px)`;
            blurredMaskCtx.drawImage(finalMaskCanvas, 0, 0);
            
            // Replace final mask with blurred version
            finalMaskCtx.clearRect(0, 0, originalWidth, originalHeight);
            finalMaskCtx.drawImage(blurredMaskCanvas, 0, 0);
        }

        // 8. Composite final image at full resolution
        resultCtx.clearRect(0, 0, originalWidth, originalHeight);
        resultCtx.drawImage(img, 0, 0);
        resultCtx.globalCompositeOperation = 'destination-in';
        resultCtx.drawImage(finalMaskCanvas, 0, 0);
        
        setResultImage(resultCanvas.toDataURL('image/png'));
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError(t('errorProcess'));
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.download = 'vollu-bg-removed.png';
      link.href = resultImage;
      link.click();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-white/80 backdrop-blur-2xl border border-border/50 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-glow-sm">
                <Eraser className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-dark tracking-tight">{t('aiSettings')}</h2>
                <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">{t('clientInference')}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[11px] font-black uppercase text-secondary/60 tracking-widest flex items-center">
                    <Settings2 className="w-3 h-3 mr-2" />
                    {t('refineEdge')}
                  </label>
                  <span className="text-xs font-mono text-blue-500 font-bold">{feathering}px</span>
                </div>
                <input 
                  type="range" min="0" max="10" step="0.5"
                  value={feathering}
                  onChange={(e) => setFeathering(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="pt-4 space-y-3">
                <button
                  onClick={processImage}
                  disabled={!image || isProcessing || isModelLoading}
                  className="w-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-sm flex items-center justify-center shadow-xl shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none group"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                  ) : (
                    <Zap className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  )}
                  {isProcessing ? t('processing') : t('removerBtn')}
                </button>

                {resultImage && (
                  <button
                    onClick={downloadImage}
                    className="w-full bg-dark/5 hover:bg-dark/10 text-dark py-5 rounded-2xl font-black uppercase text-sm flex items-center justify-center transition-all active:scale-[0.98]"
                  >
                    <Download className="w-5 h-5 mr-3" />
                    {t('downloadPng')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {!image && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50"
            >
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  <Maximize2 className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-[11px] font-medium text-blue-600/80 leading-relaxed uppercase tracking-tighter">
                  {t('gpuWarning')}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Workspace Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white/80 backdrop-blur-2xl border border-border/50 rounded-[40px] p-2 shadow-sm relative min-h-[500px] flex flex-col group">
            
            {!image ? (
              <label className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-dot-pattern transition-all rounded-[32px] border-2 border-dashed border-border/40 m-4 bg-white/40">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Upload className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-black text-dark tracking-tight mb-2 uppercase">{t('selectImage')}</h3>
                <p className="text-sm text-secondary/40 font-bold uppercase tracking-widest">{t('dropHint')}</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="flex-1 relative m-4 rounded-[32px] overflow-hidden bg-white/40 backdrop-blur-sm border border-border/20 shadow-inner">
                
                {/* Background Checkerboard for Results */}
                <div className={`absolute inset-0 ${resultImage ? 'checkerboard-bg' : ''}`} />

                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={resultImage || image} 
                    className={`max-w-full max-h-[600px] object-contain shadow-2xl transition-all duration-500 ${isProcessing ? 'blur-sm' : ''}`}
                    alt="Preview"
                  />
                  
                  {/* Scan Line Animation */}
                  <AnimatePresence>
                    {isProcessing && (
                      <motion.div 
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/80 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div className="absolute top-6 left-6 flex space-x-2">
                  <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-border/40 shadow-sm flex items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">
                      {resultImage ? t('result') : t('original')}
                    </span>
                  </div>
                </div>

                <div className="absolute top-6 right-6 flex space-x-2">
                  <button 
                    onClick={() => { setImage(null); setResultImage(null); }}
                    className="p-3 bg-white/90 backdrop-blur-md hover:bg-red-50 text-secondary/60 hover:text-red-500 rounded-2xl border border-border/40 shadow-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[4px] z-20">
                    <div className="text-center">
                      <div className="relative mb-6">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                        <Zap className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <p className="text-xs font-black uppercase text-blue-600 tracking-widest mb-1">
                        {isModelLoading ? t('loadingModel') : t('processing')}
                      </p>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter opacity-70">
                        {isModelLoading ? 'Initializing Neural Engine' : t('statusIsolating')}
                      </p>
                    </div>
                  </div>
                )}

                {resultImage && !isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-500 text-white rounded-full flex items-center shadow-xl z-20"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('successTitle')}</span>
                  </motion.div>
                )}
              </div>
            )}
            
            {error && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-4">
             <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase text-secondary/40 tracking-widest tracking-tighter">{t('engineActive')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span className="text-[9px] font-black uppercase text-secondary/40 tracking-widest tracking-tighter">{t('webglAccelerated')}</span>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Processing Hub Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          <div className="bg-white/40 backdrop-blur-3xl border border-border/40 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-blue-600/10 rounded-2xl">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-[11px] font-black uppercase text-blue-600 tracking-widest">{t('processingHub')}</h2>
                <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-tight">Active Edge Pipeline</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/40 transition-colors">
                <div className="p-2.5 bg-blue-500/10 rounded-xl mt-1">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-dark uppercase mb-1 tracking-tight">Local Segmentation</p>
                  <p className="text-[11px] text-secondary/60 leading-relaxed font-medium uppercase tracking-tighter">{t('processDesc1')}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/40 transition-colors">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl mt-1">
                  <CloudOff className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-dark uppercase mb-1 tracking-tight">Zero Cloud Exposure</p>
                  <p className="text-[11px] text-secondary/60 leading-relaxed font-medium uppercase tracking-tighter">{t('processDesc2')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/40 transition-colors">
                <div className="p-2.5 bg-cyan-500/10 rounded-xl mt-1">
                  <LayoutIcon className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-dark uppercase mb-1 tracking-tight">WASM Architecture</p>
                  <p className="text-[11px] text-secondary/60 leading-relaxed font-medium uppercase tracking-tighter">High-precision matrix operations running at native speed directly in your browser.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      <canvas ref={originalCanvasRef} className="hidden" />
      <canvas ref={resultCanvasRef} className="hidden" />

      <style jsx global>{`
        .checkerboard-bg {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          opacity: 0.5;
        }
        .bg-dot-pattern {
          background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
