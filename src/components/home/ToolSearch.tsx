'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Link } from '@/navigation';

interface Tool {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  category?: string;
}

interface ToolSearchProps {
  tools: Tool[];
  placeholder: string;
  platformLabel: string;
  toolsTitle: string;
  noResults: string;
  categoryNames: Record<string, string>;
  allLabel: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  pdf:      { bg: 'rgba(239,68,68,0.08)',   text: '#dc2626', dot: '#ef4444', border: 'rgba(239,68,68,0.2)' },
  image:    { bg: 'rgba(16,185,129,0.08)',  text: '#059669', dot: '#10b981', border: 'rgba(16,185,129,0.2)' },
  video:    { bg: 'rgba(139,92,246,0.08)',  text: '#7c3aed', dot: '#8b5cf6', border: 'rgba(139,92,246,0.2)' },
  security: { bg: 'rgba(245,158,11,0.08)',  text: '#d97706', dot: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  dev:      { bg: 'rgba(30,74,255,0.08)',   text: '#1e4aff', dot: '#1e4aff', border: 'rgba(30,74,255,0.2)' },
  other:    { bg: 'rgba(107,114,128,0.08)', text: '#4b5563', dot: '#6b7280', border: 'rgba(107,114,128,0.2)' },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  pdf: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  image: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  video: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  ),
  security: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  dev: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  all: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
};

