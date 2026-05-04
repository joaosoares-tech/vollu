import { useTranslations } from 'next-intl';
import { ToolSearch } from '@/components/home/ToolSearch';

export default function Home() {
  const t = useTranslations('Index');
  const tCat = useTranslations('Categories');

  const categories = {
    pdf: tCat('pdf'),
    image: tCat('image'),
    video: tCat('video'),
    security: tCat('security'),
    dev: tCat('dev')
  };

  const tools = [
    {
      id: 'pdf-merge',
      category: 'pdf',
      title: t('pdfMergeTitle'),
      description: t('pdfMergeDesc'),
      href: '/pdf-merge',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      )
    },
    {
      id: 'split-pdf',
      category: 'pdf',
      title: t('splitPdfTitle'),
      description: t('splitPdfDesc'),
      href: '/split-pdf',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
        </svg>
      )
    },
    {
      id: 'pdf-to-image',
      category: 'pdf',
      title: t('pdfToImageTitle'),
      description: t('pdfToImageDesc'),
      href: '/pdf-to-image',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      )
    },
    {
      id: 'protect-pdf',
      category: 'pdf',
      title: t('protectPdfTitle'),
      description: t('protectPdfDesc'),
      href: '/protect-pdf',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      )
    },
    {
      id: 'metadata-cleaner',
      category: 'image',
      title: t('metadataCleanerTitle'),
      description: t('metadataCleanerDesc'),
      href: '/metadata-cleaner',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6l3 18h12l3-18H3z"/>
          <path d="M19 6V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      )
    },
    {
      id: 'qr-generator',
      category: 'security',
      title: t('qrGeneratorTitle'),
      description: t('qrGeneratorDesc'),
      href: '/qr-generator',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
          <line x1="10" y1="10" x2="10.01" y2="10"/>
        </svg>
      )
    },
    {
      id: 'hash-verifier',
      category: 'security',
      title: t('hashVerifierTitle'),
      description: t('hashVerifierDesc'),
      href: '/hash-verifier',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14c0 1.1.9 2 2 2h2v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-4h2c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v10z"/>
          <line x1="12" y1="6" x2="12" y2="10"/>
          <line x1="8" y1="8" x2="16" y2="8"/>
        </svg>
      )
    },
    {
      id: 'text-encryptor',
      category: 'security',
      title: t('textEncryptorTitle'),
      description: t('textEncryptorDesc'),
      href: '/text-encryptor',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          <circle cx="12" cy="16" r="1"/>
        </svg>
      )
    },
    {
      id: 'svg-optimizer',
      category: 'image',
      title: t('svgOptimizerTitle'),
      description: t('svgOptimizerDesc'),
      href: '/svg-optimizer',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m11.1 12.1-3.3 4.3a.5.5 0 0 1-.8 0L3.7 12a.5.5 0 0 1 .1-.7l4.3-3.3a.5.5 0 0 1 .7.1z"/>
          <path d="m12.9 12.1 3.3 4.3a.5.5 0 0 0 .8 0l3.3-4.4a.5.5 0 0 0-.1-.7L15.9 8a.5.5 0 0 0-.7.1z"/>
          <path d="m9.1 11.9 3.3-4.3a.5.5 0 0 1 .8 0l3.3 4.4a.5.5 0 0 1-.1.7L12.1 16a.5.5 0 0 1-.7-.1z"/>
        </svg>
      )
    },
    {
      id: 'color-extractor',
      category: 'image',
      title: t('colorExtractorTitle'),
      description: t('colorExtractorDesc'),
      href: '/color-extractor',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.928 0 1.72-.627 1.92-1.536.13-.592.597-1.048 1.189-1.189.909-.2 1.536-.992 1.536-1.92 0-.928.627-1.72 1.536-1.92.592-.13 1.048-.597 1.189-1.189.2-.909.827-1.536 1.731-1.731A10 10 0 0 0 12 2z"/>
        </svg>
      )
    },
    {
      id: 'tech-converter',
      category: 'dev',
      title: t('techConverterTitle'),
      description: t('techConverterDesc'),
      href: '/tech-converter',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
          <path d="M7 8h10"/>
          <path d="M7 12h4"/>
        </svg>
      )
    },
    {
      id: 'favicon-generator',
      category: 'image',
      title: t('faviconGeneratorTitle'),
      description: t('faviconGeneratorDesc'),
      href: '/favicon-generator',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="4"/>
          <line x1="21.17" y1="8" x2="12" y2="8"/>
          <line x1="3.95" y1="6.06" x2="8.54" y2="14"/>
          <line x1="10.88" y1="21.94" x2="15.46" y2="14"/>
        </svg>
      )
    },
    {
      id: 'audio-extractor',
      category: 'video',
      title: t('audioExtractorTitle'),
      description: t('audioExtractorDesc'),
      href: '/audio-extractor',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
      )
    },
    {
      id: 'volume-booster',
      category: 'video',
      title: t('volumeBoosterTitle'),
      description: t('volumeBoosterDesc'),
      href: '/volume-booster',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
      )
    },
    {
      id: 'video-to-gif',
      category: 'video',
      title: t('videoToGifTitle'),
      description: t('videoToGifDesc'),
      href: '/video-to-gif',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <path d="M8 21h8"/><path d="M12 17v4"/><path d="m9 8 6 3-6 3V8z"/>
        </svg>
      )
    },
    {
      id: 'mp3-cutter',
      category: 'video',
      title: t('mp3CutterTitle'),
      description: t('mp3CutterDesc'),
      href: '/mp3-cutter',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10h4l3 8 4-12 3 8h4"/>
        </svg>
      )
    },
    {
      id: 'audio-converter',
      category: 'video',
      title: t('audioConverterTitle'),
      description: t('audioConverterDesc'),
      href: '/audio-converter',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10v6M6 4v16M10 4v16M14 4v16M18 4v16"/>
        </svg>
      )
    },
    {
      id: 'smart-compressor',
      category: 'image',
      title: t('smartCompressorTitle'),
      description: t('smartCompressorDesc'),
      href: '/smart-compressor',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14V4h16v10M4 14l5-5 5 5 5-5 5 5M4 14v7h16v-7"/>
        </svg>
      )
    },
    {
      id: 'image-converter',
      category: 'image',
      title: t('imageConverterTitle'),
      description: t('imageConverterDesc'),
      href: '/image-converter',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4M8 12h8"/>
        </svg>
      )
    },
    {
      id: 'file-armor',
      category: 'security',
      title: t('fileArmorTitle'),
      description: t('fileArmorDesc'),
      href: '/file-armor',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      )
    },
    {
      id: 'background-remover',
      category: 'image',
      title: t('backgroundRemoverTitle'),
      description: t('backgroundRemoverDesc'),
      href: '/background-remover',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
          <path d="M12 6a6 6 0 0 0-6 6c0 3.31 2.69 6 6 6s6-2.69 6-6a6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/>
          <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
        </svg>
      )
    },
    {
      id: 'dns-checker',
      category: 'dev',
      title: t('dnsCheckerTitle'),
      description: t('dnsCheckerDesc'),
      href: '/dns-checker',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )
    },
    {
      id: 'visual-mtr',
      category: 'dev',
      title: t('visualMtrTitle'),
      description: t('visualMtrDesc'),
      href: '/visual-mtr',
      icon: (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      )
    }
  ];

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

      <ToolSearch 
        tools={tools} 
        placeholder={t('searchPlaceholder')}
        platformLabel={t('platform')}
        toolsTitle={t('toolsTitle')}
        noResults={t('noResults')}
        categoryNames={categories}
        allLabel={tCat('all')}
      />

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
