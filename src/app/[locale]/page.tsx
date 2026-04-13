import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export default function Home() {
  const t = useTranslations('Index');

  return (
    <>
      <section className="text-center py-10 pb-12 animate-[fadeInUp_0.8s_both]">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-xs font-medium text-secondary mb-8 shadow-xs backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" aria-hidden="true" />
          {t('badge')}
        </div>
        <h1 className="text-[56px] font-extrabold leading-[1.1] tracking-[-0.035em] text-dark mb-5 max-w-[720px] mx-auto">
          {t('title')}
        </h1>
        <p className="text-[20px] font-normal text-secondary max-w-[520px] mx-auto mb-10 leading-[1.6]">
          {t('description')}
        </p>
      </section>

      <div className="max-w-[620px] mx-auto mb-16 relative">
        <div className="flex items-center gap-3 p-4 px-5 bg-card backdrop-blur-lg border border-border rounded-xl shadow-md transition-all focus-within:border-[rgba(30,74,255,0.3)] focus-within:shadow-lg focus-within:ring-4 focus-within:ring-[rgba(30,74,255,0.06)] hover:shadow-glow">
          <svg className="w-5 h-5 flex-shrink-0 text-secondary opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="flex-1 border-none bg-transparent font-sans text-[15px] font-normal text-dark outline-none placeholder:text-secondary placeholder:opacity-60"
            placeholder={t('searchPlaceholder')}
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="kbd">⌘</span>
            <span className="kbd">Space</span>
          </div>
        </div>
      </div>

      <section className="py-8 animate-[fadeInUp_0.8s_0.45s_both]">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-brand mb-3 before:content-[''] before:w-5 before:h-px before:bg-gold before:opacity-50 after:content-[''] after:w-5 after:h-px after:bg-gold after:opacity-50">{t('platform')}</p>
          <h2 className="text-[32px] font-bold text-dark tracking-[-0.02em]">{t('toolsTitle')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* PDF Merge Card */}
          <Link href="/pdf-merge" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('pdfMergeTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('pdfMergeDesc')}</p>
            <svg className="absolute top-6 right-6 w-5 h-5 text-border transition-all group-hover:text-brand group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </Link>

          {/* Split PDF Card */}
          <Link href="/split-pdf" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('splitPdfTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('splitPdfDesc')}</p>
            <svg className="absolute top-6 right-6 w-5 h-5 text-border transition-all group-hover:text-brand group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </Link>

          {/* PDF to Image Card */}
          <Link href="/pdf-to-image" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('pdfToImageTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('pdfToImageDesc')}</p>
            <svg className="absolute top-6 right-6 w-5 h-5 text-border transition-all group-hover:text-brand group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </Link>

          {/* Protect PDF Card */}
          <Link href="/protect-pdf" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('protectPdfTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('protectPdfDesc')}</p>
            <svg className="absolute top-6 right-6 w-5 h-5 text-border transition-all group-hover:text-brand group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </Link>

          {/* Metadata Cleaner Card */}
          <Link href="/metadata-cleaner" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6l3 18h12l3-18H3z"/>
                <path d="M19 6V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('metadataCleanerTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('metadataCleanerDesc')}</p>
            <svg className="absolute top-6 right-6 w-5 h-5 text-border transition-all group-hover:text-brand group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </Link>

          {/* QR Generator Card */}
          <Link href="/qr-generator" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
                <line x1="10" y1="10" x2="10.01" y2="10"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('qrGeneratorTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('qrGeneratorDesc')}</p>
            <svg className="absolute top-6 right-6 w-5 h-5 text-border transition-all group-hover:text-brand group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </Link>

          {/* Hash Verifier Card */}
          <Link href="/hash-verifier" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14c0 1.1.9 2 2 2h2v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-4h2c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v10z"/>
                <line x1="12" y1="6" x2="12" y2="10"/>
                <line x1="8" y1="8" x2="16" y2="8"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('hashVerifierTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('hashVerifierDesc')}</p>
            <svg className="absolute top-6 right-6 w-5 h-5 text-border transition-all group-hover:text-brand group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </Link>

          {/* Text Encryptor Card */}
          <Link href="/text-encryptor" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <circle cx="12" cy="16" r="1"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('textEncryptorTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('textEncryptorDesc')}</p>
            <svg className="absolute top-6 right-6 w-5 h-5 text-border transition-all group-hover:text-brand group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </Link>

          {/* SVG Optimizer Card */}
          <Link href="/svg-optimizer" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m11.1 12.1-3.3 4.3a.5.5 0 0 1-.8 0L3.7 12a.5.5 0 0 1 .1-.7l4.3-3.3a.5.5 0 0 1 .7.1z"/>
                <path d="m12.9 12.1 3.3 4.3a.5.5 0 0 0 .8 0l3.3-4.4a.5.5 0 0 0-.1-.7L15.9 8a.5.5 0 0 0-.7.1z"/>
                <path d="m9.1 11.9 3.3-4.3a.5.5 0 0 1 .8 0l3.3 4.4a.5.5 0 0 1-.1.7L12.1 16a.5.5 0 0 1-.7-.1z"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('svgOptimizerTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('svgOptimizerDesc')}</p>
            <svg className="absolute top-6 right-6 w-5 h-5 text-border transition-all group-hover:text-brand group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </Link>

          {/* Color Extractor Card */}
          <Link href="/color-extractor" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.928 0 1.72-.627 1.92-1.536.13-.592.597-1.048 1.189-1.189.909-.2 1.536-.992 1.536-1.92 0-.928.627-1.72 1.536-1.92.592-.13 1.048-.597 1.189-1.189.2-.909.827-1.536 1.731-1.731A10 10 0 0 0 12 2z"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('colorExtractorTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('colorExtractorDesc')}</p>
            <svg className="absolute top-6 right-6 w-5 h-5 text-border transition-all group-hover:text-brand group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </Link>

          {/* Tech Converter Card */}
          <Link href="/tech-converter" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-brand before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
                <path d="M7 8h10"/>
                <path d="M7 12h4"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('techConverterTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('techConverterDesc')}</p>
            <svg className="absolute top-6 right-6 w-5 h-5 text-border transition-all group-hover:text-brand group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </Link>
          
          {/* Favicon Generator Card */}
          <Link href="/favicon-generator" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-brand before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="4"/>
                <line x1="21.17" y1="8" x2="12" y2="8"/>
                <line x1="3.95" y1="6.06" x2="8.54" y2="14"/>
                <line x1="10.88" y1="21.94" x2="15.46" y2="14"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('faviconGeneratorTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('faviconGeneratorDesc')}</p>
          </Link>

          {/* Audio Extractor Card */}
          <Link href="/audio-extractor" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-brand before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('audioExtractorTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('audioExtractorDesc')}</p>
          </Link>

          {/* Volume Booster Card */}
          <Link href="/volume-booster" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-brand before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('volumeBoosterTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('volumeBoosterDesc')}</p>
          </Link>

          {/* NEW TOOLS */}

          {/* Video to GIF Card */}
          <Link href="/video-to-gif" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-brand before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
               <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <path d="M8 21h8"/><path d="M12 17v4"/><path d="m9 8 6 3-6 3V8z"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('videoToGifTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('videoToGifDesc')}</p>
          </Link>

          {/* MP3 Cutter Card */}
          <Link href="/mp3-cutter" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-brand before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10h4l3 8 4-12 3 8h4"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('mp3CutterTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('mp3CutterDesc')}</p>
          </Link>

          {/* Audio Converter Card */}
          <Link href="/audio-converter" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-brand before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10v6M6 4v16M10 4v16M14 4v16M18 4v16"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('audioConverterTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('audioConverterDesc')}</p>
          </Link>

          {/* Smart Compressor Card */}
          <Link href="/smart-compressor" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-brand before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14V4h16v10M4 14l5-5 5 5 5-5 5 5M4 14v7h16v-7"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('smartCompressorTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('smartCompressorDesc')}</p>
          </Link>

          {/* Modern Image Converter Card */}
          <Link href="/image-converter" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-brand before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4M8 12h8"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('imageConverterTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('imageConverterDesc')}</p>
          </Link>

          {/* File Armor Card */}
          <Link href="/file-armor" className="group relative p-6 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm transition-all hover:border-[rgba(30,74,255,0.15)] hover:shadow-lg hover:shadow-glow hover:-translate-y-[3px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-brand before:to-transparent before:opacity-0 hover:before:opacity-45">
            <div className="w-[44px] h-[44px] flex items-center justify-center rounded-md bg-overlay text-brand mb-4 transition-all group-hover:bg-[rgba(30,74,255,0.08)] group-hover:scale-105">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-dark mb-1">{t('fileArmorTitle')}</h3>
            <p className="text-[13px] text-secondary leading-[1.5]">{t('fileArmorDesc')}</p>
          </Link>
        </div>
      </section>

      <section className="mt-20 py-6 animate-[fadeInUp_0.8s_0.6s_both]">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-5 px-8 bg-card backdrop-blur-md border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-3 text-[13px] font-medium text-secondary">
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6l.7 2.2H15l-1.8 1.3.7 2.2L12 10.4l-1.9 1.3.7-2.2L9 8.2h2.3z" fill="currentColor" stroke="none"/>
              <circle cx="12" cy="4.5" r="0.8" fill="currentColor" stroke="none"/>
              <circle cx="15.8" cy="5.5" r="0.8" fill="currentColor" stroke="none"/>
              <circle cx="18" cy="9" r="0.8" fill="currentColor" stroke="none"/>
              <circle cx="18" cy="13" r="0.8" fill="currentColor" stroke="none"/>
              <circle cx="15.8" cy="16.5" r="0.8" fill="currentColor" stroke="none"/>
              <circle cx="12" cy="17.5" r="0.8" fill="currentColor" stroke="none"/>
              <circle cx="8.2" cy="16.5" r="0.8" fill="currentColor" stroke="none"/>
              <circle cx="6" cy="13" r="0.8" fill="currentColor" stroke="none"/>
              <circle cx="6" cy="9" r="0.8" fill="currentColor" stroke="none"/>
              <circle cx="8.2" cy="5.5" r="0.8" fill="currentColor" stroke="none"/>
            </svg>
            <span>{t('gdpr')}</span>
          </div>
          <div className="w-[40px] md:w-px h-px md:h-6 bg-gradient-to-r md:bg-gradient-to-b from-transparent via-gold to-transparent opacity-50" />
          <div className="flex items-center gap-3 text-[13px] font-medium text-secondary">
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
              <line x1="6" y1="6" x2="6.01" y2="6"/>
              <line x1="6" y1="18" x2="6.01" y2="18"/>
            </svg>
            <span>{t('euInfra')}</span>
          </div>
          <div className="w-[40px] md:w-px h-px md:h-6 bg-gradient-to-r md:bg-gradient-to-b from-transparent via-gold to-transparent opacity-50" />
          <div className="flex items-center gap-3 text-[13px] font-medium text-secondary">
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>{t('encrypted')}</span>
          </div>
        </div>
      </section>
    </>
  );
}
