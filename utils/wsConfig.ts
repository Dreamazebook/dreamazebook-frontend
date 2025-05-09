// wsConfig.ts
export function getWebSocketUrl(channel: string) {
  const protocol = process.env.NEXT_PUBLIC_WS_SECURE === 'true' ? 'wss' : 'ws';
  const host     = process.env.NEXT_PUBLIC_WS_HOST!;
  const port     = process.env.NEXT_PUBLIC_WS_PORT!;
  const appId    = process.env.NEXT_PUBLIC_REVERB_APP_ID!;
  const key      = process.env.NEXT_PUBLIC_REVERB_APP_KEY!;

  console.log('WS_HOST=', process.env.NEXT_PUBLIC_WS_HOST);
  console.log('APP_KEY=', process.env.NEXT_PUBLIC_REVERB_APP_KEY);


  return `${protocol}://${host}:${port}/app/${key}` +
         `?protocol=7&client=js&version=4.0.0&key=${key}`;
}