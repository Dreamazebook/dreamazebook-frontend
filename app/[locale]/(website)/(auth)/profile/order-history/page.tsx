'use client';
import React, { useEffect, useState } from 'react';
import { Link } from "@/i18n/routing";
import useUserStore from '@/stores/userStore';
import DisplayPrice from '../../../components/component/DisplayPrice';
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
        <div className="relative mb-6">
          {/* Left Shadow Gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          
          {/* Right Shadow Gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          {/* Scrollable Tab Container */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex border-b border-gray-200 min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-none cursor-pointer px-6 py-3 text-sm whitespace-nowrap
                    transition-colors duration-200
                    ${activeTab === tab.id 
                      ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                      : 'text-gray-600 hover:text-gray-800 border-b-2 border-transparent'
                    }
                  `}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        <style jsx global>{`
          /* Hide scrollbar for Chrome, Safari and Opera */
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }

          /* Hide scrollbar for IE, Edge and Firefox */
          .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>

        {/* Order List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <OrderHistoryCard key={order.id} orderDetail={order} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;