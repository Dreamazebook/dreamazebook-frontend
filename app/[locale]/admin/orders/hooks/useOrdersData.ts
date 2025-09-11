'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { API_ADMIN_ORDERS } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { OrderDetail } from '@/app/[locale]/(website)/checkout/components/types';

export const useOrdersData = () => {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, code, success } = await api.get<ApiResponse>(API_ADMIN_ORDERS);
        if (success) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, loading, error, setOrders };
};