import type { Metadata } from 'next'

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
      <body>
        {children}
      </body>
    </html>
  )
} 