'use client';

import React from 'react';
import { CartItem, DeliveryOption, OrderDetail, OrderDetailResponse } from './types';

interface OrderSummaryProps {
  orderDetail?: OrderDetailResponse;
  selectedDeliveryOption: DeliveryOption;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderDetail,
  selectedDeliveryOption
}) => {
  const order = orderDetail?.order;
  const subtotal = order?.total_amount || 0;
  const shippingCost = selectedDeliveryOption === 'Standard' ? 4.99 : 9.99;
  const discount = 0; // No discount in the original code
  const total = subtotal + shippingCost - discount;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Order Summary</h3>
      
      <div className="space-y-4 mb-6">
        {order?.items.map((item) => (
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
            <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <p>Subtotal</p>
          <p>${subtotal}</p>
        </div>
        <div className="flex justify-between text-sm">
          <p>Shipping</p>
          <p>${shippingCost}</p>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <p>Discount</p>
            <p>-${discount}</p>
          </div>
        )}
        <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
          <p>Total</p>
          <p>${total}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;