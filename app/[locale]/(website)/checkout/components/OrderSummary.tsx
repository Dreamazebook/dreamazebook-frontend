'use client';

import React from 'react';
import { CartItem, OrderDetail, OrderDetailResponse } from './types';
import DisplayPrice from '../../components/component/DisplayPrice';

interface OrderSummaryProps {
  orderDetail?: OrderDetailResponse;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderDetail,
}) => {
  const order = orderDetail?.order;
  const total = order?.total_amount || 0;
  const shippingCost = order?.shipping_cost || 0;
  const subtotal = total - shippingCost;
  const discount = 0; // No discount in the original code

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
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
      
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <p>Subtotal</p>
          <DisplayPrice value={subtotal} />
        </div>
        <div className="flex justify-between text-sm">
          <p>Shipping</p>
          <DisplayPrice value={shippingCost} />
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <p>Discount</p>
            <DisplayPrice value={-discount} />
          </div>
        )}
        <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
          <p>Total</p>
          <DisplayPrice value={total} />
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;