import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { OrderSummaryProps } from '@/types/order-summary';
import CouponInput from './CouponInput';

const OrderSummary: React.FC<OrderSummaryProps> = ({
  calculatingCost,
  subtotal,
  shipping,
  discountInfo,
  discountAmount,
  total,
  itemsCount,
  freeShipping,
  checkoutLoading,
  paypalCheckoutLoading,
  onCheckout,
  couponApplied,
  couponApplying,
  couponError,
  onApplyCoupon,
  onRemoveCoupon,
  coupon,
}) => {
  const t = useTranslations('ShoppingCart');
  const [promoOpen, setPromoOpen] = useState(false);
  const [needHelpOpen, setNeedHelpOpen] = useState(false);

  const LoadingSpinner = () => (
    <>
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {t('processing')}
    </>
  );

  const SummaryLines = () => (
    <div className="space-y-2">
      {calculatingCost ? (
        <div className="space-y-2">
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
          <div className="flex justify-between text-[#666666] text-sm">
            <p>{t('subtotal')} ({itemsCount} {itemsCount && (itemsCount > 1) ? 'books' : 'book'})</p>
            <p>${subtotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-[#666666] text-sm">
            <p>{t('shipping')}</p>
            {freeShipping ? (
              <p>${shipping.toFixed(2)}</p>
            ) : (
              <p className="text-xs">{t('calculatedAtCheckout')}</p>
            )}
          </div>
          {discountInfo?.applicable && discountAmount > 0 && (
            <div className="flex justify-between text-[#165C52] text-sm">
              <p>{t('savings')}</p>
              <p className="font-bold">-${discountAmount.toFixed(2)} ({discountInfo.percentage}%)</p>
            </div>
          )}
          {coupon && coupon.status === 'applied' && coupon.discount_amount > 0 && (
            <div className="flex justify-between text-[#165C52] text-sm">
              <p>{t('couponDiscount')} ({coupon.code})</p>
              <p className="font-bold">-${coupon.discount_amount.toFixed(2)}</p>
            </div>
          )}
        </>
      )}
      <div className="border-t border-[#E5E5E5] pt-2 flex justify-between font-bold text-lg">
        <p>{t('total')}</p>
        <p className="text-[#165C52]">${total.toFixed(2)}</p>
      </div>
    </div>
  );

  const CheckoutButtons = () => (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => onCheckout('card')}
        disabled={itemsCount === 0 || checkoutLoading}
        className="w-full h-[56px] cursor-pointer bg-[#222222] text-white rounded-[12px] hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2 font-medium text-base"
      >
        {checkoutLoading ? <LoadingSpinner /> : t('checkout')}
      </button>
      <button
        onClick={() => onCheckout('paypal')}
        disabled={itemsCount === 0 || paypalCheckoutLoading}
        className="w-full h-[56px] cursor-pointer bg-[#0070BA] text-white rounded-[12px] hover:bg-[#003087] disabled:bg-blue-300 flex items-center justify-center gap-2 font-medium text-base"
      >
        {paypalCheckoutLoading ? <LoadingSpinner /> : t('checkoutWithPayPal')}
      </button>
    </div>
  );

  const renderContent = () => (
    <>
      {/* Promo Code — collapsible */}
      <div className="bg-[#F8FAFC] border border-[#E3E6EA] rounded-[12px] p-4 mb-4">
      {onApplyCoupon && (
        <>
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setPromoOpen((prev) => !prev)}
          >
            <h5 className="text-[#222222] text-[15px] font-medium">Have a promo code?</h5>
            <svg
              className={`w-5 h-5 text-[#666666] transition-transform duration-200 ${promoOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <div
            className={`grid transition-all duration-200 ease-in-out ${
              promoOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'
            }`}
          >
            <div className="overflow-hidden">
              <CouponInput
                onApply={onApplyCoupon}
                onRemove={onRemoveCoupon}
                coupon={coupon}
                couponApplying={couponApplying}
                couponError={couponError}
              />
            </div>
          </div>
        </>
      )}
      </div>

      {/* Summary Card */}
      <div className="bg-white p-4 rounded shadow">
        <SummaryLines />
      </div>

      {/* CTA Buttons */}
      <div className="mt-4">
        <CheckoutButtons />
      </div>

      {/* Need help? — collapsible */}
      <div className="mt-6 border-t border-[#E5E5E5] pt-4">
        <button
          type="button"
          className="flex items-center justify-between w-full cursor-pointer select-none"
          onClick={() => setNeedHelpOpen((prev) => !prev)}
        >
          <span className="text-[#222222] font-medium text-base">Need help?</span>
          <svg
            className={`w-5 h-5 text-[#666666] transition-transform duration-200 ${needHelpOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {needHelpOpen && (
          <div className="mt-3 gap-2 flex">
            <button
              type="button"
              className="flex items-center gap-2 w-full text-left cursor-pointer"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).Tawk_API?.maximize) {
                  (window as any).Tawk_API.maximize();
                }
              }}
            >
              <svg className="w-5 h-5 text-[#222222] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
              <div>
                <p className="text-[14px] font-medium text-[#222222] leading-tight">Chat with us</p>
                <p className="text-[12px] text-[#666666] leading-tight">Live support</p>
              </div>
            </button>
            <Link
              href="/delivery-information"
              className="flex items-center gap-2 w-full"
            >
              <svg className="w-5 h-5 text-[#222222] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <div>
                <p className="text-[14px] font-medium text-[#222222] leading-tight">Delivery information</p>
                <p className="text-[12px] text-[#666666] leading-tight">Shipping details</p>
              </div>
            </Link>
            <Link
              href="/faq"
              className="flex items-center gap-2 w-full"
            >
              <svg className="w-5 h-5 text-[#222222] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <p className="text-[14px] font-medium text-[#222222] leading-tight">FAQs</p>
                <p className="text-[12px] text-[#666666] leading-tight">Common questions</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: normal flow, sticky */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[544px] relative pt-[64px] pr-[48px] pb-[64px] pl-[48px] xl:pr-[120px] xl:pl-[64px] flex-col opacity-100 ml-auto min-h-screen">
        <div className="w-full rounded sticky top-4 right-0 flex flex-col opacity-100">
          <h2 className="text-3xl font-normal mb-4">{t('orderSummary')}</h2>
          {renderContent()}
        </div>
      </div>

      {/* Mobile: fixed bottom bar with Total + Checkout buttons only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-screen-md mx-auto px-4 pt-3 pb-3">
          <div className="flex justify-between font-bold text-lg mb-3">
            <p>{t('total')}</p>
            <p className="text-[#165C52]">${total.toFixed(2)}</p>
          </div>
          <CheckoutButtons />
        </div>
      </div>
    </>
  );
};

export default OrderSummary;
