'use client';

import React from 'react';
import { CartItem, OrderDetail, OrderDetailResponse } from './types';
import DisplayPrice from '../../components/component/DisplayPrice';
import OrderSummaryPrices from '../../components/component/OrderSummaryPrices';
import CouponInput from '../../shopping-cart/components/CouponInput';

interface OrderSummaryProps {
  orderDetail?: OrderDetailResponse;
  handleApplyCoupon: (code: string) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  handleApplyCoupon,
  orderDetail,
}) => {
  const order = orderDetail?.order;

  return (
    <div className="bg-gray-50 p-6 rounded sticky top-4 right-0 z-0">
      <h3 className="text-lg font-medium mb-4">Order Summary</h3>
      
      <div className="space-y-4 mb-6">
        {order?.items?.map((item) => (
          <div key={item.id} className="flex items-start">
            <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
              <img
                src={item.picbook_cover}
                alt={item.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="flex-grow">
              <h4 className="text-sm font-medium">{item.picbook_name}</h4>
              {item.format && <p className="text-sm text-gray-500">{item.format}</p>}
              {item.box && <p className="text-sm text-gray-500">{item.box}</p>}
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
            <DisplayPrice value={item.price} style='text-sm font-medium' />
          </div>
        ))}
      </div>

      {/* <CouponInput onApply={handleApplyCoupon}  /> */}

      {orderDetail?.order.coupon_code && (
        <p className="text-green-600 text-sm mb-2">
          Coupon Code: <strong>{orderDetail?.order.coupon_code}</strong>
        </p>
      )}
      
      {orderDetail &&
      <OrderSummaryPrices orderDetail={orderDetail} />
      }

    </div>
  );
};

export default OrderSummary;