import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Legal' });
  return {
    title: t('privacyTitle'),
  };
}

export default function PrivacyPage() {
  const t = useTranslations('Legal');

  return (
    <div className="max-w-[800px] mx-auto animate-[fadeInUp_0.8s_both]">
      <div className="mb-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-brand transition-colors group">
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t.rich('backToTools', { fallback: 'Back to Tools' })}
        </Link>
      </div>

      <h1 className="text-[44px] font-bold text-dark tracking-[-0.02em] mb-6">{t('privacyTitle')}</h1>
      <p className="text-[17px] text-secondary mb-12 leading-[1.6]">{t('privacyIntro')}</p>

      <div className="grid grid-cols-1 gap-8">
        <section className="glass-card p-8 rounded-2xl border border-border">
          <h2 className="text-[20px] font-bold text-dark mb-4 border-b border-border pb-4 flex items-center gap-3 text-brand">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('dataHandlingTitle')}
          </h2>
          <p className="text-[15px] text-secondary leading-[1.7]">
            {t('dataHandlingText')}
          </p>
        </section>

        <section className="p-4">
          <h2 className="text-[18px] font-bold text-dark mb-4">{t('noTrackingTitle')}</h2>
          <p className="text-[14px] text-secondary leading-[1.7] mb-4">
            {t('noTrackingText')}
          </p>
          
          <h2 className="text-[18px] font-bold text-dark mb-4">{t('zeroUploadTitle')}</h2>
          <p className="text-[14px] text-secondary leading-[1.7]">
            {t('zeroUploadText')}
          </p>
        </section>
      </div>
    </div>
  );
}
