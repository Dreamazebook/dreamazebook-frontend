import { NextRequest, NextResponse } from 'next/server';

const R2_BASE = 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get('bookId');
  const coverId = searchParams.get('coverId');

  if (!bookId || !coverId) {
    return NextResponse.json(
      { error: 'Missing bookId or coverId' },
      { status: 400 },
    );
  }

  // 与前端逻辑保持一致：SPU 一律使用大写，并处理 GOODNIGHT3 特例
  let normalizedBookId = bookId.trim().toUpperCase();
  if (normalizedBookId === 'PICBOOK_GOODNIGHT3') {
    normalizedBookId = 'PICBOOK_GOODNIGHT';
  }

  const folder = `${R2_BASE}/products/picbooks/${encodeURIComponent(
    normalizedBookId,
  )}/covers/cover_${encodeURIComponent(coverId)}`;
  const imageUrl = `${folder}/base.webp`;

  try {
    const res = await fetch(imageUrl, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'base.webp not found on R2' },
        { status: res.status },
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type':
          res.headers.get('Content-Type') ?? 'image/webp',
        // 浏览器端 Canvas 叠加文字后通常会再缓存一份 DataURL，
        // 这里可以适当缓存原始 base 图，减轻 R2 压力
        'Cache-Control':
          res.headers.get('Cache-Control') ??
          'public, max-age=604800, immutable',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch base.webp from R2' },
      { status: 500 },
    );
  }
}

