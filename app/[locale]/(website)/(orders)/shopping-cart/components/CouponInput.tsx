'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { CouponInfo } from '@/types/order-summary';

interface CouponInputProps {
  onApply: (code: string) => void;
  onRemove?: () => void;
  coupon?: CouponInfo;
  couponApplying?: boolean;
  couponError?: string;
}

export default function CouponInput({ onApply, onRemove, coupon, couponApplying, couponError }: CouponInputProps) {
  const t = useTranslations('ShoppingCart');
  const [couponCode, setCouponCode] = useState('');
  const [localError, setLocalError] = useState('');
  const prevErrorRef = useRef<string | undefined>(undefined);

  // Sync external error into local state; clear on new input
  useEffect(() => {
    if (couponError && couponError !== prevErrorRef.current) {
      setLocalError(couponError);
    }
    prevErrorRef.current = couponError;
  }, [couponError]);

  // When coupon is applied, keep the code in the input
  useEffect(() => {
    if (coupon?.status === 'applied' && coupon.code) {
      setCouponCode(coupon.code);
      setLocalError('');
    }
  }, [coupon?.status, coupon?.code]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
    if (localError) setLocalError('');
  };

  const handleApply = () => {
    if (couponCode.trim() && !couponApplying) {
      onApply(couponCode.trim());
    }
  };

  const handleRemove = () => {
    setCouponCode('');
    setLocalError('');
    onRemove?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  const isApplied = coupon?.status === 'applied';

  const formatDiscountResult = (c: CouponInfo) => {
    if (c.type === 'percentage') {
      return `${c.value}% discount applied`;
    }
    return `$${c.discount_amount.toFixed(2)} discount applied`;
  };

  return (
    <div>
      {/* Input row: input + Apply button */}
      <div className="flex items-center border border-[#E5E5E5] rounded-md max-w-full">
        <input
          type="text"
          value={couponCode}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={t('enterCouponCode')}
          className="flex-grow w-0 min-w-0 px-3 py-2 outline-none text-sm"
          disabled={couponApplying}
        />
        <svg width="2" height="20" viewBox="0 0 2 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-2 shrink-0">
          <path d="M1 0V20" stroke="#E5E5E5" />
        </svg>
        <button
          onClick={handleApply}
          disabled={couponApplying || !couponCode.trim()}
          className="px-4 py-2 text-[#222222] whitespace-nowrap disabled:opacity-50 font-medium text-sm flex items-center gap-1.5 shrink-0"
        >
          {couponApplying ? (
            <svg className="animate-spin h-4 w-4 text-[#666666]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            t('apply')
          )}
        </button>
      </div>

      {/* Error message */}
      {localError && (
        <p className="text-xs text-red-500 mt-1.5">{localError}</p>
      )}

      {/* Applied state: Remove (left) + success text (right) */}
      {isApplied && coupon && (
        <div className="flex items-center justify-between mt-2">
          <button
            className="text-[#666666] text-sm hover:underline cursor-pointer"
            onClick={handleRemove}
          >
            Remove
          </button>
          <p className="text-xs text-green-600">
            {formatDiscountResult(coupon)}
          </p>
        </div>
      )}
    </div>
  );
}
