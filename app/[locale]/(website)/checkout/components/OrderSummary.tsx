'use client';

import React from 'react';
import { OrderDetail } from '@/types/order';
import DisplayPrice from '../../components/component/DisplayPrice';
import OrderSummaryPrices from '../../components/component/OrderSummaryPrices';
import CouponInput from '../../shopping-cart/components/CouponInput';

interface OrderSummaryProps {
  orderDetail?: OrderDetail;
  handleApplyCoupon: (code: string) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  handleApplyCoupon,
  orderDetail,
}) => {
  return (
    <div className="bg-gray-50 p-6 rounded sticky top-4 right-0 z-0">
      <h3 className="text-lg font-medium mb-4">Summary</h3>
      
      <div className="space-y-4 mb-6">
        {orderDetail?.items?.map((item) => (
          <div key={item.id} className="flex items-start">
            <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
              <img
                src={item.product_image || '/home-page/cover.png'}
                alt={item.sku_code}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="flex-grow">
              <h4 className="text-sm font-medium">{item.spu_code}</h4>
              {/* {item.format && <p className="text-sm text-gray-500">{item.format}</p>}
              {item.box && <p className="text-sm text-gray-500">{item.box}</p>} */}
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
            <DisplayPrice value={item.total_price} style='text-sm font-medium' />
          </div>
        ))}
      </div>

      {/* <CouponInput onApply={handleApplyCoupon}  /> */}

      {orderDetail?.coupon_code && (
        <p className="text-green-600 text-sm mb-2">
          Coupon Code: <strong>{orderDetail?.coupon_code}</strong>
        </p>
      )}
      
      {orderDetail &&
      <OrderSummaryPrices orderDetail={orderDetail} />
      }

    </div>
  );
};

export default OrderSummary;