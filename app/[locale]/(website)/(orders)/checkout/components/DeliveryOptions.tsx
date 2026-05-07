'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';
import { ApiResponse } from '@/types/api';
import { API_ORDER_SHIPPING_METHODS } from '@/constants/api';
import DisplayPrice from '../../../components/component/DisplayPrice';
import NextStepButton from './NextStepButton';
import { OrderDetail, ShippingOption, getShippingOptions } from '@/types/order';
import { fbTrackCustom } from '@/utils/track';

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
  const t = useTranslations('checkoutPage');
  const hasFreeShipping = getShippingOptions(orderDetail.shipping_options).some(option => option.is_free);
  return (
    <>
      <div className="space-y-4 mb-6">
        {getShippingOptions(orderDetail.shipping_options).map(({code, cost, name, is_free, payable_cost, description, type, estimated_days})=>
        <div 
          key={type}
          className={`border rounded-lg p-4 cursor-pointer ${orderDetail.shipping_method === code ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onClick={() => updateOrderShippingMethod({code,cost,payable_cost})}
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
                <p className="text-sm text-gray-600">{t("estimatedDelivery", {days: estimated_days})}</p>
                {/* <p className='text-[#999999]'>{description}</p> */}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {hasFreeShipping ? 
              <>
                {is_free ? <span className="bg-[#FFE5E5] p-1 text-[16px]">Shipping included</span> : <span className="text-[#999999] text-[14px]">Need it sooner? Upgrade available</span>}
                <div>+<DisplayPrice value={payable_cost} /></div>
                {is_free && <span className="text-[#222222] text-[16px] font-bold">Free</span>}
              </>
              :
              <DisplayPrice value={cost} />}
            </div>
          </div>
        </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <NextStepButton
          disabled={orderDetail.shipping_method === null}
          handleOnClick={() => {
            // Track CheckoutStepComplete for shipping step
            fbTrackCustom('CheckoutStepComplete', { step: 'shipping' });
            handleNextFromDelivery();
          }}
        >{t("continueToPayment")}</NextStepButton>
      </div>
    </>
  );
};

export default DeliveryOptions;