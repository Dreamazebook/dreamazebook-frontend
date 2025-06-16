import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echo: Echo<any> | null = null;

if (typeof window !== 'undefined') {
  const pusher = new Pusher(process.env.NEXT_PUBLIC_REVERB_APP_KEY || '', {
    wsHost: process.env.NEXT_PUBLIC_WS_HOST || '127.0.0.1',
    wsPort: Number(process.env.NEXT_PUBLIC_WS_PORT) || 8080,
    forceTLS: process.env.NEXT_PUBLIC_WS_SECURE === 'true',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    cluster: 'mt1',
    activityTimeout: 5000,
    pongTimeout: 5000,
    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }
  });

  echo = new Echo({
    broadcaster: 'pusher',
    client: pusher,
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    cluster: 'mt1',
    wsHost: process.env.NEXT_PUBLIC_WS_HOST || '127.0.0.1',
    wsPort: Number(process.env.NEXT_PUBLIC_WS_PORT) || 8080,
    forceTLS: process.env.NEXT_PUBLIC_WS_SECURE === 'true',
    enabledTransports: ['ws', 'wss'],
    path: '/app',
    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    },
    disableStats: true,
    useTLS: process.env.NEXT_PUBLIC_WS_SECURE === 'true',
  });

  echo.connector.pusher.connection.bind('error', (err: any) => {
    console.error('WebSocket 连接错误:', err);
    if (err.data?.code === 4001) {
      pusher.connect();
    }
  });

  echo.connector.pusher.connection.bind('disconnected', () => {
    console.log('WebSocket 连接断开');
    setTimeout(() => {
      pusher.connect();
    }, 1000);
  });

  echo.connector.pusher.connection.bind('connected', () => {
    console.log('WebSocket 连接成功');
  });

  let reconnectAttempts = 0;
  const maxReconnectAttempts = 3;

  echo.connector.pusher.connection.bind('connecting', () => {
    console.log('正在连接 WebSocket...');
  });

  echo.connector.pusher.connection.bind('failed', () => {
    console.log('WebSocket 连接失败');
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      setTimeout(() => {
        pusher.connect();
      }, 1000 * reconnectAttempts);
    } else {
      console.error('WebSocket 重连次数超过限制，请刷新页面重试');
    }
  });

  echo.connector.pusher.connection.bind('connected', () => {
    reconnectAttempts = 0;
  });
}

export default echo;