import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const locales = ['en', 'fr']
const defaultLocale = 'en'

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  let languages = new Negotiator({ headers: negotiatorHeaders }).languages()
  if (languages.length === 1 && languages[0] === "*") {
    languages = ["en"];
  }
  const locale = matchLocale(languages, locales, defaultLocale)
  return locale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const curLocale = getLocale(request)

  const redirectURL = process.env.REDIRECT_URL;
  console.log(pathname);
  if (redirectURL && pathname.indexOf(`/${curLocale}${redirectURL}`) === -1) {
    request.nextUrl.pathname = `/${curLocale}${redirectURL}`;
    return NextResponse.redirect(request.nextUrl);
  }
  
  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Redirect if there is no locale
  request.nextUrl.pathname = `/${curLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.webp$|.*\\.gif$|.*\\.ico$|.*\\.svg$|.*\\.mp4$).*)" ]};

