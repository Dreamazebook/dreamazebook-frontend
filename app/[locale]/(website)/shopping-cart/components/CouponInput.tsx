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
    <div className="mb-6">
      <p className="font-medium mb-2">{t('couponCode')}</p>
      <div className="flex">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder={t('enterCouponCode')}
          className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {t('apply')}
        </button>
      </div>
    </div>
  );
}