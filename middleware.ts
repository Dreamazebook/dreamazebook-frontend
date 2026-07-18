import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import { getCanonicalBookSlug } from '@/constants/bookRoutes'

const locales = ['en', 'fr','zh']
const defaultLocale = 'en'

function getLocale(request: NextRequest): string {
  // Fast path: check cookie first (set after first visit)
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }

  // Fallback: parse Accept-Language header directly (avoids full Negotiator parse when possible)
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, qPart] = lang.trim().split(';q=')
        return { code: code.split('-')[0], quality: qPart ? parseFloat(qPart) : 1 }
      })
      .sort((a, b) => b.quality - a.quality)
      .map(l => l.code)

    const locale = matchLocale(languages, locales, defaultLocale)
    return locale
  }

  return defaultLocale
}

function redirectLegacyBookUrl(
  request: NextRequest,
  pathname: string
): NextResponse | null {
  const withLocale = pathname.match(/^\/(en|fr|zh)\/books\/([^/]+)(\/create)?\/?$/)
  if (withLocale) {
    const [, locale, segment, createSuffix = ''] = withLocale
    const canonicalSlug = getCanonicalBookSlug(segment)
    if (canonicalSlug && canonicalSlug !== segment) {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}/books/${canonicalSlug}${createSuffix}`
      return NextResponse.redirect(url, 301)
    }
    return null
  }

  const withoutLocale = pathname.match(/^\/books\/([^/]+)(\/create)?\/?$/)
  if (withoutLocale) {
    const [, segment, createSuffix = ''] = withoutLocale
    const canonicalSlug = getCanonicalBookSlug(segment)
    if (canonicalSlug && canonicalSlug !== segment) {
      const url = request.nextUrl.clone()
      url.pathname = `/${getLocale(request)}/books/${canonicalSlug}${createSuffix}`
      return NextResponse.redirect(url, 301)
    }
  }

  return null
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const legacyBookRedirect = redirectLegacyBookUrl(request, pathname)
  if (legacyBookRedirect) {
    return legacyBookRedirect
  }

  // Add Cache-Control headers for all Next.js optimized images & static media
  if (pathname.startsWith('/_next/image') || pathname.startsWith('/_next/static/media')) {
    const response = NextResponse.next();
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    return response;
  }

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    const response = NextResponse.next()

    // Set locale cookie for fast subsequent requests
    const localeMatch = locales.find(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )
    if (localeMatch) {
      response.cookies.set('NEXT_LOCALE', localeMatch, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
      })
    }

    return response
  }


  const curLocale = getLocale(request)

  // For the homepage (/), rewrite internally to /en instead of redirecting.
  // This avoids a 302 round-trip and serves the page immediately.
  // Other paths without locale still get a redirect (e.g. /books → /en/books).
  if (pathname === '/') {
    const response = NextResponse.rewrite(new URL(`/${curLocale}`, request.url))
    response.cookies.set('NEXT_LOCALE', defaultLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return response
  }

  // For other paths without locale, redirect to locale-prefixed URL
  request.nextUrl.pathname = `/${curLocale}${pathname}`

  const response = NextResponse.redirect(request.nextUrl)
  response.cookies.set('NEXT_LOCALE', curLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|sitemap|robots|.*\\.png$|.*\\.jpg$|.*\\.webp$|.*\\.gif$|.*\\.ico$|.*\\.svg$|.*\\.mp4$|.*\\.json$|.*\\.webmanifest$|.*\\.ttf$|.*\\.woff$|.*\\.woff2$|.*\\.eot$|.*\\.otf$).*)',
  ],
};

