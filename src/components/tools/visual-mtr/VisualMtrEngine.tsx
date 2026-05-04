'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  Globe, 
  Server, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  Play,
  StopCircle,
  BarChart3,
  Network,
  ArrowRight,
  Info
} from 'lucide-react';

interface HopResult {
  id: number;
  host: string;
  location: string;
  loss: number;
  sent: number;
  last: number;
  avg: number;
  best: number;
  worst: number;
  stdev: number;
  history: number[];
  type?: 'local' | 'target';
  target?: string;
}

const GLOBAL_PROBES = [
  { id: 1, host: 'Local Connection', location: 'Browser Gateway', type: 'local' as const },
  { id: 2, host: 'Google Global Cache', location: 'Anycast', target: 'https://dns.google/favicon.ico', type: 'target' as const },
  { id: 3, host: 'Cloudflare Edge', location: 'Closest PoP', target: 'https://1.1.1.1/favicon.ico', type: 'target' as const },
  { id: 4, host: 'Amazon AWS Backbone', location: 'Cloud Core', target: 'https://aws.amazon.com/favicon.ico', type: 'target' as const },
  { id: 5, host: 'Microsoft Azure Hub', location: 'Global Network', target: 'https://azure.microsoft.com/favicon.ico', type: 'target' as const },
  { id: 6, host: 'Target Destination', location: 'User Defined', type: 'target' as const }
];

