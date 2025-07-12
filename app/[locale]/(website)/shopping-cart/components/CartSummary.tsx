'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import CouponInput from './CouponInput';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  discount?: number;
}

export default function CartSummary({ subtotal, shipping, discount = 0 }: CartSummaryProps) {
  const t = useTranslations('ShoppingCart');
  const [appliedDiscount, setAppliedDiscount] = useState(discount);
  
  const total = subtotal + shipping - appliedDiscount;
  
  const handleApplyCoupon = (code: string) => {
    // 这里应该是调用API验证优惠码并获取折扣金额
    // 为了演示，我们假设任何优惠码都会给10%的折扣
    const newDiscount = Math.round(subtotal * 0.1 * 100) / 100;
    setAppliedDiscount(newDiscount);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">{t('orderSummary')}</h2>
      
      <CouponInput onApply={handleApplyCoupon} />
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <p className="text-gray-600 dark:text-gray-400">{t('subtotal')}</p>
          <p>${subtotal.toFixed(2)}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-gray-600 dark:text-gray-400">{t('shipping')}</p>
          <p>${shipping.toFixed(2)}</p>
        </div>
        {appliedDiscount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <p>{t('discount')}</p>
            <p>-${appliedDiscount.toFixed(2)}</p>
          </div>
        )}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold">
          <p>{t('total')}</p>
          <p>${total.toFixed(2)}</p>
        </div>
      </div>
      
      <button className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600">
        {t('proceedToCheckout')}
      </button>
    </div>
  );
}