'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Globe, 
  Server, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  RefreshCw,
  ChevronDown,
  Activity,
  Shield,
  Zap,
  MapPin,
  Database
} from 'lucide-react';

const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'TXT', 'NS', 'MX'];

const LOCATIONS = [
  { id: 'us-east', name: 'US East (New York)', ip: '74.125.0.0', flag: '🇺🇸' },
  { id: 'eu-west', name: 'Europe (Frankfurt)', ip: '35.198.0.0', flag: '🇩🇪' },
  { id: 'sa-east', name: 'South America (São Paulo)', ip: '35.198.0.0', flag: '🇧🇷' },
  { id: 'as-northeast', name: 'Asia (Tokyo)', ip: '35.190.0.0', flag: '🇯🇵' },
  { id: 'oc-southeast', name: 'Oceania (Sydney)', ip: '35.189.0.0', flag: '🇦🇺' }
];

interface DnsResult {
  locationId: string;
  provider: string;
  status: 'pending' | 'success' | 'error';
  data?: any[];
  error?: string;
  latency?: number;
}

export default function DnsCheckerEngine() {
  const t = useTranslations('DnsChecker');
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [results, setResults] = useState<DnsResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const queryDns = async (locationIp: string, provider: 'google' | 'cloudflare') => {
    const start = performance.now();
    try {
      if (provider === 'google') {
        // Google DNS API supports edns_client_subnet for geographic simulation
        const response = await fetch(
          `https://dns.google/resolve?name=${domain}&type=${recordType}&edns_client_subnet=${locationIp}`
        );
        const data = await response.json();
        return {
          data: data.Answer || [],
          latency: Math.round(performance.now() - start),
          status: 'success' as const
        };
      } else {
        // Cloudflare DoH (Direct query from client location)
        const response = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${domain}&type=${recordType}`,
          { headers: { 'Accept': 'application/dns-json' } }
        );
        const data = await response.json();
        return {
          data: data.Answer || [],
          latency: Math.round(performance.now() - start),
          status: 'success' as const
        };
      }
    } catch (error) {
      return {
        status: 'error' as const,
        error: 'Query failed'
      };
    }
  };

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!domain) return;

    setIsChecking(true);
    const initialResults: DnsResult[] = LOCATIONS.map(loc => ({
      locationId: loc.id,
      provider: 'Google DNS',
      status: 'pending'
    }));
    
    // Add a Cloudflare direct check
    initialResults.push({
      locationId: 'cloudflare-direct',
      provider: 'Cloudflare DNS',
      status: 'pending'
    });

    setResults(initialResults);

    const checkPromises = LOCATIONS.map(async (loc, idx) => {
      const res = await queryDns(loc.ip, 'google');
      setResults(prev => {
        const newResults = [...prev];
        newResults[idx] = { ...newResults[idx], ...res };
        return newResults;
      });
    });

    // Cloudflare check
    const cfPromise = (async () => {
        const res = await queryDns('', 'cloudflare');
        setResults(prev => {
            const newResults = [...prev];
            newResults[initialResults.length - 1] = { ...newResults[initialResults.length - 1], ...res };
            return newResults;
        });
    })();

    await Promise.all([...checkPromises, cfPromise]);
    setIsChecking(false);
  };

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
            <Globe className="w-4 h-4 mr-2 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Global Propagation Network</span>
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
          <form onSubmit={handleCheck} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-secondary/30 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder={t('domainPlaceholder')}
                className="w-full bg-dark/5 border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold tracking-tight transition-all outline-none"
              />
            </div>

            <div className="md:w-48 relative">
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full bg-dark/5 border-transparent focus:bg-white focus:border-blue-500/30 rounded-2xl py-5 px-6 text-sm font-black uppercase tracking-widest appearance-none outline-none cursor-pointer"
              >
                {RECORD_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40 pointer-events-none" />
            </div>

            <button
              type="submit"
              disabled={isChecking || !domain}
              className="md:w-56 bg-gradient-to-br from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center shadow-xl shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.98] disabled:opacity-30 group"
            >
              {isChecking ? (
                <Loader2 className="w-4 h-4 animate-spin mr-3" />
              ) : (
                <Zap className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
              )}
              {isChecking ? t('checking') : t('btnCheck')}
            </button>
          </form>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {results.map((result, idx) => {
              const location = LOCATIONS.find(l => l.id === result.locationId) || { name: 'Direct Cloudflare', flag: '☁️' };
              
              return (
                <motion.div
                  key={result.locationId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/80 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{location.flag}</span>
                      <div>
                        <h3 className="text-[11px] font-black uppercase text-dark tracking-tight">{location.name}</h3>
                        <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-tighter">{result.provider}</p>
                      </div>
                    </div>
                    {result.status === 'pending' ? (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : result.status === 'success' ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-mono text-blue-400 font-bold">{result.latency}ms</span>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  <div className="space-y-3">
                    {result.status === 'success' && (
                      <>
                        {result.data && result.data.length > 0 ? (
                          result.data.map((record, rIdx) => (
                            <div 
                              key={rIdx}
                              className="bg-dark/5 rounded-xl p-3 border border-dark/5 hover:border-blue-500/20 transition-all overflow-hidden"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                  {recordType}
                                </span>
                                <span className="text-[9px] font-mono text-secondary/40">TTL: {record.TTL}</span>
                              </div>
                              <p className="text-[11px] font-bold text-dark break-all font-mono">
                                {record.data}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-[10px] font-bold text-secondary/30 uppercase tracking-widest border-2 border-dashed border-dark/5 rounded-2xl">
                            {t('noResults')}
                          </div>
                        )}
                      </>
                    )}
                    {result.status === 'error' && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{result.error}</p>
                    )}
                    {result.status === 'pending' && (
                      <div className="space-y-2">
                        <div className="h-10 bg-dark/5 animate-pulse rounded-xl" />
                        <div className="h-10 bg-dark/5 animate-pulse rounded-xl w-4/5" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Global Stats Hub */}
        <div className="bg-dark/5 rounded-[40px] p-8 mt-12 border border-dark/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-center space-x-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm">
                        <Server className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-secondary/40 tracking-widest mb-1">Infrastructure</p>
                        <p className="text-sm font-bold text-dark">Anycast DNS Network</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm">
                        <Activity className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-secondary/40 tracking-widest mb-1">Protocol</p>
                        <p className="text-sm font-bold text-dark">DNS over HTTPS (DoH)</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm">
                        <Database className="w-6 h-6 text-cyan-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-secondary/40 tracking-widest mb-1">Geodata</p>
                        <p className="text-sm font-bold text-dark">Simulated EDNS Subnets</p>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>

      <style jsx global>{`
        .bg-dot-pattern {
          background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
}
