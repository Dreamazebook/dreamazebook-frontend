import type { Metadata } from 'next';

export const sharedMetadata: Metadata = {
  metadataBase: new URL('https://dreamazebook.com'),
  title: {
    template: '%s | Dreamaze',
    default: 'Personalized Storybooks with Your Child’s Real Photo | Dreamaze',
  },
  description: 'Turn your child’s real photo into a personalized storybook they’ll love. Create a keepsake gift for bedtime, birthdays, and family moments.',
  keywords: [
    'personalized children\'s books',
    'custom children\'s books',
    'personalized gifts for kids',
    'custom storybooks',
    'personalized photo books',
    'children\'s gift ideas',
    'customized books',
    'photo personalization',
  ],
  authors: [{ name: 'Dreamaze' }],
  creator: 'Dreamaze',
  publisher: 'Dreamaze',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    url: 'https://dreamazebook.com/en',
    title: 'Personalized Storybooks with Your Child’s Real Photo | Dreamaze',
    description:
      'Turn your child’s real photo into a personalized storybook they’ll love. Create a keepsake gift for bedtime, birthdays, and family moments.',
    siteName: 'Dreamaze',
    images: [
      {
        url: '/landing-page/cover.png',
        width: 1200,
        height: 630,
        alt: 'Personalized Storybooks with Your Child’s Real Photo | Dreamaze',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personalized Storybooks with Your Child’s Real Photo | Dreamaze',
    description:
      'Turn your child’s real photo into a personalized storybook they’ll love. Create a keepsake gift for bedtime, birthdays, and family moments.',
    images: ['/landing-page/cover.png'],
    creator: '@dreamazebook',
    site: '@dreamazebook',
  },
  robots: {
    index: false,
    follow: true,
    nocache: false,
    googleBot: {
      index: false,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual verification code
    yandex: 'yandex-verification-code', // Replace with actual verification code
  },
  alternates: {
    canonical: 'https://dreamazebook.com/en',
    languages: {
      en: 'https://dreamazebook.com/en',
      fr: 'https://dreamazebook.com/fr',
      'zh-CN': 'https://dreamazebook.com/zh',
    },
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '64x64',
        type: 'image/ico',
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
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
      },
    ],
  },
  manifest: '/site.webmanifest',
  category: 'books',
};
