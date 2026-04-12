import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { SvgOptimizerEngine } from '@/components/tools/svg-optimizer/SvgOptimizerEngine';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SvgOptimizer' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function SvgOptimizerPage() {
  const t = useTranslations('SvgOptimizer');

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

      <SvgOptimizerEngine />
    </div>
  );
}
