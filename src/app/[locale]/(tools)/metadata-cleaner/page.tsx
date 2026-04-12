import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { MetadataCleanerEngine } from '@/components/tools/metadata-cleaner/MetadataCleanerEngine';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'MetadataCleaner' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function MetadataCleanerPage() {
  return (
    <div className="flex flex-col items-center">
      <MetadataCleanerEngine />
    </div>
  );
}
