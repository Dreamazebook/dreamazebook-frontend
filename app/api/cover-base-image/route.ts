import { NextRequest, NextResponse } from 'next/server';
import { logApiError } from '@/utils/errorLogger';

// 这个接口的响应内容依赖 query（bookId/coverId/imageUrl）。
// 线上如果被 CDN/浏览器错误缓存（尤其是忽略 query 的缓存键），会导致不同书/不同 coverId 返回同一张图。
// 因此强制为动态，并禁用缓存。
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const R2_BASE = 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev';
const ALLOWED_IMAGE_HOSTS = new Set([
  'pub-9cf31543472247c2936bb3ad6524d445.r2.dev',
  // 兼容旧/另一套资源域名（用于部分书封面 URL）
  'pub-276765949af547aba1ca5c576f2859ea.r2.dev',
]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrlParam = searchParams.get('imageUrl');
  const bookId = searchParams.get('bookId');
  const coverId = searchParams.get('coverId');

  // 如果传了 imageUrl，则优先代理该图片（用于 Canvas 叠加文字时避免 CORS + 覆盖错误资源）
  if (imageUrlParam) {
    try {
      const u = new URL(imageUrlParam);
      if (u.protocol !== 'https:' || !ALLOWED_IMAGE_HOSTS.has(u.hostname)) {
        return NextResponse.json({ error: 'imageUrl not allowed' }, { status: 400 });
      }
      // 仅允许常见图片格式，避免被滥用成通用代理
      if (!/\.(webp|png|jpe?g)$/i.test(u.pathname)) {
        return NextResponse.json({ error: 'Unsupported image format' }, { status: 400 });
      }

      const res = await fetch(u.toString(), { cache: 'no-store' });
      if (!res.ok) {
        return NextResponse.json(
          { error: 'imageUrl not found' },
          { status: res.status },
        );
      }
      const arrayBuffer = await res.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': res.headers.get('Content-Type') ?? 'image/*',
          // 禁用所有缓存，避免线上出现“不同 query 返回同一张图”的问题
          'Cache-Control': 'no-store, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
    } catch {
      return NextResponse.json(
        { error: 'Failed to fetch imageUrl' },
        { status: 500 },
      );
    }
  }

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

  const seasonRaw = (searchParams.get('season') || '').toLowerCase();
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
            'Content-Type':
              res.headers.get('Content-Type') ?? 'image/webp',
            'Cache-Control': 'no-store, max-age=0',
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
  } catch (err) {
    logApiError({ error: err, context: 'Failed to fetch cover image from R2' });
    return NextResponse.json(
      { error: 'Failed to fetch cover image from R2' },
      { status: 500 },
    );
  }
}

