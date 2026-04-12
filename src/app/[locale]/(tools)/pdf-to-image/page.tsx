import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { PDFToImageEngine } from '@/components/tools/pdf-to-image/PDFToImageEngine';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PDFToImage' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function PDFToImagePage() {
  return (
    <div className="flex flex-col items-center">
      <PDFToImageEngine />
    </div>
  );
}
