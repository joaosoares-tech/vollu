'use client';

import { useLocale } from 'next-intl';
import { locales, labels, useRouter, usePathname, Locale } from '@/navigation';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function LanguagePicker() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[13px] font-medium text-secondary p-2 rounded-sm cursor-pointer hover:text-dark hover:bg-overlay transition-all"
      >
        <Globe className="w-4 h-4 text-brand" />
        <span className="uppercase">{locale}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 max-h-[400px] overflow-y-auto bg-white border border-border rounded-md shadow-lg z-[100] p-2 custom-scrollbar">
          <div className="grid grid-cols-1 gap-1">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => handleLocaleChange(l)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-[13px] rounded-sm transition-colors",
                  locale === l 
                    ? "bg-brand/5 text-brand font-semibold" 
                    : "text-secondary hover:bg-overlay hover:text-dark"
                )}
              >
                <span>{labels[l]}</span>
                <span className="text-[10px] opacity-50 uppercase">{l}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
