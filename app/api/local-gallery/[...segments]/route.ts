import { NextResponse } from 'next/server';
import { WEBSITE_CDN_URL } from '@/constants/cdn';
import { logApiError } from '@/utils/errorLogger';

export const dynamic = 'force-dynamic';

interface GalleryItem {
  id: string;
  order: number;
  type: string;
  alt: string;
  src: string;
  meta?: any;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ segments?: string[] }> }
) {
  try {
    const { segments = [] } = await context.params;
    // Normalize to prevent path traversal
    const rel = ('/' + segments.join('/')).replace(/\\/g, '/');
    const safeRel = rel
      .replace(/^\/+/, '')
      .replace(/\.+\//g, '')
      .replace(/\/{2,}/g, '/')
      .replace(/\.$/, '');

    if (!safeRel) {
      return NextResponse.json(
        { success: false, message: 'Missing gallery path' },
        { status: 400 }
      );
    }

    const cdnBase = WEBSITE_CDN_URL.endsWith('/')
      ? WEBSITE_CDN_URL
      : `${WEBSITE_CDN_URL}/`;
    const galleryPath = safeRel.replace(/\/+$/, '');
    const galleryBaseUrl = `${cdnBase}${galleryPath}`;
    const indexUrl = `${galleryBaseUrl}/index.json`;

    const resp = await fetch(indexUrl, { cache: 'no-store' });
    if (!resp.ok) {
      throw new Error(
        `Failed to fetch gallery index: ${resp.status} ${resp.statusText}`
      );
    }

    const payload = await resp.json();
    const rawItems = Array.isArray(payload?.files)
      ? payload.files
      : Array.isArray(payload)
      ? payload
      : [];

    const normalizeSrc = (src: string) => src?.replace(/^\.\//, '').replace(/^\/+/, '');
    const buildFullUrl = (src: string) => {
      if (!src) return null;
      if (/^https?:\/\//i.test(src)) return src;
      const cleaned = normalizeSrc(src);
      return `${galleryBaseUrl}/${cleaned}`;
    };

    const normalizedItems: GalleryItem[] = rawItems
      .map((entry: any, idx: number): GalleryItem | null => {
        if (typeof entry === 'string') {
          const src = buildFullUrl(entry);
          if (!src) return null;
          return {
            id: `item-${idx}`,
            order: idx + 1,
            type: entry.match(/\.(mp4|webm)$/i) ? 'video' : 'image',
            alt: '',
            src,
          };
        }

        if (entry && typeof entry === 'object') {
          const src = buildFullUrl(entry.src || entry.url || entry.path);
          if (!src) return null;
          return {
            id: entry.id ?? `item-${idx}`,
            order:
              typeof entry.order === 'number'
                ? entry.order
                : parseInt(String(entry.order ?? idx + 1), 10) || idx + 1,
            type: entry.type || (src.match(/\.(mp4|webm)$/i) ? 'video' : 'image'),
            alt: entry.alt || '',
            src,
            meta: entry,
          };
        }

        return null;
      })
      .filter((item: GalleryItem | null): item is GalleryItem => Boolean(item))
      .sort(
        (a: GalleryItem, b: GalleryItem) =>
          (a.order || 0) - (b.order || 0)
      );

    const files = normalizedItems.map((item: GalleryItem) => item.src);

    return NextResponse.json({
      success: true,
      files,
      items: normalizedItems,
    });
  } catch (err: any) {
    logApiError({ error: err, context: 'Failed to read gallery' });
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to read gallery' },
      { status: 500 }
    );
  }
}
