import '../../globals.css';
import type { Metadata } from 'next'
import Script from 'next/script'

// You should replace GTM-XXXXXXX with your actual GTM ID
const GTM_ID = 'GTM-57K5LXBQ'

export const metadata: Metadata = {
  title: 'Dreamaze - Personalized Children\'s Books',
  description: 'Create unique, personalized children\'s books where your loved ones become the heroes of their own magical stories.',
  openGraph: {
    title: 'Dreamaze - Personalized Children\'s Books',
    description: 'Create unique, personalized children\'s books where your loved ones become the heroes of their own magical stories.',
    images: ['/landing-page/cover.png'],
  },
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
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-screen">
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
      </body>
    </html>
  )
} 