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

/** Absolute canonical URL with /en locale prefix. */
export function getBookAbsoluteUrl(slug: string): string {
  return `https://dreamazebook.com/en/books/${slug}`;
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

/** Placeholder path token used before a real preview batch id exists. */
export const PENDING_PREVIEW_TOKEN = 'new';

function toSearchParams(
  query?: Record<string, string | undefined | null> | URLSearchParams
): URLSearchParams {
  if (!query) return new URLSearchParams();
  if (query instanceof URLSearchParams) {
    return new URLSearchParams(query.toString());
  }
  return new URLSearchParams(
    Object.entries(query).flatMap(([key, value]) =>
      value == null || value === '' ? [] : [[key, String(value)]]
    )
  );
}

function toQueryString(
  query?: Record<string, string | undefined | null> | URLSearchParams
): string {
  const qs = toSearchParams(query).toString();
  return qs ? `?${qs}` : '';
}

/**
 * Normalize preview query so `bookid` is always the SEO slug in the URL.
 * Accepts legacy PICBOOK_* / book / spu and rewrites to canonical slug.
 */
export function normalizePreviewQuery(
  query?: Record<string, string | undefined | null> | URLSearchParams
): URLSearchParams {
  const params = toSearchParams(query);
  const book = params.get('bookid') || params.get('book') || params.get('spu') || '';
  if (book) {
    const { slug } = resolveBookRouteFromParam(book);
    params.set('bookid', slug);
    params.delete('book');
    params.delete('spu');
  }
  return params;
}

/** Editor entry: `/books/{slug}/create` */
export function getBookCreatePath(
  productIdOrSlug: string,
  query?: Record<string, string | undefined | null> | URLSearchParams
): string {
  const { slug } = resolveBookRouteFromParam(productIdOrSlug);
  return `/books/${slug}/create${toQueryString(query)}`;
}

/** Preview book: `/preview/{previewToken}` */
export function getPreviewPath(
  previewToken: string,
  query?: Record<string, string | undefined | null> | URLSearchParams
): string {
  const token = normalizeRouteSegment(previewToken || PENDING_PREVIEW_TOKEN);
  return `/preview/${encodeURIComponent(token)}${toQueryString(normalizePreviewQuery(query))}`;
}

/** Format / cover selection: `/preview/{previewToken}/formats` */
export function getPreviewFormatsPath(
  previewToken: string,
  query?: Record<string, string | undefined | null> | URLSearchParams
): string {
  const token = normalizeRouteSegment(previewToken || PENDING_PREVIEW_TOKEN);
  return `/preview/${encodeURIComponent(token)}/formats${toQueryString(normalizePreviewQuery(query))}`;
}