export function ToolSearch({ tools, placeholder, toolsTitle, noResults, categoryNames, allLabel }: ToolSearchProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tools.length };
    tools.forEach(tool => {
      const cat = tool.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [tools]);

  const categoryOrder = useMemo(() => {
    const order = ['all'];
    const seen = new Set<string>();
    tools.forEach(t => {
      if (t.category && !seen.has(t.category)) {
        seen.add(t.category);
        order.push(t.category);
      }
    });
    return order;
  }, [tools]);

  const filteredTools = useMemo(() => {
    let result = tools;
    if (activeCategory !== 'all') {
      result = result.filter(t => t.category === activeCategory);
    }
    if (query) {
      const lq = query.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(lq) || t.description.toLowerCase().includes(lq)
      );
    }
    return result;
  }, [query, tools, activeCategory]);

  const groupedTools = useMemo(() => {
    if (query || activeCategory !== 'all') return null;
    const groups: Record<string, Tool[]> = {};
    tools.forEach(tool => {
      const cat = tool.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tool);
    });
    return groups;
  }, [query, tools, activeCategory]);

  const showSearch = query.length > 0;
  const showFiltered = activeCategory !== 'all' && !query;

  return (
    <div className="w-full">

      {/* Search Input */}
      <div className="max-w-[640px] mx-auto mb-8 relative">
        <div className="flex items-center gap-3 p-4 px-5 bg-card backdrop-blur-lg border border-border rounded-2xl shadow-md transition-all duration-200 focus-within:border-[rgba(30,74,255,0.35)] focus-within:shadow-lg focus-within:ring-4 focus-within:ring-[rgba(30,74,255,0.07)]">
          <Search className="w-5 h-5 flex-shrink-0 text-secondary opacity-50" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (e.target.value) setActiveCategory('all'); }}
            className="flex-1 border-none bg-transparent font-sans text-[15px] font-normal text-dark outline-none placeholder:text-secondary placeholder:opacity-60"
            placeholder={placeholder}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-overlay text-secondary hover:bg-[rgba(30,74,255,0.08)] hover:text-brand transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
          {!query && (
            <div className="hidden md:flex items-center gap-1 flex-shrink-0">
              <span className="kbd">⌘</span>
              <span className="kbd">K</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      {!query && (
        <div className="flex items-center gap-2 mb-12 overflow-x-auto pb-1 scrollbar-hide justify-center flex-wrap">
          {categoryOrder.map(cat => {
            const isActive = activeCategory === cat;
            const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
            const count = categoryCounts[cat] || 0;
            const name = cat === 'all' ? allLabel : (categoryNames[cat] || cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={isActive ? {
                  backgroundColor: cat === 'all' ? 'rgba(30,74,255,0.1)' : colors.bg,
                  color: cat === 'all' ? '#1e4aff' : colors.text,
                  borderColor: cat === 'all' ? 'rgba(30,74,255,0.25)' : colors.border,
                } : {}}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold border transition-all duration-200 whitespace-nowrap flex-shrink-0
                  ${isActive
                    ? 'shadow-sm scale-[1.03]'
                    : 'bg-card border-border text-secondary hover:border-[rgba(30,74,255,0.2)] hover:text-dark hover:bg-overlay'
                  }
                `}
              >
                <span style={{ color: isActive ? 'inherit' : undefined }} className={isActive ? '' : 'opacity-50'}>
                  {CATEGORY_ICONS[cat] || CATEGORY_ICONS.all}
                </span>
                {name}
                <span
                  style={isActive ? { backgroundColor: cat === 'all' ? 'rgba(30,74,255,0.15)' : colors.border, color: cat === 'all' ? '#1e4aff' : colors.text } : {}}
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? '' : 'bg-overlay text-secondary'}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {showSearch || showFiltered ? (
        /* Flat list for search / single category */
        <section>
          {showFiltered && (
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent opacity-30" />
              <h2
                className="text-[18px] font-black uppercase tracking-widest flex items-center gap-3 px-4"
                style={{ color: CATEGORY_COLORS[activeCategory]?.text || '#1e4aff' }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: CATEGORY_COLORS[activeCategory]?.dot || '#1e4aff' }}
                />
                {categoryNames[activeCategory] || activeCategory}
                <span className="text-[13px] font-medium opacity-60 normal-case tracking-normal">
                  ({filteredTools.length})
                </span>
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent opacity-30" />
            </div>
          )}

          {filteredTools.length === 0 ? (
            <div className="text-center py-16 text-secondary opacity-60">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p className="text-[16px] font-medium">{noResults}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} categoryColors={CATEGORY_COLORS} categoryNames={categoryNames} showBadge={showSearch} />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Grouped view */
        <div className="space-y-14">
          {groupedTools && Object.entries(groupedTools).map(([category, catTools]) => {
            const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
            return (
              <section key={category}>
                <div className="flex items-center gap-4 mb-7">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent opacity-20" />
                  <button
                    onClick={() => setActiveCategory(category)}
                    className="flex items-center gap-2.5 px-5 py-2 rounded-full border transition-all duration-200 hover:scale-[1.02] group"
                    style={{ borderColor: colors.border, backgroundColor: colors.bg }}
                  >
                    <span style={{ color: colors.dot }}>
                      {CATEGORY_ICONS[category] || CATEGORY_ICONS.all}
                    </span>
                    <h2 className="text-[14px] font-bold uppercase tracking-widest" style={{ color: colors.text }}>
                      {categoryNames[category] || category}
                    </h2>
                    <span className="text-[12px] font-semibold opacity-60 ml-1" style={{ color: colors.text }}>
                      {catTools.length}
                    </span>
                    <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-80 transition-opacity ml-0.5" style={{ color: colors.text }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent opacity-20" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catTools.map((tool, i) => (
                    <ToolCard key={tool.id} tool={tool} index={i} categoryColors={CATEGORY_COLORS} categoryNames={categoryNames} showBadge={false} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ToolCardProps {
  tool: Tool;
  index: number;
  categoryColors: typeof CATEGORY_COLORS;
  categoryNames: Record<string, string>;
  showBadge: boolean;
}

function ToolCard({ tool, index, categoryColors, categoryNames, showBadge }: ToolCardProps) {
  const cat = tool.category || 'other';
  const colors = categoryColors[cat] || categoryColors.other;

  return (
    <Link
      href={tool.href as any}
      className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-2xl shadow-sm transition-all duration-200 hover:border-[rgba(30,74,255,0.18)] hover:shadow-lg hover:-translate-y-[4px] overflow-hidden block h-full"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Top shine on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(30,74,255,0.4)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon */}
      <div
        className="w-[50px] h-[50px] flex items-center justify-center rounded-xl mb-4 transition-all duration-200 group-hover:scale-110"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {tool.icon}
      </div>

      {/* Category badge (shown in search results) */}
      {showBadge && tool.category && (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2"
          style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
        >
          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.dot }} />
          {categoryNames[tool.category] || tool.category}
        </span>
      )}

      <h3 className="text-[15px] font-semibold text-dark mb-1.5 group-hover:text-brand transition-colors duration-200">{tool.title}</h3>
      <p className="text-[13px] text-secondary leading-[1.55]">{tool.description}</p>

      {/* Arrow */}
      <svg
        className="absolute top-5 right-5 w-4 h-4 text-border transition-all duration-200 group-hover:text-brand group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <line x1="7" y1="17" x2="17" y2="7"/>
        <polyline points="7 7 17 7 17 17"/>
      </svg>
    </Link>
  );
}
