import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import VisualMtrEngine from '@/components/tools/visual-mtr/VisualMtrEngine';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'VisualMtr' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function VisualMtrPage() {
  return (
    <div className="animate-in fade-in duration-700">
      <VisualMtrEngine />
    </div>
  );
}
