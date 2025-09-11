'use client';

import { FC, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderDetail } from '../../../(website)/checkout/components/types';
import api from '@/utils/api';
import { API_ADMIN_ORDERS } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import OrderDetailHeader from './components/OrderDetailHeader';
import OrderDetailTabs from './components/OrderDetailTabs';
import OrderOverview from './components/OrderOverview';
import OrderItems from './components/OrderItems';
import OrderCustomer from './components/OrderCustomer';
import OrderShipping from './components/OrderShipping';
import OrderPayment from './components/OrderPayment';
import OrderTimeline from './components/OrderTimeline';
import OrderActions from './components/OrderActions';
import {
  statusColors,
  paymentStatusColors,
  statusLabels,
  paymentStatusLabels,
} from '../constants/orderConstants';

const AdminOrderDetailPage: FC = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const { data, success, message } = await api.get<ApiResponse<OrderDetail>>(`${API_ADMIN_ORDERS}/${orderId}`);
        if (success && data) {
          setOrder(data);
        } else {
          setError(message || 'Failed to fetch order details');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    
    try {
      const { success, data } = await api.put<ApiResponse<OrderDetail>>(`${API_ADMIN_ORDERS}/${orderId}`, {
        status: newStatus
      });
      
      if (success && data) {
        setOrder(data);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handlePaymentStatusUpdate = async (newPaymentStatus: string) => {
    if (!order) return;
    
    try {
      const { success, data } = await api.put<ApiResponse<OrderDetail>>(`${API_ADMIN_ORDERS}/${orderId}`, {
        payment_status: newPaymentStatus
      });
      
      if (success && data) {
        setOrder(data);
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  const renderTabContent = () => {
    if (!order) return null;

    switch (activeTab) {
      case 'overview':
        return <OrderOverview order={order} />;
      case 'items':
        return <OrderItems order={order} />;
      case 'customer':
        return <OrderCustomer order={order} />;
      case 'shipping':
        return <OrderShipping order={order} />;
      case 'payment':
        return <OrderPayment order={order} />;
      case 'timeline':
        return <OrderTimeline order={order} />;
      default:
        return <OrderOverview order={order} />;
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!order) return <ErrorState error="Order not found" />;

  return (
    <div className="bg-gray-50 min-h-screen">
      <OrderDetailHeader 
        order={order}
        onBack={() => router.push('/admin/orders')}
        statusColors={statusColors}
        paymentStatusColors={paymentStatusColors}
        statusLabels={statusLabels}
        paymentStatusLabels={paymentStatusLabels}
        onStatusUpdate={handleStatusUpdate}
        onPaymentStatusUpdate={handlePaymentStatusUpdate}
      />

      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <OrderDetailTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          <div className="mt-6">
            {renderTabContent()}
          </div>

          <OrderActions 
            order={order}
            onRefresh={() => window.location.reload()}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;