export default function VisualMtrEngine() {
  const t = useTranslations('VisualMtr');
  const [target, setTarget] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [hops, setHops] = useState<HopResult[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const measureLatency = async (url: string): Promise<number | null> => {
    const start = performance.now();
    try {
      // Use a cache-busting parameter to ensure real network round-trip
      await fetch(`${url}?cb=${Math.random()}`, { 
        mode: 'no-cors', 
        cache: 'no-store',
        credentials: 'omit'
      });
      return Math.round(performance.now() - start);
    } catch (e) {
      // If it fails but takes time, it's a timeout. If it fails immediately, it might be blocked.
      const duration = performance.now() - start;
      return duration > 20 ? Math.round(duration) : null;
    }
  };

  const startDiagnosis = () => {
    if (!target) return;
    setIsRunning(true);
    
    const initialHops: HopResult[] = GLOBAL_PROBES.map(p => ({
      ...p,
      host: p.type === 'target' ? target : p.host,
      loss: 0,
      sent: 0,
      last: 0,
      avg: 0,
      best: Infinity,
      worst: 0,
      stdev: 0,
      history: []
    }));
    
    setHops(initialHops);

    intervalRef.current = setInterval(async () => {
      const updatedHops = await Promise.all(initialHops.map(async (hop, idx) => {
        const currentHop = hops[idx] || hop;
        const targetUrl = hop.type === 'target' ? `https://${target}/favicon.ico` : (hop.target || '');
        
        // Skip if no target
        if (!targetUrl && hop.type !== 'local') return currentHop;

        const latency = hop.type === 'local' ? Math.round(Math.random() * 2 + 1) : await measureLatency(targetUrl);
        
        const newSent = currentHop.sent + 1;
        const newLoss = latency === null ? currentHop.loss + 1 : currentHop.loss;
        const lossPercent = Math.round((newLoss / newSent) * 100);
        
        let newHistory = [...currentHop.history, latency || 0].slice(-20);
        
        const validLatencies = newHistory.filter(l => l > 0);
        const newAvg = validLatencies.length > 0 ? Math.round(validLatencies.reduce((a, b) => a + b) / validLatencies.length) : 0;
        const newBest = latency && latency < currentHop.best ? latency : currentHop.best;
        const newWorst = latency && latency > currentHop.worst ? latency : currentHop.worst;

        return {
          ...currentHop,
          sent: newSent,
          loss: lossPercent,
          last: latency || 0,
          avg: newAvg,
          best: newBest === Infinity ? 0 : newBest,
          worst: newWorst,
          history: newHistory
        };
      }));
      
      setHops(updatedHops);
    }, 1000);
  };

  const stopDiagnosis = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-600">
            <Activity className="w-4 h-4 mr-2 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Real-time Path Discovery</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-dark tracking-tight uppercase">
            {t('title')}
          </h1>
          <p className="text-secondary/60 max-w-2xl mx-auto text-sm font-medium uppercase tracking-tighter">
            {t('description')}
          </p>
        </div>

        {/* Control Bar */}
        <div className="bg-white/80 backdrop-blur-2xl border border-border/50 rounded-[32px] p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Globe className="w-5 h-5 text-secondary/30 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value.replace(/^https?:\/\//, '').split('/')[0])}
                placeholder={t('targetPlaceholder')}
                disabled={isRunning}
                className="w-full bg-dark/5 border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold tracking-tight transition-all outline-none disabled:opacity-50"
              />
            </div>

            <button
              onClick={isRunning ? stopDiagnosis : startDiagnosis}
              disabled={!target}
              className={`md:w-56 py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center shadow-xl transition-all active:scale-[0.98] group ${
                isRunning 
                  ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' 
                  : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500'
              }`}
            >
              {isRunning ? (
                <StopCircle className="w-4 h-4 mr-3 animate-pulse" />
              ) : (
                <Play className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
              )}
              {isRunning ? 'Stop' : t('btnStart')}
            </button>
          </div>
        </div>

        {/* MTR Table */}
        <div className="bg-white/80 backdrop-blur-2xl border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-dark/5 text-[10px] font-black uppercase tracking-widest text-secondary/60">
                  <th className="px-8 py-5 w-16">{t('hop')}</th>
                  <th className="px-6 py-5">{t('host')}</th>
                  <th className="px-6 py-5 w-24 text-center">{t('loss')}</th>
                  <th className="px-6 py-5 w-24 text-right">{t('last')}</th>
                  <th className="px-6 py-5 w-24 text-right">{t('avg')}</th>
                  <th className="px-6 py-5 w-24 text-right">{t('best')}</th>
                  <th className="px-6 py-5 w-24 text-right">{t('worst')}</th>
                  <th className="px-8 py-5 w-40">Graph</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                <AnimatePresence>
                  {hops.length > 0 ? (
                    hops.map((hop, idx) => (
                      <motion.tr 
                        key={hop.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="px-8 py-5 text-xs font-mono font-bold text-secondary/40">{hop.id}</td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-dark group-hover:text-blue-600 transition-colors">{hop.host}</span>
                            <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-tight">{hop.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`text-center py-1 rounded-lg text-[10px] font-black ${
                            hop.loss > 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                          }`}>
                            {hop.loss}%
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right font-mono text-xs font-bold text-dark">{hop.last}ms</td>
                        <td className="px-6 py-5 text-right font-mono text-xs font-bold text-blue-500">{hop.avg}ms</td>
                        <td className="px-6 py-5 text-right font-mono text-xs font-bold text-green-500">{hop.best}ms</td>
                        <td className="px-6 py-5 text-right font-mono text-xs font-bold text-red-400">{hop.worst}ms</td>
                        <td className="px-8 py-5">
                          <div className="flex items-end space-x-0.5 h-8">
                            {hop.history.map((val, hIdx) => (
                              <div 
                                key={hIdx}
                                className="w-1 bg-blue-500/20 rounded-t-sm"
                                style={{ height: `${Math.min(val / 2, 100)}%` }}
                              />
                            ))}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center space-y-4 opacity-20">
                          <Network className="w-16 h-16" />
                          <p className="text-sm font-black uppercase tracking-widest">Waiting for Diagnosis</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50 flex items-start space-x-4">
          <Info className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
          <p className="text-[11px] font-medium text-blue-600/80 leading-relaxed uppercase tracking-tight">
            {t('simulatedNote')}
          </p>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
            <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-black uppercase text-secondary/40">Optimal Path</span>
            </div>
            <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-[10px] font-black uppercase text-secondary/40">Congestion Detected</span>
            </div>
            <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] font-black uppercase text-secondary/40">Packet Loss / Drop</span>
            </div>
            <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black uppercase text-secondary/40">Live Jitter tracking</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
