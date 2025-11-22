'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface CouponInputProps {
  onApply: (code: string) => void;
}

export default function CouponInput({ onApply }: CouponInputProps) {
  const t = useTranslations('ShoppingCart');
  const [couponCode, setCouponCode] = useState('');
  
  const handleApply = () => {
    if (couponCode.trim()) {
      onApply(couponCode);
    }
  };
  
  return (
    <div className="">
      <div className="flex items-center border border-[#E5E5E5] rounded-md max-w-full">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder={t('enterCouponCode')}
          className="flex-grow w-0 min-w-0 px-3 py-2"
        />
        <svg width="2" height="20" viewBox="0 0 2 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-2">
          <path d="M1 0V20" stroke="#E5E5E5"/>
        </svg>
        <button
          onClick={handleApply}
          className="px-4 py-2 text-[#222222] whitespace-nowrap"
        >
          {t('apply')}
        </button>
      </div>
    </div>
  );
}