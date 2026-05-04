import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import DnsCheckerEngine from '@/components/tools/dns-checker/DnsCheckerEngine';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'DnsChecker' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function DnsCheckerPage() {
  return (
    <div className="animate-in fade-in duration-700">
      <DnsCheckerEngine />
    </div>
  );
}
