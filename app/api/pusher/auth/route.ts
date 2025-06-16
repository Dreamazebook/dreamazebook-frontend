import { NextResponse } from 'next/server';
import api from '@/utils/api';
import { AxiosResponse } from 'axios';

export async function POST(request: Request) {
  try {
    // 获取原始请求数据
    const formData = await request.text();
    const params = new URLSearchParams(formData);
    
    const socket_id = params.get('socket_id');
    const channel_name = params.get('channel_name');

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 从请求头中获取认证token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const response: AxiosResponse = await api.post(
      '/broadcasting/auth',
      { socket_id, channel_name },
      {
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('WebSocket认证错误:', error);
    return NextResponse.json(
      { error: error.message || '认证失败' },
      { status: error.response?.status || 500 }
    );
  }
} 