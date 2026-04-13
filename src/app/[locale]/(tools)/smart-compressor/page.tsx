import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import SmartCompressor from '@/components/SmartCompressor';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SmartCompressor' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function SmartCompressorPage() {
  const t = useTranslations('SmartCompressor');

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-dark tracking-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-secondary max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      <SmartCompressor />
    </div>
  );
}
