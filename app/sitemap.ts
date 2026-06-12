import type { MetadataRoute } from 'next';
import { BOOK_CANONICAL_SLUGS } from '@/constants/bookRoutes';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dreamazebook.com';
  const locales = ['en', 'fr', 'zh'];

  // Core static pages
  const staticPages = [
    '',
    '/books',
    '/about-us',
    '/faq',
    '/contact-us',
    '/delivery-information',
    '/terms-and-conditions',
    '/privacy-policy',
    '/return-policy',
    '/personalize',
    '/christmas',
    '/mothers-day',
  ];

  // Generate main entries with all languages
  const mainSitemap: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => {
      const pagePath = page === '' ? '/' : page;
      return {
        url: `${baseUrl}/${locale}${pagePath}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority:
          page === ''
            ? 1.0
            : page === '/books'
              ? 0.9
              : page === '/personalize'
                ? 0.85
                : 0.8,
      };
    })
  );

  const bookSitemap: MetadataRoute.Sitemap = BOOK_CANONICAL_SLUGS.flatMap((slug) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/books/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  return [...mainSitemap, ...bookSitemap];
}
