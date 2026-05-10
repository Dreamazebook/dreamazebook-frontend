"use client";

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import React from 'react';
import { getBookDetailFinalUnitPrice, getBookDetailOriginalUnitPrice } from '@/utils/bookDisplayPrice';

const MOBILE_MENU_TOGGLE_EVENT = "dreamaze:mobile-menu-toggle";

interface BookDetailStickyBarProps {
  book: any;
  primaryButtonLabel?: string;
  primaryButtonHref: string;
  onPrimaryClick?: (e: React.MouseEvent, selectedLanguage: string) => void;
  selectedLanguage?: string;
}

export default function BookDetailStickyBar({
  book,
  primaryButtonLabel = 'Personalize my book',
  primaryButtonHref,
  onPrimaryClick,
  selectedLanguage = 'en',
}: BookDetailStickyBarProps) {
  const t = useTranslations('BookDetail');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleMobileMenuToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ open?: boolean }>;
      setIsMobileMenuOpen(!!customEvent.detail?.open);
    };

    window.addEventListener(MOBILE_MENU_TOGGLE_EVENT, handleMobileMenuToggle);
    return () => {
      window.removeEventListener(MOBILE_MENU_TOGGLE_EVENT, handleMobileMenuToggle);
    };
  }, []);

  const finalUnit = getBookDetailFinalUnitPrice(book);
  const originalUnit = getBookDetailOriginalUnitPrice(book, finalUnit);
  const currentPrice = finalUnit.toFixed(2);
  const marketPrice = originalUnit.toFixed(2);

  const buttonLabel = primaryButtonLabel || t('personalizeButton');

  const handleButtonClick = (e: React.MouseEvent) => {
    setIsLoading(true);
    onPrimaryClick?.(e, selectedLanguage);
  };

  if (isMobileMenuOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white z-50 md:hidden">
      <div className="flex flex-col p-3 gap-3 max-w-full">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-baseline gap-2 flex-shrink-0">
            <span className="text-[#012CCE] text-[24px] leading-none">${currentPrice}</span>
            {originalUnit > finalUnit && (
              <span className="text-[#999999] line-through text-[14px] tracking-[0.25px]">${marketPrice}</span>
            )}
          </div>

          <Link
            href={`${primaryButtonHref}${primaryButtonHref.includes('?') ? '&' : '?'}language=${encodeURIComponent(selectedLanguage)}`}
            onClick={handleButtonClick}
            className={`bg-[#222222] text-[#F5E3E3] h-[44px] px-4 py-3 rounded-[4px] hover:bg-gray-800 text-[14px] leading-[20px] tracking-[0.25px] transition-colors flex items-center justify-center whitespace-nowrap flex-shrink-0 ${
              isLoading ? 'opacity-75 cursor-wait pointer-events-none' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              buttonLabel
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
