/**
 * OG Image Generator for Dynamic Content
 */

interface OGImageConfig {
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

/**
 * Generate OG image URL using external service or local API
 * Can be used with services like og-image.vercel.app or custom implementation
 */
export const generateOGImage = (config: OGImageConfig): string => {
  const params = new URLSearchParams({
    title: config.title,
    ...(config.subtitle && { subtitle: config.subtitle }),
  });

  // Option 1: Using Vercel OG Image service (requires setup)
  // return `https://og-image.vercel.app/${encodeURIComponent(config.title)}.png?theme=dark&md=1&fontSize=100px`;

  // Option 2: Using local endpoint (implement /api/og)
  return `/api/og?${params.toString()}`;
};

/**
 * Generate canonical URL with locale support
 */
export const generateCanonicalURL = (
  path: string,
  locale?: string | null,
  includeTrailingSlash = true
): string => {
  const baseUrl = 'https://dreamazebook.com';
  const localePart = locale && locale !== 'en' ? `/${locale}` : '/en';
  const pathPart = path.startsWith('/') ? path : `/${path}`;
  const trailingSlash = includeTrailingSlash && !pathPart.endsWith('/') ? '/' : '';

  return `${baseUrl}${localePart}${pathPart}${trailingSlash}`;
};

/**
 * Generate alternate links for different languages
 */
export const generateAlternateLinks = (path: string): Record<string, string> => {
  const locales = ['en', 'fr', 'zh'];
  return {
    en: generateCanonicalURL(path, 'en'),
    fr: generateCanonicalURL(path, 'fr'),
    zh: generateCanonicalURL(path, 'zh'),
    'x-default': generateCanonicalURL(path, 'en'),
  };
};
