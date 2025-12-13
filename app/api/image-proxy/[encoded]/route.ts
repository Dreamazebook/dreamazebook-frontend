import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const ALLOWED_HOSTS = [
  '.r2.dev',
  's3-pro-dre001',
  's3-pro-dre002',
  'dreamazebook.com',
  'api.dreamazebook.com',
];

function isAllowedHost(hostname: string) {
  const h = hostname.toLowerCase();
  return ALLOWED_HOSTS.some((allowed) => (allowed.startsWith('.') ? h.endsWith(allowed) : h.includes(allowed)));
}

function decodeBase64Url(input: string) {
  // 支持 base64url（- _）且可无 padding
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLen);
  return Buffer.from(padded, 'base64').toString('utf-8');
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  noStore();

  const { encoded } = await ctx.params;
  if (!encoded) {
    return NextResponse.json({ error: 'Missing encoded url' }, { status: 400 });
  }

  // 优先走 query：/api/image-proxy/<key>?url=<encodedURIComponent(url)>
  // 这样可以避免把超长 URL 放进 path segment（部分平台会拒绝过长路径）
  const urlFromQuery = req.nextUrl.searchParams.get('url');
  let url: string | null = null;
  if (urlFromQuery) {
    try {
      url = decodeURIComponent(urlFromQuery);
    } catch {
      return NextResponse.json({ error: 'Invalid url query param' }, { status: 400 });
    }
  } else {
    // 兼容旧版：/api/image-proxy/<base64url(url)>
    try {
      url = decodeBase64Url(encoded);
    } catch {
      return NextResponse.json({ error: 'Invalid encoded url' }, { status: 400 });
    }
  }

  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(u.protocol)) {
    return NextResponse.json({ error: 'Unsupported protocol' }, { status: 400 });
  }
  if (!isAllowedHost(u.hostname)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
  }

  try {
    const res = await fetch(u.toString(), { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream fetch failed' }, { status: res.status });
    }
    const arrayBuffer = await res.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream',
        // 多层禁用缓存（避免不同书/页走同一缓存）
        'Cache-Control': 'private, no-store, no-cache, max-age=0, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Netlify-CDN-Cache-Control': 'no-store',
        'Surrogate-Control': 'no-store',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch upstream' }, { status: 500 });
  }
}


