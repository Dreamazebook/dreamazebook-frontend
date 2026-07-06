'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { OrderDetail } from '@/types/order';
import DisplayPrice from '../../../components/component/DisplayPrice';
import OrderSummaryPrices from '../../../components/component/OrderSummaryPrices';
import CouponInput from '../../shopping-cart/components/CouponInput';
import { getFormattedCartItemTitle, getOurBookDisplayName } from '@/utils/bookNames';

interface OrderSummaryProps {
  orderDetail?: OrderDetail;
  handleApplyCoupon: (code: string) => void;
  handleRemoveCoupon?: () => void;
  removingCoupon?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  handleApplyCoupon,
  handleRemoveCoupon,
  removingCoupon,
  orderDetail,
}) => {
  const t = useTranslations('checkoutPage');
  return (
    <div className="bg-gray-50 p-6 rounded sticky top-4 right-0 z-0">
      <h3 className="text-lg font-medium mb-4">{t("summary")}</h3>
      
      <div className="space-y-4 mb-6">
        {orderDetail?.items?.map((item) => (
          <div key={item.id} className="flex items-start">
            <div className="flex-grow">
              <h4 className="text-sm font-medium">{getFormattedCartItemTitle(item)}</h4>
              {/* <p className="text-sm text-gray-500">Quantity: {item.quantity}</p> */}
            </div>
            <DisplayPrice value={item.total_price} style='text-sm font-medium' />
          </div>
        ))}
      </div>

      <CouponInput onApply={handleApplyCoupon}  />

      {orderDetail?.coupon_code && (
        <div className="flex items-center justify-between text-sm mb-2">
          <p className="text-green-600">
            {t("couponCode", {code: orderDetail?.coupon_code})}
          </p>
          {handleRemoveCoupon && (
            <button
              onClick={handleRemoveCoupon}
              disabled={removingCoupon}
              className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs underline"
            >
              {removingCoupon ? t("removing") : t("remove")}
            </button>
          )}
        </div>
      )}
      
      {orderDetail &&
      <OrderSummaryPrices orderDetail={orderDetail} />
      }

    </div>
  );
};

export default OrderSummary;