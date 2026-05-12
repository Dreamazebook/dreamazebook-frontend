import { NextRequest, NextResponse } from 'next/server';
import { logApiError } from '@/utils/errorLogger';

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

  // 注意：R2 实际路径为 /products/picbooks/...，不包含 website 前缀
  const url = `${R2_BASE}/products/picbooks/${encodeURIComponent(
    normalizedBookId,
  )}/covers/cover_${encodeURIComponent(coverId)}/page_properties.json`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    // 部分书籍（如 PICBOOK_MOM）封面未上传 page_properties.json，R2 返回 404。
    // 返回空配置 200，避免前端/监控把「无叠字配置」当成错误，并与「无文本、仅展示封面图」一致。
    if (res.status === 404) {
      return NextResponse.json({ text: [] });
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: 'page_properties.json not found on R2' },
        { status: res.status },
      );
    }
    const json = await res.json();
    return NextResponse.json(json);
  } catch (err) {
    logApiError({ error: err, context: 'Failed to fetch page_properties from R2' });
    return NextResponse.json(
      { error: 'Failed to fetch page_properties from R2' },
      { status: 500 },
    );
  }
}



