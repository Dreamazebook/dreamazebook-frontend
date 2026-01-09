'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { OrderDetail } from '@/types/order';
import DisplayPrice from '../../../components/component/DisplayPrice';
import OrderSummaryPrices from '../../../components/component/OrderSummaryPrices';
import CouponInput from '../../shopping-cart/components/CouponInput';
import { getOurBookDisplayName } from '@/utils/bookNames';

interface OrderSummaryProps {
  orderDetail?: OrderDetail;
  handleApplyCoupon: (code: string) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  handleApplyCoupon,
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
              <h4 className="text-sm font-medium">{getOurBookDisplayName(item.spu?.spu_code, item.book_name)}</h4>
              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
            </div>
            <DisplayPrice value={item.total_price} style='text-sm font-medium' />
          </div>
        ))}
      </div>

      {/* <CouponInput onApply={handleApplyCoupon}  /> */}

      {orderDetail?.coupon_code && (
        <p className="text-green-600 text-sm mb-2">
          {t("couponCode", {code: orderDetail?.coupon_code})}
        </p>
      )}
      
      {orderDetail &&
      <OrderSummaryPrices orderDetail={orderDetail} />
      }

    </div>
  );
};

export default OrderSummary;