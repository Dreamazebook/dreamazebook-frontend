'use client';

import { Roboto, Philosopher } from 'next/font/google';
import localFont from 'next/font/local';

export const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const philosopher = Philosopher({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-philosopher',
});

export const notoSansSC = localFont({
  src: '../public/fonts/NotoSansSC-Regular.ttf',
  display: 'swap',
  variable: '--font-noto-sans-sc',
});