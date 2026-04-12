import { Metadata } from 'next';
import { PDFMergeEngine } from '@/components/tools/pdf-merge/PDFMergeEngine';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PdfMerge' });
  
  return {
    title: t('title') + ' — VOLLU.app',
    description: t('description'),
  };
}

export default function PDFMergePage() {
  const t = useTranslations('PdfMerge');

  return (
    <>
      {/* Back to tools button */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-brand transition-colors group">
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('back')}
        </Link>
      </div>

      <PDFMergeEngine />
    </>
  );
}
