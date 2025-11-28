"use client";

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import React from 'react';
import { aLittleMonster } from '@/app/fonts';
import toast from 'react-hot-toast';

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

  // 获取价格，使用与 BookDetailView 相同的逻辑
  const currentPrice = Number(
    (book as any)?.default_sku?.current_price ?? 
    (book as any)?.current_price ?? 
    (book as any)?.price ?? 
    0
  ).toFixed(2);

  const marketPrice = Number(
    (book as any)?.default_sku?.market_price ?? 
    (book as any)?.market_price ?? 
    ((Number((book as any)?.price ?? 0) * 1.25) || 0)
  ).toFixed(2);

  const isBirthday =
    (book as any)?.id === 'PICBOOK_BIRTHDAY' ||
    (book as any)?.spu_code === 'PICBOOK_BIRTHDAY';

  const buttonLabel = isBirthday ? 'Notify Me for Next Release' : (primaryButtonLabel || t('personalizeButton'));

  const handleButtonClick = (e: React.MouseEvent) => {
    if (isBirthday) {
      e.preventDefault();
      toast.success(
        <div>
          <div>On it! ✓</div>
          <div>We&apos;ve saved your request.</div>
        </div>,
        {
          duration: 4000,
          style: {
            borderRadius: '4px',
            background: '#222222',
            color: '#F5E3E3',
          },
        }
      );
    } else {
      setIsLoading(true);
      onPrimaryClick?.(e, selectedLanguage);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white z-50 md:hidden">
      <div className="flex flex-col p-3 gap-3 max-w-full">
        {isBirthday && (
          <div className="w-full flex items-center justify-center">
            <div className={`bg-[#FFF5F5] text-[#C32026] text-[16px] leading-[24px] tracking-[0.5px] px-6 rounded-[4px] text-center w-full ${aLittleMonster.className}`}>
              — First Batch Sold Out —
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-6">
          {/* 价格信息 */}
          <div className="flex items-baseline gap-2 flex-shrink-0">
            <span className="text-[#012CCE] text-[24px] leading-none">
              ${currentPrice}
            </span>
            {Number(marketPrice) > Number(currentPrice) && (
              <span className="text-[#999999] line-through text-[14px] tracking-[0.25px]">
                ${marketPrice}
              </span>
            )}
          </div>

          {/* 按钮 */}
          {isBirthday ? (
            <button
              onClick={handleButtonClick}
              className={`bg-[#222222] text-[#F5E3E3] h-[44px] px-4 py-3 rounded-[4px] hover:bg-gray-800 text-[14px] leading-[20px] tracking-[0.25px] transition-colors flex items-center justify-center whitespace-nowrap flex-shrink-0 ${
                isLoading ? 'opacity-75 cursor-wait pointer-events-none' : ''
              }`}
            >
              {buttonLabel}
            </button>
          ) : (
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
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                buttonLabel
              )}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

