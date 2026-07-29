'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { OrderDetail } from '@/types/order';
import { CouponInfo } from '@/types/order-summary';
import DisplayPrice from '../../../components/component/DisplayPrice';
import OrderSummaryPrices from '../../../components/component/OrderSummaryPrices';
import CouponInput from '../../shopping-cart/components/CouponInput';
import { getFormattedCartItemTitle } from '@/utils/bookNames';

interface OrderSummaryProps {
  orderDetail?: OrderDetail;
  handleApplyCoupon: (code: string) => void;
  handleRemoveCoupon?: () => void;
  couponApplying?: boolean;
  couponError?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  handleApplyCoupon,
  handleRemoveCoupon,
  couponApplying,
  couponError,
  orderDetail,
}) => {
  const t = useTranslations('checkoutPage');

  const couponInfo: CouponInfo | undefined = orderDetail?.coupon_code
    ? {
        status: 'applied',
        code: orderDetail.coupon_code,
        discount_amount: orderDetail.discount_amount || 0,
        type: orderDetail.discount_details?.type || 'fixed',
        value: orderDetail.discount_details?.percentage || 0,
        coupon_id: 0,
        campaign_name: '',
        created_for: null,
        description: '',
        subtotal_before_coupon: 0,
        subtotal_after_coupon: 0,
        reservation_ttl_hours: 0,
        applied_at: '',
      }
    : undefined;

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

      <CouponInput
        onApply={handleApplyCoupon}
        onRemove={handleRemoveCoupon}
        coupon={couponInfo}
        couponApplying={couponApplying}
        couponError={couponError}
      />

      {orderDetail &&
      <OrderSummaryPrices orderDetail={orderDetail} />
      }

    </div>
  );
};

export default OrderSummary;