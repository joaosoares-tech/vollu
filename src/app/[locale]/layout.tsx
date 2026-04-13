import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Link, locales } from '@/navigation';
import { LanguagePicker } from '@/components/layout/LanguagePicker';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Layout' });
  const baseUrl = 'https://vollu.app';
  
  const languageAlternates = locales.reduce((acc, loc) => {
    acc[loc] = `${baseUrl}/${loc}`;
    return acc;
  }, {} as Record<string, string>);

  return {
    metadataBase: new URL(baseUrl),
    title: {
      template: '%s | VOLLU.app',
      default: `VOLLU.app — ${t('title') || 'Secure European Web Tools'}`,
    },
    description: t('description') || 'Powerful browser-based apps running completely online. Fast, private, and fully encrypted.',
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        ...languageAlternates,
        'x-default': `${baseUrl}/en`,
      },
    },
    openGraph: {
      title: 'VOLLU.app',
      description: 'Secure European Web Tools — Fast, private, and GDPR compliant.',
      url: baseUrl,
      siteName: 'VOLLU.app',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'VOLLU.app',
      description: 'Secure European Web Tools',
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  const t = await getTranslations('Layout');

  return (
    <html lang={locale} className={inter.variable}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <div className="page-background" aria-hidden="true" />

          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center px-8 bg-[#F7F9FBB8] backdrop-blur-md border-b border-[rgba(225,230,238,0.6)] shadow-sm">
            <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 no-underline transition-opacity hover:opacity-85">
                <Image src="/logo-icon.png" alt="VOLLU.app Logo" width={36} height={36} className="rounded-sm object-contain" />
                <span className="text-[20px] font-bold text-dark tracking-tight">
                  VOLLU<span className="text-brand">.app</span>
                </span>
              </Link>

              <div className="flex items-center gap-6">
                <LanguagePicker />
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="pt-[120px] pb-16">
            <div className="w-full max-w-[1200px] mx-auto px-6">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-16 py-8 border-t border-border">
            <div className="w-full max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-secondary opacity-70">
                &copy; 2026 VOLLU.app — {t('footerRights')}
              </p>
              <nav className="flex gap-6">
                <Link href="/privacy" className="text-xs text-secondary opacity-70 hover:text-brand hover:opacity-100 transition-all">{t('privacy')}</Link>
                <Link href="/terms" className="text-xs text-secondary opacity-70 hover:text-brand hover:opacity-100 transition-all">{t('terms')}</Link>
                <Link href="/" className="text-xs text-secondary opacity-70 hover:text-brand hover:opacity-100 transition-all">{t('contact')}</Link>
              </nav>
            </div>
          </footer>
        </NextIntlClientProvider>
        <script defer src="https://cdn.w3b.pt/script.js" data-website-id="918e6879-3a44-40a5-9b78-3850dbab9916"></script>
      </body>
    </html>
  );
}
