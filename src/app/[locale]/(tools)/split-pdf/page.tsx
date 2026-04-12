import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { SplitPDFEngine } from '@/components/tools/split/SplitPDFEngine';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SplitPDF' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function SplitPDFPage() {
  return (
    <div className="flex flex-col items-center">
      <SplitPDFEngine />
    </div>
  );
}
