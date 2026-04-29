import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const R2_BASE = 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ bookId: string; coverId: string }> },
) {
  // 强制禁用 Next/平台层缓存
  noStore();

  const { bookId, coverId } = await ctx.params;
  const seasonRaw = (req.nextUrl.searchParams.get('season') || '').toLowerCase();
  if (!bookId || !coverId) {
    return NextResponse.json({ error: 'Missing bookId or coverId' }, { status: 400 });
  }

  // 与前端逻辑保持一致：SPU 一律使用大写，并处理 GOODNIGHT3 特例
  let normalizedBookId = bookId.trim().toUpperCase();
  if (normalizedBookId === 'PICBOOK_GOODNIGHT3') {
    normalizedBookId = 'PICBOOK_GOODNIGHT';
  }

  const folder = `${R2_BASE}/products/picbooks/${encodeURIComponent(
    normalizedBookId,
  )}/covers/cover_${encodeURIComponent(coverId)}`;

  const seasonalAllowed = new Set(['spring', 'summer', 'autumn', 'winter']);
  const useSeasonalPicbook =
    normalizedBookId === 'PICBOOK_BIRTHDAY' &&
    (coverId === '1' || coverId === '2') &&
    seasonalAllowed.has(seasonRaw);

  const candidates = useSeasonalPicbook
    ? [`${folder}/${seasonRaw}.webp`, `${folder}/base.webp`]
    : [`${folder}/base.webp`];

  try {
    let lastStatus = 404;
    for (const imageUrl of candidates) {
      const res = await fetch(imageUrl, { cache: 'no-store' });
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        return new NextResponse(arrayBuffer, {
          status: 200,
          headers: {
            'Content-Type': res.headers.get('Content-Type') ?? 'image/webp',
            'Cache-Control': 'private, no-store, no-cache, max-age=0, must-revalidate',
            'CDN-Cache-Control': 'no-store',
            'Netlify-CDN-Cache-Control': 'no-store',
            'Surrogate-Control': 'no-store',
            Pragma: 'no-cache',
            Expires: '0',
          },
        });
      }
      lastStatus = res.status;
    }
    return NextResponse.json(
      { error: 'cover image not found on R2' },
      { status: lastStatus || 404 },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cover image from R2' }, { status: 500 });
  }
}

