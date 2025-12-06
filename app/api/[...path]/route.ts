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

    // 获取请求头
    const authHeader = request.headers.get('authorization');
    const contentType = request.headers.get('content-type');
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    if (contentType) {
      headers['Content-Type'] = contentType;
    } else if (method !== 'GET' && method !== 'DELETE') {
      headers['Content-Type'] = 'application/json';
    }

    // 获取请求体（如果有）
    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text();
      } catch (e) {
        // 如果没有请求体，忽略错误
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body || undefined,
    });

    // 尝试解析 JSON，如果失败则返回文本
    let data: any;
    const contentTypeHeader = response.headers.get('content-type');
    if (contentTypeHeader?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // 返回响应，保持原始状态码
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('API代理错误:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

