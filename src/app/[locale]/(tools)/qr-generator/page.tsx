import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { QRGeneratorEngine } from '@/components/tools/qr-generator/QRGeneratorEngine';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'QRGenerator' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function QRGeneratorPage() {
  return (
    <div className="flex flex-col items-center">
      <QRGeneratorEngine />
    </div>
  );
}
