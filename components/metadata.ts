import type { Metadata } from 'next';

export const sharedMetadata: Metadata = {
  metadataBase: new URL('https://dreamazebook.com'),
  title: 'Dreamaze - Personalized Children\'s Books',
  description: 'Create unique, personalized children\'s books where your loved ones become the heroes of their own magical stories.',
  openGraph: {
    title: 'Dreamaze - Personalized Children\'s Books',
    description: 'Create unique, personalized children\'s books where your loved ones become the heroes of their own magical stories.',
    images: ['/landing-page/cover.png'],
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '64x64',
        type: 'image/ico'
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      }
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
      }
    ],
  },
  // manifest: '/site.webmanifest',
};
