import { useState } from 'react';
import api from '@/utils/api';
import { API_ORDER_UPDATE_SHIPPING } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { ShippingOption } from '../components/types';

export const useShippingMethod = (orderId: string | null) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateOrderShippingMethod = async (shippingOption: ShippingOption) => {
    if (!orderId) return null;
    
    setIsLoading(true);
    const { data, success } = await api.put<ApiResponse>(
      API_ORDER_UPDATE_SHIPPING(orderId), 
      {
        shipping_method: shippingOption.code,
        shipping_cost: shippingOption.cost
      }
    );
    setIsLoading(false);

    if (success) {
      return data;
    }
    return null;
  };

  return {
    isLoading,
    updateOrderShippingMethod
  };
};