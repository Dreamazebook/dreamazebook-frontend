'use client';

import { Roboto, Philosopher } from 'next/font/google';
import localFont from 'next/font/local';

export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
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

export const aLittleMonster = localFont({
  src: '../public/fonts/ALittleMonster.ttf',
  display: 'swap',
  variable: '--font-a-little-monster',
});

// Picbook 封面用的 Batamy 字体
export const batamy = localFont({
  src: '../public/fonts/Batamy-Regular.ttf',
  display: 'swap',
  variable: '--font-batamy',
});

export const caslonAntique = localFont({
  src: '../public/fonts/CaslonAntique-Regular.ttf',
  display: 'swap',
  variable: '--font-caslon-antique',
});