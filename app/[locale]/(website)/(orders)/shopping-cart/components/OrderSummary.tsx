import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { OrderSummaryProps } from '@/types/order-summary';

const OrderSummary: React.FC<OrderSummaryProps> = ({
  calculatingCost,
  subtotal,
  shipping,
  discountInfo,
  discountAmount,
  total,
  itemsCount,
  checkoutLoading,
  paypalCheckoutLoading,
  onCheckout
}) => {
  const t = useTranslations('ShoppingCart');

  const LoadingSpinner = () => (
    <>
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {t('processing')}
    </>
  );

  const SummaryContent = ({ isMobile = false }) => {
    const textColorClass = isMobile ? "text-[#666666]" : "text-gray-600";
    const borderColor = isMobile ? "border-[#E5E5E5]" : "border-gray-200";

    return (
      <div className="space-y-3">
        {calculatingCost ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <p className={textColorClass}>
                {t('subtotal')} ({itemsCount} {itemsCount > 1 ? 'books' : 'book'})
              </p>
              <p>${subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className={textColorClass}>{t('shipping')}</p>
              <p>${shipping.toFixed(2)}</p>
            </div>
            {discountInfo?.applicable && discountAmount > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-[#16A34A]">
                  <div>
                    <p>{t('multiBookDiscount')}</p>
                  </div>
                  <div className="text-right">
                    <p>-${discountAmount.toFixed(2)} ({discountInfo.percentage}%)</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div className={`border-t pt-3 flex font-bold justify-between ${borderColor}`}>
          <p >{t('total')}</p>
          <p >${total.toFixed(2)}</p>
        </div>
      </div>
    );
  };

  const CheckoutButtons = () => (
    <div className="space-y-3">
      <button
        onClick={() => onCheckout('card')}
        disabled={itemsCount === 0 || checkoutLoading}
        className="w-full py-3 cursor-pointer bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        {checkoutLoading ? <LoadingSpinner /> : t('checkout')}
      </button>
      <button
        onClick={() => onCheckout('paypal')}
        disabled={itemsCount === 0 || paypalCheckoutLoading}
        className="w-full py-3 cursor-pointer bg-[#0070BA] text-white rounded-md hover:bg-[#003087] disabled:bg-blue-300 flex items-center justify-center gap-2"
      >
        {paypalCheckoutLoading ? <LoadingSpinner /> : t('checkoutWithPayPal')}
      </button>
    </div>
  );

  // Desktop Version
  return (
    <>
      {/* Desktop Summary */}
      <div className="hidden lg:flex bg-white lg:w-[480px] xl:w-[544px] relative pt-[64px] pr-[48px] pb-[64px] pl-[48px] xl:pr-[120px] xl:pl-[64px] flex-col gap-[10px] opacity-100 ml-auto min-h-screen">
        <div className="bg-white w-full rounded sticky top-4 right-0 flex flex-col opacity-100 gap-4">
          <h2 className="text-3xl font-normal">{t('orderSummary')}</h2>
          <SummaryContent />
          <CheckoutButtons />
        </div>
      </div>

      {/* Mobile Summary */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded z-10">
        <div className="max-w-screen-md mx-auto px-4 py-3 space-y-3">
          <div className="border-b border-[#E5E5E5] pb-4">
            <h2 className="text-3xl font-normal mb-4">{t('orderSummary')}</h2>
          </div>

          <SummaryContent isMobile={true} />
          <CheckoutButtons />
        </div>
      </div>
    </>
  );
};

export default OrderSummary;