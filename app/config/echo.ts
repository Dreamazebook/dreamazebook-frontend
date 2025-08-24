import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { isAuthenticated } from '@/utils/auth';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

let echo: Echo<any> | null = null;

if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
  
  try {
    const token = localStorage.getItem('token') || process.env.NEXT_PUBLIC_BROADCAST_TOKEN || '';
    const wsHost = process.env.NEXT_PUBLIC_WS_HOST || '127.0.0.1';
    const wsPort = process.env.NEXT_PUBLIC_WS_PORT ? Number(process.env.NEXT_PUBLIC_WS_PORT) : undefined;
    const wssPort = process.env.NEXT_PUBLIC_WS_PORT ? Number(process.env.NEXT_PUBLIC_WS_PORT) : undefined;
    const forceTLS = process.env.NEXT_PUBLIC_WS_SECURE === 'true';

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    echo = new Echo({
      broadcaster: 'reverb',
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
      wsHost,
      wsPort,
      wssPort,
      forceTLS,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: '/api/broadcasting/auth',
      auth: {
        withCredentials: true,
        headers,
      }
    });

        console.log('WebSocket 配置:', {
          wsHost,
          wsPort: wsPort || '未设置',
          wsSecure: forceTLS,
          authEndpoint: '/api/broadcasting/auth',
          hasAuthHeader: Boolean(token),
        });

        // 类型断言为PusherConnector
        const connector = echo.connector as any;

        connector.pusher.connection.bind('error', (err: any) => {
          console.error('WebSocket 连接错误:', err);
          if (err.data?.code === 4001) {
            console.log('尝试重新连接...');
            connector.pusher.connect();
          }
        });

        connector.pusher.connection.bind('disconnected', () => {
          console.log('WebSocket 连接断开');
          setTimeout(() => {
            console.log('尝试重新连接...');
            connector.pusher.connect();
          }, 1000);
        });

        connector.pusher.connection.bind('connected', () => {
          console.log('WebSocket 连接成功');
        });

        let reconnectAttempts = 0;
        const maxReconnectAttempts = 3;

        connector.pusher.connection.bind('connecting', () => {
          console.log('正在连接 WebSocket...');
        });

        connector.pusher.connection.bind('failed', () => {
          console.log('WebSocket 连接失败');
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`第 ${reconnectAttempts} 次重试...`);
            setTimeout(() => {
              connector.pusher.connect();
            }, 1000 * reconnectAttempts);
          } else {
            console.error('WebSocket 重连次数超过限制，请刷新页面重试');
          }
        });

        connector.pusher.connection.bind('connected', () => {
          console.log('WebSocket 连接成功，重置重连计数');
          reconnectAttempts = 0;
        });
  } catch (error) {
    console.error('WebSocket 初始化失败:', error);
  }
}

export default echo;