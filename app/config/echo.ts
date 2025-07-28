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
  
  // 只在用户已登录时初始化 Echo
  if (isAuthenticated()) {
    const token = localStorage.getItem('token');
    console.log('初始化 WebSocket 连接，Token:', token ? '存在' : '不存在');
    
    if (!token) {
      console.error('WebSocket 初始化失败：未找到认证 Token');
    } else {
      try {
        echo = new Echo({
          broadcaster: 'reverb',
          key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
          wsHost: process.env.NEXT_PUBLIC_WS_HOST || '127.0.0.1',
          wsPort: process.env.NEXT_PUBLIC_WS_PORT ? Number(process.env.NEXT_PUBLIC_WS_PORT) : undefined,
          wssPort: process.env.NEXT_PUBLIC_WS_PORT ? Number(process.env.NEXT_PUBLIC_WS_PORT) : undefined,
          forceTLS: process.env.NEXT_PUBLIC_WS_SECURE === 'true',
          enabledTransports: ['ws', 'wss'],
          authEndpoint: '/api/broadcasting/auth',
          auth: {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json'
            }
          }
        });

        console.log('WebSocket 配置:', {
          wsHost: process.env.NEXT_PUBLIC_WS_HOST || '127.0.0.1',
          wsPort: process.env.NEXT_PUBLIC_WS_PORT || '未设置',
          wsSecure: process.env.NEXT_PUBLIC_WS_SECURE,
          authEndpoint: '/api/broadcasting/auth'
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
  } else {
    console.log('用户未登录，跳过 WebSocket 初始化');
  }
}

export default echo;