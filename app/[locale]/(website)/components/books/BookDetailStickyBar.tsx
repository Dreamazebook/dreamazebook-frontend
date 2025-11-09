"use client";

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import React from 'react';

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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white z-50 md:hidden">
      <div className="flex h-[68px] items-center justify-between p-3 gap-6 max-w-full">
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
        <Link
          href={`${primaryButtonHref}${primaryButtonHref.includes('?') ? '&' : '?'}language=${encodeURIComponent(selectedLanguage)}`}
          onClick={(e) => onPrimaryClick?.(e, selectedLanguage)}
          className="bg-[#222222] text-[#F5E3E3] h-[44px] px-4 py-3 rounded-[4px] hover:bg-gray-800 text-[14px] leading-[20px] tracking-[0.25px] transition-colors font-medium flex items-center justify-center whitespace-nowrap flex-shrink-0"
        >
          {primaryButtonLabel || t('personalizeButton')}
        </Link>
      </div>
    </div>
  );
}

