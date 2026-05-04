import {createNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';

export const locales = [
  'en', 'nl', 'fr', 'de', 'it', 'da', 'el', 'es', 'pt', 'fi', 
  'sv', 'cs', 'sk', 'sl', 'et', 'hu', 'lv', 'lt', 'mt', 'pl', 
  'bg', 'ga', 'ro', 'hr'
] as const;

export type Locale = (typeof locales)[number];

export const labels: Record<Locale, string> = {
  en: 'English',
  nl: 'Nederlands',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  da: 'Dansk',
  el: 'Ελληνικά',
  es: 'Español',
  pt: 'Português',
  fi: 'Suomi',
  sv: 'Svenska',
  cs: 'Čeština',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  et: 'Eesti',
  hu: 'Magyar',
  lv: 'Latviešu',
  lt: 'Lietuvių',
  mt: 'Malti',
  pl: 'Polski',
  bg: 'Български',
  ga: 'Gaeilge',
  ro: 'Română',
  hr: 'Hrvatski'
};

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/pdf-merge': '/pdf-merge',
    '/terms': '/terms',
    '/privacy': '/privacy',
    '/split-pdf': '/split-pdf',
    '/pdf-to-image': '/pdf-to-image',
    '/protect-pdf': '/protect-pdf',
    '/metadata-cleaner': '/metadata-cleaner',
    '/qr-generator': '/qr-generator',
    '/hash-verifier': '/hash-verifier',
    '/text-encryptor': '/text-encryptor',
    '/svg-optimizer': '/svg-optimizer',
    '/color-extractor': '/color-extractor',
    '/tech-converter': '/tech-converter',
    '/favicon-generator': '/favicon-generator',
    '/audio-extractor': '/audio-extractor',
    '/volume-booster': '/volume-booster',
    '/video-to-gif': '/video-to-gif',
    '/mp3-cutter': '/mp3-cutter',
    '/audio-converter': '/audio-converter',
    '/smart-compressor': '/smart-compressor',
    '/image-converter': '/image-converter',
    '/file-armor': '/file-armor',
    '/background-remover': '/background-remover',
  }
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
