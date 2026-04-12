import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { TextEncryptorEngine } from '@/components/tools/text-encryptor/TextEncryptorEngine';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'TextEncryptor' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function TextEncryptorPage() {
  return (
    <div className="flex flex-col items-center">
      <TextEncryptorEngine />
    </div>
  );
}
