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

  // 与前端逻辑保持一致：SPU 一律使用大写
  const upperBookId = bookId.toUpperCase();

  // 注意：R2 实际路径为 /products/picbooks/...，不包含 website 前缀
  const url = `${R2_BASE}/products/picbooks/${encodeURIComponent(
    upperBookId,
  )}/covers/cover_${encodeURIComponent(coverId)}/page_properties.json`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'page_properties.json not found on R2' },
        { status: res.status },
      );
    }
    const json = await res.json();
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch page_properties from R2' },
      { status: 500 },
    );
  }
}



