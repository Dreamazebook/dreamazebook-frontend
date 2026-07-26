import { routing, type Locale } from '@/i18n/routing';

/**
 * Normalize a path for next-intl router.push — strips a leading locale segment if present.
 * e.g. "/en/preview/abc123?bookid=1" → "/preview/abc123?bookid=1"
 */
export function toRouterPath(href: string): string {
  if (!href) return href;

  const trimmed = href.trim();
  const qIndex = trimmed.indexOf('?');
  const pathPart = qIndex >= 0 ? trimmed.slice(0, qIndex) : trimmed;
  const queryPart = qIndex >= 0 ? trimmed.slice(qIndex) : '';

  const segments = pathPart.split('/').filter(Boolean);
  if (segments.length > 0 && routing.locales.includes(segments[0] as Locale)) {
    const withoutLocale = '/' + segments.slice(1).join('/');
    const normalizedPath = withoutLocale === '/' ? '/' : withoutLocale.replace(/\/$/, '') || '/';
    return normalizedPath + queryPart;
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
