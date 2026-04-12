import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { HashVerifierEngine } from '@/components/tools/hash-verifier/HashVerifierEngine';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HashVerifier' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function HashVerifierPage() {
  return (
    <div className="flex flex-col items-center">
      <HashVerifierEngine />
    </div>
  );
}
