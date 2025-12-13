import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.dreamazebook.com/api';

export async function GET(
  request: NextRequest,
  context: any
) {
  const params = await Promise.resolve(context?.params as { path: string[] });
  return handleRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  context: any
) {
  const params = await Promise.resolve(context?.params as { path: string[] });
  return handleRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: any
) {
  const params = await Promise.resolve(context?.params as { path: string[] });
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  const params = await Promise.resolve(context?.params as { path: string[] });
  return handleRequest(request, params, 'DELETE');
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const HOP_BY_HOP_REQ_HEADERS = new Set([
  'connection',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-length',
]);

const HOP_BY_HOP_RES_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  // 交给 Next/运行时重新计算
  'content-length',
]);

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const path = Array.isArray(params.path) ? params.path.join('/') : params.path;
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/${path}${queryString ? `?${queryString}` : ''}`;

    // 透传请求头（保留 Accept，NDJSON）
    const upstreamHeaders = new Headers(request.headers);
    for (const h of HOP_BY_HOP_REQ_HEADERS) upstreamHeaders.delete(h);

    if (!upstreamHeaders.get('accept')) {
      upstreamHeaders.set('accept', 'application/json');
    }

    const init: RequestInit = {
      method,
      headers: upstreamHeaders,
    };

    // 透传请求体（不要 request.text()/json()，否则会破坏流/大文件）
    if (method !== 'GET' && method !== 'DELETE') {
      // Node fetch 在使用流式 body 时需要 duplex=half（Undici）
      (init as any).duplex = 'half';
      init.body = request.body;
    }

    const upstreamResp = await fetch(url, init);

    // 透传响应头 + 加 CORS（不要 NextResponse.json 二次封装，否则 Content-Type/流式都会被破坏）
    const resHeaders = new Headers(upstreamResp.headers);
    for (const h of HOP_BY_HOP_RES_HEADERS) resHeaders.delete(h);

    resHeaders.set('Access-Control-Allow-Origin', '*');
    resHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    resHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new NextResponse(upstreamResp.body, {
      status: upstreamResp.status,
      headers: resHeaders,
    });
  } catch (error) {
    console.error('API代理错误:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

