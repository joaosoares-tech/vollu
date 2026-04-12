import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { ProtectPDFEngine } from '@/components/tools/security/ProtectPDFEngine';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Security' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function ProtectPDFPage() {
  return (
    <div className="flex flex-col items-center">
      <ProtectPDFEngine />
    </div>
  );
}
