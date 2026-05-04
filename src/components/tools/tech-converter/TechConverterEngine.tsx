'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { create, all } from 'mathjs';
import { 
  Monitor, 
  Database, 
  Copy, 
  Check, 
  Settings2, 
  Zap,
  LayoutGrid,
  Hash,
  Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';

const math = create(all);

type UnitType = 'bits' | 'bytes' | 'kb' | 'mb' | 'gb' | 'tb' | 'pb' | 'kib' | 'mib' | 'gib' | 'tib' | 'pib';

export function TechConverterEngine() {
  const t = useTranslations('TechConverter');
  
  // CSS Units State
  const [px, setPx] = useState<string>('16');
  const [rem, setRem] = useState<string>('1');
  const [baseSize, setBaseSize] = useState<number>(16);
  
  // Data Units State
  const [dataValueInBits, setDataValueInBits] = useState<string>('8192'); // Default 1KB/KiB
  const [isBinary, setIsBinary] = useState<boolean>(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Conversion Logic for CSS
  const handlePxChange = (val: string) => {
    setPx(val);
    if (!val || isNaN(Number(val))) {
      setRem('');
      return;
    }
    const result = math.divide(math.bignumber(val), math.bignumber(baseSize));
    setRem(result.toString());
  };

  const handleRemChange = (val: string) => {
    setRem(val);
    if (!val || isNaN(Number(val))) {
      setPx('');
      return;
    }
    const result = math.multiply(math.bignumber(val), math.bignumber(baseSize));
    setPx(result.toString());
  };

  // Data Conversion Logic
  const getDataFactor = (unit: UnitType, binary: boolean): any => {
    const factorsDecimal: Record<string, number> = {
      bits: 1,
      bytes: 8,
      kb: 8000,
      mb: 8000000,
      gb: 8000000000,
      tb: 8000000000000,
      pb: 8000000000000000,
    };

    if (!binary) return math.bignumber(factorsDecimal[unit] || 1);

    // Binary logic (1024)
    const powerMap: Record<string, number> = {
      bits: -1, // special case
      bytes: 0,
      kib: 1,
      mib: 2,
      gib: 3,
      tib: 4,
      pib: 5,
    };
    
    // For binary, we use 2^10 increments
    if (unit === 'bits') return math.bignumber(1);
    const power = powerMap[unit] ?? 0;
    return math.multiply(math.bignumber(8), math.pow(math.bignumber(1024), math.bignumber(power)));
  };

  const calculateUnitValue = (bitsValue: string, unit: UnitType, binary: boolean) => {
    if (!bitsValue) return '';
    try {
      const bits = math.bignumber(bitsValue);
      const factor = getDataFactor(unit, binary);
      const result = math.divide(bits, factor);
      
      // Formatting for high precision but clean look
      return math.format(result, { notation: 'fixed', precision: 4 }).replace(/\.?0+$/, '');
    } catch {
      return '';
    }
  };

  const handleDataChange = (val: string, unit: UnitType) => {
    if (!val || isNaN(Number(val))) {
      setDataValueInBits('');
      return;
    }
    try {
      const factor = getDataFactor(unit, isBinary);
      const bits = math.multiply(math.bignumber(val), factor);
      setDataValueInBits(bits.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (val: string, field: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Units lists
  const decimalUnits: UnitType[] = ['bits', 'bytes', 'kb', 'mb', 'gb', 'tb', 'pb'];
  const binaryUnits: UnitType[] = ['bits', 'bytes', 'kib', 'mib', 'gib', 'tib', 'pib'];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 p-4">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CSS Multiplier Card */}
        <div className="lg:col-span-1 bg-[#0a0f1e]/90 backdrop-blur-xl rounded-[32px] border border-white/10 p-8 text-white relative overflow-hidden group shadow-2xl shadow-brand/10">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Monitor className="w-24 h-24" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center border border-brand/50">
                <LayoutGrid className="w-5 h-5 text-brand-light" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">{t('cssTitle')}</h3>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">{t('baseFontSize')}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={baseSize}
                    onChange={(e) => {
                      const newBase = Number(e.target.value) || 16;
                      setBaseSize(newBase);
                      const result = math.divide(math.bignumber(px), math.bignumber(newBase));
                      setRem(result.toString());
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 font-mono text-lg focus:outline-none focus:border-brand-light transition-all text-white"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 font-mono text-sm underline decoration-brand/50">px</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2">
                <UnitInput 
                  label={t('pxLabel')} 
                  value={px} 
                  onChange={handlePxChange} 
                  onCopy={() => copyToClipboard(px, 'px')} 
                  isCopied={copiedField === 'px'} 
                  unit="px"
                />
                <UnitInput 
                  label={t('remLabel')} 
                  value={rem} 
                  onChange={handleRemChange} 
                  onCopy={() => copyToClipboard(rem, 'rem')} 
                  isCopied={copiedField === 'rem'} 
                  unit="rem"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Units Card */}
        <div className="lg:col-span-2 bg-[#0a0f1e]/90 backdrop-blur-xl rounded-[32px] border border-white/10 p-8 text-white relative overflow-hidden shadow-2xl shadow-brand/10">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Database className="w-32 h-32" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center border border-brand/50">
                  <Scale className="w-5 h-5 text-brand-light" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white">{t('dataTitle')}</h3>
                  <p className="text-xs font-mono text-white/40">{t('precision')}</p>
                </div>
              </div>

              <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 self-end lg:self-center">
                <button
                  onClick={() => setIsBinary(false)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                    !isBinary ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-white/40 hover:text-white"
                  )}
                >
                  {t('modeDecimal')}
                </button>
                <button
                  onClick={() => setIsBinary(true)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                    isBinary ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-white/40 hover:text-white"
                  )}
                >
                  {t('modeBinary')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {(isBinary ? binaryUnits : decimalUnits).map((unit) => (
                <UnitInput
                  key={unit}
                  label={t(unit)}
                  value={calculateUnitValue(dataValueInBits, unit, isBinary)}
                  onChange={(val) => handleDataChange(val, unit)}
                  onCopy={() => copyToClipboard(calculateUnitValue(dataValueInBits, unit, isBinary), unit)}
                  isCopied={copiedField === unit}
                  unit={unit.toUpperCase()}
                  className="bg-white/[0.03]"
                />
              ))}
            </div>

            <div className="mt-8 p-4 bg-brand/10 border border-brand/20 rounded-2xl flex items-center gap-4">
               <Zap className="w-5 h-5 text-brand-light flex-shrink-0 animate-pulse" />
               <p className="text-[11px] text-white/60 leading-relaxed font-mono italic">
                 {t('zeroLossDesc')}
               </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

interface UnitInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onCopy: () => void;
  isCopied: boolean;
  unit?: string;
  className?: string;
}

function UnitInput({ label, value, onChange, onCopy, isCopied, unit, className }: UnitInputProps) {
  return (
    <div className={cn("space-y-1.5 group/input", className)}>
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] uppercase font-bold tracking-widest text-white/40 group-hover/input:text-brand-light transition-colors">{label}</label>
      </div>
      <div className="relative group">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 font-mono text-base focus:outline-none focus:border-brand-light transition-all text-white placeholder:text-white/10 shadow-inner"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {unit && (
            <span className="text-[10px] font-bold text-white/20 font-mono mr-1 hidden sm:inline">{unit}</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90",
              isCopied ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white"
            )}
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
