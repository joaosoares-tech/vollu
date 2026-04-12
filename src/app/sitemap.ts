import { MetadataRoute } from 'next';
import { locales } from '@/navigation';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://vollu.app';
  
  const routes = ['', '/pdf-merge', '/terms', '/privacy'];
  
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate entries for each locale and each route
  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });

  return sitemapEntries;
}
