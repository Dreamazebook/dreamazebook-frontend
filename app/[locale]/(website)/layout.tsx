import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {Locale, routing} from '@/i18n/routing';
import {setRequestLocale} from 'next-intl/server';

import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto, Philosopher } from "next/font/google";
import "../globals.css";
import LayoutWrapper from './LayoutWrapper';
import LoginModal from './components/LoginModal';
import LdrsRegistry from './components/LdrsRegistry';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// App-wide fonts for text rendering and Canvas usage
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: 'swap',
});

const philosopher = Philosopher({
  variable: "--font-philosopher",
  subsets: ["latin"],
  weight: ["400"],
  display: 'swap',
});

import { sharedMetadata } from '@/components/metadata';

export const metadata: Metadata = sharedMetadata;

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale as Locale);
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} ${philosopher.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale as Locale} messages={messages}>
          <LdrsRegistry />
          <LoginModal />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
