'use client';

import { FC, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';;
import api from '@/utils/api';
import { API_ADMIN_ORDERS } from '@/constants/api';
import { ApiResponse, OrderPreviewResponse } from '@/types/api';
import LoadingState from '../../orders/components/LoadingState';
import ErrorState from '../../orders/components/ErrorState';

const AdminAuditDetailPage: FC = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<OrderPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderPreview = async () => {
      try {
        const { data, success, message } = await api.get<ApiResponse<OrderPreviewResponse>>(`${API_ADMIN_ORDERS}/${orderId}/preview`);
        if (success && data) {
          setOrder(data);
        } else {
          setError(message || 'Failed to fetch order preview');
        }
      } catch (err) {
        console.error('Error fetching order preview:', err);
        setError('Failed to load order preview');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderPreview();
    }
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!order) return <ErrorState error="Order preview not found" />;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Order Preview</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Order Info</h2>
          <p>Order Number: {order.order_info.order_number}</p>
          <p>Status: {order.order_info.status_text}</p>
          <p>Created At: {order.order_info.created_at}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">User Info</h2>
          <p>Name: {order.user_info.name}</p>
          <p>Email: {order.user_info.email}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Items</h2>
          {order.items.map((item) => (
            <div key={item.item_id} className="mb-4 p-4 border rounded">
              <h3 className="font-medium">{item.picbook.name}</h3>
              <p>Recipient: {item.personalization.recipient_name}</p>
              <p>Message: {item.personalization.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAuditDetailPage;