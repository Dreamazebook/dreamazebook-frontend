import { Roboto } from 'next/font/google'
import TermlyCMP from '@/app/components/TermlyCMP';
import '../../globals.css';
import type { Metadata } from 'next'
import Script from 'next/script'
import Footer from '@/app/components/Footer';
import MetaPixel from '@/app/components/MetaPixel';
import HotJar from '@/app/components/HotJar';

const roboto = Roboto({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

// You should replace GTM-XXXXXXX with your actual GTM ID
const GTM_ID = 'GTM-57K5LXBQ'

export const metadata: Metadata = {
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
        type: 'image/png',
      },
    ],
  },
  // manifest: '/site.webmanifest',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="facebook-domain-verification" content="r1wooxab1pn2flmpl27wopu6s81r4w" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
        <HotJar />
        <MetaPixel />
      </head>
      <body className={`min-h-screen ${roboto.className}`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
        <Footer/>
        <TermlyCMP websiteUUID={'6886d96b-3a64-44f3-9388-e4bbed70d8c3'} autoBlock={undefined} masterConsentsOrigin={undefined} />
      </body>
    </html>
  )
} 