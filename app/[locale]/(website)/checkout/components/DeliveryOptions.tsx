'use client';

import React, { useEffect, useState } from 'react';
import {OrderDetail, ShippingOption } from './types';
import api from '@/utils/api';
import { ApiResponse } from '@/types/api';
import { API_ORDER_SHIPPING_METHODS } from '@/constants/api';
import DisplayPrice from '../../components/component/DisplayPrice';
import NextStepButton from './NextStepButton';

interface DeliveryOptionsProps {
  orderDetail: OrderDetail;
  updateOrderShippingMethod: (option:ShippingOption) => void;
  handleNextFromDelivery: () => void;
}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({
  orderDetail,
  updateOrderShippingMethod,
  handleNextFromDelivery
}) => {
  return (
    <>
      <div className="space-y-4 mb-6">
        {orderDetail?.shipping_options.map(({code, cost, name, description, type, estimated_days})=>
        <div 
          key={type}
          className={`border rounded-lg p-4 cursor-pointer ${orderDetail.shipping_method === code ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onClick={() => updateOrderShippingMethod({code,cost})}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${orderDetail.shipping_method === code ? 'border-blue-500' : 'border-gray-300'}`}>
                {orderDetail.shipping_method === code && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              <div>
                <h4 className="font-medium">{name}</h4>
                <p className="text-sm text-gray-600">Estimated delivery: {estimated_days} business days</p>
                <p className='text-[#999999]'>{description}</p>
              </div>
            </div>
            <DisplayPrice value={cost} />
          </div>
        </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <NextStepButton
          disabled={orderDetail.shipping_method === null}
          handleOnClick={handleNextFromDelivery}
        >Continue to Payment</NextStepButton>
      </div>
    </>
  );
};

export default DeliveryOptions;