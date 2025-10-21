import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import api from '@/utils/api';
import { API_ORDER_DETAIL, API_ORDER_STRIPE_PAID } from '@/constants/api';
import { OrderDetail } from '../components/types';
import { ApiResponse } from '@/types/api';
import { Address } from '@/types/address';

export const useOrderDetail = (orderId: string | null) => {
  const router = useRouter();
  const [orderDetail, setOrderDetail] = useState<OrderDetail>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      const fetchOrderDetails = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const { data, success } = await api.get<ApiResponse<OrderDetail>>(API_ORDER_DETAIL(orderId));
          if (!data) return;
          setOrderDetail(data);

          if (data?.stripe_payment_intent_id) {
            const response = await api.post<ApiResponse>(API_ORDER_STRIPE_PAID, {
              order_id: orderId,
              payment_intent_id: data.stripe_payment_intent_id,
            });
            if (response.success && response.data?.payment_status === 'paid') {
              return router.push(`/order-summary?orderId=${orderId}`);
            }
          }
        } catch (err) {
          setError('Failed to load order details');
          console.error('Error fetching order details:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrderDetails();
    }
  }, [orderId, router]);

  return { orderDetail, setOrderDetail, isLoading, error };
};