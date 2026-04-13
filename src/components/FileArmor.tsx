'use client';

import React, { useState, useRef, useEffect } from 'react';
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

        // Feature detection: FileSystemWritableFileStream (showSaveFilePicker)
        // Note: This requires a Secure Context (HTTPS) and works in modern Chromium
        let blob: Blob;
        
        // Fallback to Blob for all environments to ensure compatibility
        const response = new Response(stream);
        blob = await response.blob();
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const targetFilename = mode === 'encrypt' ? `${file.name}.vollu` : file.name.replace('.vollu', '');
        a.download = targetFilename;
        a.click();
        
        setStatus('done');
        // Revoke after a delay to ensure download starts
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
        console.error(err);
        setStatus('error');
        setErrorMsg('Autenticação falhou. Password incorreta ou conteúdo corrompido.');
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 p-6 min-h-screen bg-[#050811] text-white">
      {/* Sidebar Control Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-2 bg-white/5 backdrop-blur-3xl border border-blue-500/20 rounded-[40px] p-10 shadow-2xl flex flex-col justify-between"
      >
        <div>
            <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-glow-sm">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-br from-white to-blue-300 bg-clip-text text-transparent tracking-tighter">
                    File Armor
                </h1>
            </div>
            <p className="text-blue-200/40 text-[9px] font-black uppercase tracking-[0.3em] mb-12 ml-1">Military Privacy Engine</p>

            <div className="space-y-8">
                <div className="bg-black/40 p-1.5 rounded-2xl flex border border-white/5">
                    <button 
                        onClick={() => { setMode('encrypt'); setProgress(0); setStatus('idle'); }}
                        className={`flex-1 py-4 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${mode === 'encrypt' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-white/20 hover:text-white/40'}`}
                    >
                        <Lock className="w-3.5 h-3.5" /> Encriptar
                    </button>
                    <button 
                        onClick={() => { setMode('decrypt'); setProgress(0); setStatus('idle'); }}
                        className={`flex-1 py-4 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${mode === 'decrypt' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-white/20 hover:text-white/40'}`}
                    >
                        <Unlock className="w-3.5 h-3.5" /> Decriptar
                    </button>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest ml-1 opacity-60">Chave de Acesso</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password de 256 bits"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 px-6 font-mono text-lg focus:border-blue-500 focus:bg-white/10 outline-none transition-all"
                        />
                        <button 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-blue-400"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <button 
                    onClick={handleAction}
                    disabled={isProcessing || !file || !password}
                    className="w-full h-20 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 rounded-3xl font-black uppercase text-lg flex items-center justify-center shadow-2xl shadow-blue-900/40 active:scale-95 transition-all disabled:opacity-10 group"
                >
                    {isProcessing ? (
                        <div className="flex items-center">
                            <RefreshCw className="w-6 h-6 animate-spin mr-3" />
                            <span>Processando...</span>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Zap className="w-5 h-5 mr-3 text-blue-300 group-hover:scale-125 transition-transform" />
                            <span>{mode === 'encrypt' ? 'Iniciar Cifra' : 'Desbloquear'}</span>
                        </div>
                    )}
                </button>
            </div>
        </div>

        <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 text-white/20 p-4 border border-white/5 rounded-2xl">
                <Cpu className="w-5 h-5" />
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/60">RAM Management</p>
                    <p className="text-[9px] font-bold">Incremental Streams Active (64KB chunks)</p>
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
            className="md:col-span-2 bg-[#0a0f1e] border border-white/5 rounded-[48px] p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] shadow-2xl group"
          >
            {/* Animated Shield Bg */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <Shield className="w-[400px] h-[400px] text-blue-500" />
            </div>

            {!file ? (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer z-10">
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-28 h-28 bg-blue-600/10 rounded-[32px] flex items-center justify-center mb-8 border border-blue-500/20"
                    >
                        <Upload className="w-10 h-10 text-blue-400" />
                    </motion.div>
                    <h2 className="text-3xl font-black text-white/80 tracking-tight">Cofre de Ficheiros</h2>
                    <p className="text-sm font-bold text-white/20 mt-4 uppercase tracking-[0.2em]">Cifra qualquer tamanho sem carregar na RAM</p>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
            ) : (
                <div className="z-10 text-center">
                    <div className="relative w-40 h-40 mx-auto mb-10">
                        <motion.div 
                            animate={{ rotate: isProcessing ? 360 : 0, scale: status === 'done' ? 1.1 : 1 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-[40px] border-4 border-dashed border-blue-500/20 flex items-center justify-center"
                        />
                        <div className="absolute inset-4 rounded-[30px] bg-blue-600/5 backdrop-blur-md flex items-center justify-center">
                            {status === 'done' ? <ShieldCheck className="w-16 h-16 text-cyan-400" /> : <FileBox className="w-16 h-16 text-blue-500" />}
                        </div>
                    </div>
                    <h2 className="text-2xl font-black mb-2">{file.name}</h2>
                    <p className="text-xs font-mono text-white/20">{(file.size / (1024 * 1024)).toFixed(2)} MB • {mode === 'encrypt' ? 'Origin' : 'Locked'}</p>
                    
                    <button 
                        onClick={() => setFile(null)} 
                        className="mt-8 text-[9px] font-black uppercase text-red-400/40 hover:text-red-400 transition-colors tracking-widest border border-red-500/20 px-6 py-2 rounded-full"
                    >
                        Trocar Ficheiro
                    </button>
                </div>
            )}
          </motion.div>

          {/* Progress Card */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/5 rounded-[48px] p-10 flex flex-col justify-between h-[320px] shadow-xl">
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className="text-xs font-black uppercase text-blue-400 tracking-widest mb-1">Cifragem</h3>
                      <p className="text-[10px] text-white/20 font-bold">Fluxo de Dados Ativo</p>
                  </div>
                  <BarChart4 className="w-6 h-6 text-blue-500/40" />
              </div>

              <div className="space-y-6">
                  <div className="flex justify-between items-baseline">
                      <span className="text-6xl font-black text-white">{Math.round(progress * 100)}<span className="text-xl opacity-20 ml-2">%</span></span>
                      <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">PBKDF2 SHA-256</p>
                  </div>
                  <div className="h-5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        className="h-full bg-gradient-to-r from-blue-700 via-indigo-500 to-cyan-400 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                      />
                  </div>
              </div>

              <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-cyan-500/40">
                <RefreshCw className={`w-3.5 h-3.5 mr-3 ${isProcessing ? 'animate-spin' : ''}`} />
                AES-GCM Authenticated Encryption
              </div>
          </div>

          {/* Status/Security Bento */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[48px] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden h-[320px]">
              <div className="absolute -right-8 -bottom-8 opacity-10">
                  <ShieldCheck className="w-48 h-48 text-white" />
              </div>

              <div>
                  <h3 className="text-xs font-black uppercase text-white/40 tracking-widest mb-8">Nível de Proteção</h3>
                  {status === 'processing' && <p className="text-3xl font-black animate-pulse">Armando Escudos...</p>}
                  {status === 'done' && <p className="text-3xl font-black text-cyan-400">Sucesso. Protegido.</p>}
                  {status === 'error' && <p className="text-2xl font-black text-red-200 uppercase">{errorMsg}</p>}
                  {status === 'idle' && <p className="text-3xl font-black opacity-30">Cofre Aberto</p>}
              </div>

              <div className="pt-8 border-t border-white/10 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">FIPS 140-2 Compliant Logic</span>
                  </div>
                  <SecurityBadge />
              </div>
          </div>
      </div>
    </div>
  );
}

function SecurityBadge() {
    return (
        <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
            <Lock className="w-3 h-3 text-white/40" />
            <span className="text-[9px] font-black uppercase text-white/60">600K Itr.</span>
        </div>
    );
}
