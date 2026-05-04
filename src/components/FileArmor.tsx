'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  FileBox, 
  Upload, 
  Download, 
  Loader2, 
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
  Zap,
  BarChart4,
  Cpu
} from 'lucide-react';
import { encryptFileStream, decryptFileStream } from '@/lib/armor';

export default function FileArmor() {
  const t = useTranslations('FileArmor');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Use a ref to track if we're mounted for client-only logic
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus('idle');
      setProgress(0);
    }
  };

  const handleAction = async () => {
    if (!file || !password || !isMounted.current) return;
    setIsProcessing(true);
    setStatus('processing');
    setProgress(0);
    setErrorMsg('');

    try {
        let stream: ReadableStream;
        if (mode === 'encrypt') {
            stream = await encryptFileStream(file, password, (p) => setProgress(p));
        } else {
            stream = await decryptFileStream(file, password, (p) => setProgress(p));
        }

        const response = new Response(stream);
        const blob = await response.blob();
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const targetFilename = mode === 'encrypt' ? `${file.name}.vollu` : file.name.replace('.vollu', '');
        a.download = targetFilename;
        a.click();
        
        setStatus('done');
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
        console.error(err);
        setStatus('error');
        setErrorMsg(t('errorInesp'));
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 p-6 font-sans text-dark">
      {/* Sidebar Control Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-2 bg-white/30 backdrop-blur-xl border border-border rounded-[40px] p-10 shadow-sm flex flex-col justify-between"
      >
        <div>
            <div className="space-y-10">
                <div className="bg-dark/5 p-2 rounded-[24px] flex border border-border/50">
                    <button 
                        onClick={() => { setMode('encrypt'); setProgress(0); setStatus('idle'); }}
                        className={`flex-1 py-4 rounded-[18px] text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${mode === 'encrypt' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-secondary/40 hover:text-secondary'}`}
                    >
                        <Lock className="w-3.5 h-3.5" /> {t('modeEncrypt')}
                    </button>
                    <button 
                        onClick={() => { setMode('decrypt'); setProgress(0); setStatus('idle'); }}
                        className={`flex-1 py-4 rounded-[18px] text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${mode === 'decrypt' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-secondary/40 hover:text-secondary'}`}
                    >
                        <Unlock className="w-3.5 h-3.5" /> {t('modeDecrypt')}
                    </button>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] ml-2">{t('passwordLabel')}</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('passwordHint')}
                            className="w-full bg-dark/5 border border-border rounded-3xl h-20 px-8 font-mono text-xl focus:border-blue-500 focus:bg-white/50 outline-none transition-all text-dark"
                        />
                        <button 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-secondary/20 hover:text-blue-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                <button 
                    onClick={handleAction}
                    disabled={isProcessing || !file || !password}
                    className="w-full h-24 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 rounded-[32px] font-black uppercase text-lg flex items-center justify-center shadow-2xl shadow-blue-900/40 active:scale-95 transition-all disabled:opacity-20 group"
                >
                    {isProcessing ? (
                        <div className="flex items-center">
                            <RefreshCw className="w-7 h-7 animate-spin mr-4" />
                            <span>{t('processing')}</span>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Zap className="w-6 h-6 mr-4 text-blue-300 group-hover:scale-125 transition-transform" />
                            <span>{mode === 'encrypt' ? t('encryptBtn') : t('decryptBtn')}</span>
                        </div>
                    )}
                </button>
            </div>
        </div>

        <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 text-dark/20 p-5 border border-border rounded-3xl bg-white/5">
                <Cpu className="w-6 h-6 text-blue-600/40" />
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600/60">{t('ramLabel')}</p>
                    <p className="text-[9px] font-bold text-secondary/40">{t('ramDesc')}</p>
                </div>
            </div>
        </div>
      </motion.div>

      {/* Main Container */}
      <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bento Dropzone */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-white/30 backdrop-blur-xl border border-border rounded-[56px] p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[450px] shadow-sm group"
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                <Shield className="w-[500px] h-[500px] text-blue-600" />
            </div>

            {!file ? (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer z-10">
                    <motion.div 
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        className="w-32 h-32 bg-blue-600/10 rounded-[40px] flex items-center justify-center mb-10 border border-blue-500/20"
                    >
                        <Upload className="w-12 h-12 text-blue-600" />
                    </motion.div>
                    <h2 className="text-4xl font-black text-dark tracking-tight">{t('titleBox')}</h2>
                    <p className="text-sm font-bold text-secondary/40 mt-5 uppercase tracking-[0.3em]">{t('secureDesc')}</p>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
            ) : (
                <div className="z-10 text-center">
                    <div className="relative w-48 h-48 mx-auto mb-10">
                        <motion.div 
                            animate={{ rotate: isProcessing ? 360 : 0 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-[50px] border-4 border-dashed border-blue-500/20"
                        />
                        <div className="absolute inset-5 rounded-[40px] bg-blue-600/5 backdrop-blur-md flex items-center justify-center">
                            {status === 'done' ? <ShieldCheck className="w-20 h-20 text-green-500" /> : <FileBox className="w-20 h-20 text-blue-600" />}
                        </div>
                    </div>
                    <h2 className="text-3xl font-black mb-3 text-dark">{file.name}</h2>
                    <p className="text-xs font-mono text-secondary/40 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB • {mode === 'encrypt' ? t('readyToLock') : t('lockedVault')}</p>
                    
                    <button 
                        onClick={() => { setFile(null); setStatus('idle'); }} 
                        className="mt-10 text-[10px] font-black uppercase text-red-400/40 hover:text-red-400 transition-colors tracking-[0.2em] border border-red-500/10 px-8 py-3 rounded-full hover:bg-red-500/5"
                    >
                        {t('changeFile')}
                    </button>
                </div>
            )}
          </motion.div>

          {/* Progress Card */}
          <div className="bg-white/30 backdrop-blur-2xl border border-border rounded-[56px] p-12 flex flex-col justify-between h-[350px] shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start z-10">
                  <div>
                      <h3 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] mb-2">{t('processingLabel')}</h3>
                      <p className="text-[10px] text-secondary/40 font-bold uppercase tracking-widest">{t('aesEngine')}</p>
                  </div>
                  <BarChart4 className="w-6 h-6 text-blue-600/20" />
              </div>

              <div className="space-y-8 z-10">
                  <div className="flex justify-between items-baseline">
                      <span className="text-7xl font-black text-dark tracking-tighter">{Math.round(progress * 100)}<span className="text-2xl opacity-20 ml-2">%</span></span>
                      <p className="text-[9px] font-black uppercase text-secondary/30 tracking-[0.3em]">{t('pbkdf2Label')}</p>
                  </div>
                  <div className="h-6 bg-dark/5 rounded-full overflow-hidden border border-border p-1.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.4)]"
                      />
                  </div>
              </div>

              <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-cyan-600/40 z-10">
                <RefreshCw className={`w-4 h-4 mr-4 ${isProcessing ? 'animate-spin' : ''}`} />
                {t('secureStream')}
              </div>
          </div>

          {/* Status/Security Bento */}
          <div className="bg-white/30 backdrop-blur-xl border border-border rounded-[56px] p-12 flex flex-col justify-between shadow-sm relative overflow-hidden h-[350px]">
              <div className="absolute -right-12 -bottom-12 opacity-[0.02]">
                  <ShieldCheck className="w-64 h-64 text-blue-600" />
              </div>

              <div className="z-10">
                  <h3 className="text-[10px] font-black uppercase text-blue-600/40 tracking-[0.2em] mb-10">{t('vaultStatus')}</h3>
                  {status === 'processing' && <p className="text-4xl font-black text-blue-600 animate-pulse tracking-tighter">{t('arming')}</p>}
                  {status === 'done' && <p className="text-4xl font-black text-green-500 tracking-tighter">{t('success')}</p>}
                  {status === 'error' && <p className="text-xl font-black text-red-500 uppercase leading-relaxed">{errorMsg}</p>}
                   {status === 'idle' && <p className="text-4xl font-black text-secondary/5 tracking-tighter">{t('standby')}</p>}
              </div>

              <div className="pt-10 border-t border-border/50 flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full ${status === 'done' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary/40">{t('compliant')}</span>
                  </div>
                  <div className="bg-dark/5 px-4 py-2 rounded-xl border border-border flex items-center gap-3">
                    <Lock className="w-3.5 h-3.5 text-secondary/20" />
                    <span className="text-[10px] font-black uppercase text-secondary/40">{t('iterations')}</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
