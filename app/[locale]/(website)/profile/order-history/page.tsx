'use client';
import React, { useEffect, useState } from 'react';
import { formatDate } from '../../checkout/components/types';
import { Link } from "@/i18n/routing";
import useUserStore from '@/stores/userStore';
import DisplayPrice from '../../components/component/DisplayPrice';
import { formatAddress } from '@/types/address';
import OrderHistoryCard from './components/OrderHistoryCard';

const OrderHistory = () => {
  const {orderList, fetchOrderList} = useUserStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const filteredOrders = activeTab === 'all' 
    ? orderList 
    : orderList.filter(order => order.status === activeTab);

  const tabs = [
    { id: 'all', label: 'All Order', count: orderList.length },
    { id: 'pending', label: 'Pending', count: orderList.filter(order => order.status === 'pending').length },
    { id: 'preparing', label: 'Preparing', count: orderList.filter(order => order.status === 'preparing').length },
    { id: 'completed', label: 'Completed', count: orderList.filter(order => order.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: orderList.filter(order => order.status === 'cancelled').length },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        fetchOrderList();
      } catch (err) {
        setError('Failed to load orders. Please try again later.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-8">Loading orders...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (orderList.length === 0) return <div className="text-center py-8">No orders found</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-normal text-gray-900">Order History</h1>
          <div className="flex gap-3">
            <button className="px-5 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50">
              Show Invoice
            </button>
            <button className="px-5 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">
              Buy now
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex gap-0 border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer px-0 py-3 mr-8 text-sm ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
              >
                {tab.label}({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Order List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <OrderHistoryCard orderDetail={order} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;