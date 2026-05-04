'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  KeyRound, 
  FileText, 
  Download, 
  Upload,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  Key
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EncryptedPack {
  ciphertext: string;
  iv: string;
  salt: string;
}

export function TextEncryptorEngine() {
  const t = useTranslations('TextEncryptor');
  const common = useTranslations('PdfMerge');
  const security = useTranslations('Security');

  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [decryptedText, setDecryptedText] = useState('');
  const [uploadedPack, setUploadedPack] = useState<EncryptedPack | null>(null);

  // Helper: buffer to hex
  const bufToHex = (buf: BufferSource) => Array.from(new Uint8Array(buf as ArrayBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  // Helper: hex to buffer
  const hexToBuf = (hex: string) => {
    const arr = new Uint8Array(hex.length / 2);
    for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.substr(i * 2, 2), 16);
    return arr.buffer;
  };

  const deriveKey = async (password: string, salt: BufferSource) => {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const handleEncrypt = async () => {
    if (!text || !password) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const encoder = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(password, salt);

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(text)
      );

      const pack: EncryptedPack = {
        ciphertext: bufToHex(encrypted),
        iv: bufToHex(iv),
        salt: bufToHex(salt)
      };

      const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${t('filenamePrefix')}${Date.now()}.vollu`;
      a.click();
      URL.revokeObjectURL(url);
      
      setSuccess(true);
      setText('');
      setPassword('');
    } catch (err) {
      setError(t('errorEncryption'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const pack = JSON.parse(re.target?.result as string);
          if (pack.ciphertext && pack.iv && pack.salt) {
            setUploadedPack(pack);
            setError(null);
          } else {
            setError(t('errorFormat'));
          }
        } catch (err) {
          setError(t('errorParse'));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDecrypt = async () => {
    if (!uploadedPack || !password) return;
    setIsProcessing(true);
    setError(null);

    try {
      const key = await deriveKey(password, hexToBuf(uploadedPack.salt));
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: hexToBuf(uploadedPack.iv) },
        key,
        hexToBuf(uploadedPack.ciphertext)
      );

      const decoder = new TextDecoder();
      setDecryptedText(decoder.decode(decrypted));
      setSuccess(true);
    } catch (err) {
      setError(t('errorPassword'));
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setText('');
    setPassword('');
    setDecryptedText('');
    setUploadedPack(null);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="glass-card p-10 rounded-[32px] border border-[rgba(255,255,255,0.4)] shadow-2xl relative overflow-hidden">
        {/* Mode Toggle */}
        <div className="flex bg-[#f8fafc] p-1 rounded-2xl border border-border mb-8 max-w-[fit-content] mx-auto">
          <button
            onClick={() => { setMode('encrypt'); reset(); }}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              mode === 'encrypt' ? "bg-white text-brand shadow-md" : "text-secondary hover:text-dark"
            )}
          >
            <Lock className="w-4 h-4" />
            {t('modeEncrypt')}
          </button>
          <button
            onClick={() => { setMode('decrypt'); reset(); }}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              mode === 'decrypt' ? "bg-white text-brand shadow-md" : "text-secondary hover:text-dark"
            )}
          >
            <Unlock className="w-4 h-4" />
            {t('modeDecrypt')}
          </button>
        </div>

        {/* Content Area */}
        {mode === 'encrypt' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2 ml-1">
                <FileText className="w-3.5 h-3.5" />
                {t('inputLabel')}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('inputPlaceholder')}
                className="w-full h-40 px-5 py-4 rounded-2xl bg-[#f8fafc] border border-border focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all text-dark font-medium placeholder:text-secondary/40 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2 ml-1">
                <KeyRound className="w-3.5 h-3.5" />
                {t('passwordLabel')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full h-14 pl-5 pr-12 rounded-2xl bg-[#f8fafc] border border-border focus:border-brand-light/50 focus:ring-4 focus:ring-brand/5 outline-none transition-all text-dark font-bold font-mono"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-brand transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              disabled={isProcessing || !text || !password}
              onClick={handleEncrypt}
              className="w-full h-16 rounded-2xl bg-brand text-white font-bold text-lg shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {isProcessing ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isProcessing ? t('btnProcessing') : t('btnEncrypt')}
            </button>
            
            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-200 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-xs font-bold text-green-700">{t('successEncrypt')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {!uploadedPack ? (
              <div 
                onClick={() => document.getElementById('vollu-upload')?.click()}
                className="group cursor-pointer"
              >
                <div className="border-2 border-dashed border-[#E1E6EE] rounded-3xl p-12 transition-all duration-300 group-hover:border-brand group-hover:bg-brand/[0.02] flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#f8fafc] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Upload className="w-8 h-8 text-secondary group-hover:text-brand" />
                  </div>
                  <div className="text-center">
                    <p className="text-[17px] font-semibold text-dark mb-1">{t('selectFile')}</p>
                    <p className="text-sm text-secondary">{t('selectDesc')}</p>
                  </div>
                </div>
              </div>
            ) : !decryptedText ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                 <div className="p-4 bg-brand/5 rounded-2xl border border-brand/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <FileText className="w-6 h-6 text-brand" />
                       <span className="text-sm font-bold text-dark">{t('loaded')}</span>
                    </div>
                    <button onClick={reset} className="text-[10px] font-bold text-brand uppercase underline">{t('remove')}</button>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2 ml-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      {t('passwordLabel')}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('decryptPlaceholder')}
                        className="w-full h-14 pl-5 pr-12 rounded-2xl bg-[#f8fafc] border border-border focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all text-dark font-bold font-mono"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                 </div>
                 <button
                   disabled={isProcessing || !password}
                   onClick={handleDecrypt}
                   className="w-full h-16 rounded-2xl bg-brand text-white font-bold text-lg shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                   {isProcessing ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                   {t('btnDecrypt')}
                 </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                 <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider">{t('result')}</label>
                    <button 
                      onClick={reset}
                      className="text-[10px] font-bold text-brand uppercase underline"
                    >
                      {t('startNew')}
                    </button>
                 </div>
                 <div className="w-full h-64 p-6 rounded-2xl bg-white border border-brand/20 shadow-inner text-dark font-medium whitespace-pre-wrap overflow-y-auto">
                    {decryptedText}
                 </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-200 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-xs font-bold text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}

        <input type="file" id="vollu-upload" className="hidden" accept=".vollu" onChange={handleFileUpload} />

        {/* Security Alert Header */}
        <div className="mt-10 p-5 bg-[#f8fafc] rounded-2xl border border-border">
          <div className="flex items-start gap-4">
             <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-brand" />
             </div>
             <p className="text-[11px] leading-relaxed text-secondary italic">
               <span className="font-bold text-dark not-italic block mb-1">{t('privacyTitle')}</span>
               {t('securityNote')}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
