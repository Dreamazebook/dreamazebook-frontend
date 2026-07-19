'use client'

import Script from 'next/script'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export default function GoogleGisScript() {
  if (!GOOGLE_CLIENT_ID) return null

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      async
      defer
    />
  )
}
