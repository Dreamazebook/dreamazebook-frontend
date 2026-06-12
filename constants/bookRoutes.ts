/**
 * Canonical SEO slug routes for book detail pages.
 * Maps legacy product IDs (PICBOOK_*) to human-readable URL segments.
 */

const BOOK_SLUG_BY_PRODUCT_ID: Record<string, string> = {
  PICBOOK_GOODNIGHT3: 'good-night-to-you-personalized-bedtime-book',
  PICBOOK_GOODNIGHT: 'good-night-to-you-personalized-bedtime-book',
  PICBOOK_DAD: 'dad-and-me-personalized-book-for-dad',
  PICBOOK_MOM: 'the-way-i-see-you-mama-personalized-book-for-mom',
  PICBOOK_MELODY: 'your-melody-personalized-baby-book',
  PICBOOK_BIRTHDAY: 'happy-birthday-personalized-birthday-book',
  PICBOOK_BRAVEY: 'youre-brave-in-many-ways-personalized-book',
  PICBOOK_SANTA: 'santas-letter-personalized-christmas-book',
};

const BOOK_PRODUCT_ID_BY_SLUG: Record<string, string> = {
  'good-night-to-you-personalized-bedtime-book': 'PICBOOK_GOODNIGHT3',
  'dad-and-me-personalized-book-for-dad': 'PICBOOK_DAD',
  'the-way-i-see-you-mama-personalized-book-for-mom': 'PICBOOK_MOM',
  'your-melody-personalized-baby-book': 'PICBOOK_MELODY',
  'happy-birthday-personalized-birthday-book': 'PICBOOK_BIRTHDAY',
  'youre-brave-in-many-ways-personalized-book': 'PICBOOK_BRAVEY',
  'santas-letter-personalized-christmas-book': 'PICBOOK_SANTA',
};

/** All canonical slugs (deduplicated) for sitemap generation. */
export const BOOK_CANONICAL_SLUGS = Array.from(
  new Set(Object.values(BOOK_SLUG_BY_PRODUCT_ID))
);

const normalizeRouteSegment = (segment: string): string =>
  decodeURIComponent(segment).trim();

const normalizeProductId = (productId: string): string =>
  normalizeRouteSegment(productId).toUpperCase();

export function getBookSlug(productId: string): string | undefined {
  return BOOK_SLUG_BY_PRODUCT_ID[normalizeProductId(productId)];
}

/**
 * If the route segment is a legacy product ID, return its canonical slug.
 * Returns null when the segment is already a slug or unknown.
 */
export function getCanonicalBookSlug(segment: string): string | null {
  const normalized = normalizeRouteSegment(segment);
  const upper = normalized.toUpperCase();

  if (BOOK_SLUG_BY_PRODUCT_ID[upper]) {
    return BOOK_SLUG_BY_PRODUCT_ID[upper];
  }

  if (BOOK_PRODUCT_ID_BY_SLUG[normalized]) {
    return null;
  }

  return null;
}

export function resolveBookRouteParam(
  param: string
): { productId: string; slug: string } | null {
  const normalized = normalizeRouteSegment(param);

  const slugProductId = BOOK_PRODUCT_ID_BY_SLUG[normalized];
  if (slugProductId) {
    return { productId: slugProductId, slug: normalized };
  }

  const upper = normalized.toUpperCase();
  const slug = BOOK_SLUG_BY_PRODUCT_ID[upper];
  if (slug) {
    return { productId: upper, slug };
  }

  return null;
}

/** Locale-aware app path, e.g. `/books/good-night-to-you-personalized-bedtime-book` */
export function getBookPath(productIdOrSlug: string): string {
  const resolved = resolveBookRouteParam(productIdOrSlug);
  if (resolved) {
    return `/books/${resolved.slug}`;
  }

  const slug = getBookSlug(productIdOrSlug);
  if (slug) {
    return `/books/${slug}`;
  }

  return `/books/${normalizeRouteSegment(productIdOrSlug)}`;
}

/** Absolute canonical URL (locale-less, matches SEO spec). */
export function getBookAbsoluteUrl(slug: string): string {
  return `https://dreamazebook.com/books/${slug}`;
}

export function getBookAbsoluteUrlFromProductId(productIdOrSlug: string): string {
  const { slug } = resolveBookRouteFromParam(productIdOrSlug);
  return getBookAbsoluteUrl(slug);
}

export function resolveBookRouteFromParam(param: string): {
  productId: string;
  slug: string;
} {
  const resolved = resolveBookRouteParam(param);
  if (resolved) {
    return resolved;
  }

  const fallbackId = normalizeRouteSegment(param);
  const slug = getBookSlug(fallbackId) ?? fallbackId;
  return { productId: fallbackId, slug };
}
