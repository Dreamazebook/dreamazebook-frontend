'use client';
import React, { useEffect, useState } from 'react';
import { formatDate, OrderDetail } from '../../checkout/components/types';
import { API_ORDER_LIST } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import api from '@/utils/api';
import Link from 'next/link';

const OrderHistory = () => {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const {data,success,code,message} = await api.get<ApiResponse<OrderDetail[]>>(API_ORDER_LIST);
        // Transform API response to match expected format
        if (!data) return;
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders. Please try again later.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'text-green-600';
      case 'processing': return 'text-orange-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (orders.length === 0) return <div className="text-center py-8">No orders found</div>;

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
            <button className="px-0 py-3 mr-8 text-blue-600 border-b-2 border-blue-600 font-medium text-sm">
              All Order(50)
            </button>
            <button className="px-0 py-3 mr-8 text-gray-600 hover:text-gray-800 text-sm">
              Pending(10)
            </button>
            <button className="px-0 py-3 mr-8 text-gray-600 hover:text-gray-800 text-sm">
              Completed(25)
            </button>
            <button className="px-0 py-3 mr-8 text-gray-600 hover:text-gray-800 text-sm">
              Cancelled(15)
            </button>
          </div>
        </div>

        {/* Order List */}
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div key={index} className="flex gap-4 py-4">
              {/* Product Images */}
              <div className="flex-shrink-0">
                {/* {order.images ? (
                  <div className="relative">
                    <img
                      src={order.images[0]}
                      alt="Product"
                      className="w-20 h-20 object-cover"
                    />
                    <img
                      src={order.images[1]}
                      alt="Product"
                      className="w-20 h-20 object-cover absolute -right-4 -bottom-4"
                    />
                    <div className="absolute -right-6 -bottom-2 text-sm text-gray-500">
                      {order.extraCount}
                    </div>
                  </div>
                ) : (
                  <img
                    src={order.image}
                    alt="Product"
                    className="w-20 h-20 object-cover"
                  />
                )} */}
              </div>

              {/* Order Details */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium text-base">{order.order_number}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                    </svg>
                    <span className={`${getStatusColor(order.status)} capitalize font-medium`}>{order.status}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">${order.total_amount}</span>
                </div>

                <div className="text-sm text-gray-600 mb-1">
                  <span className="text-gray-900">Ship to:</span> {order.shipping_address?.full_address}
                </div>

                <div className="flex gap-8 text-sm text-gray-600 mb-1">
                  <span><span className="text-gray-900">Order date:</span> {formatDate(order.created_at)}</span>
                  {order.updated_at && (
                    <span><span className="text-gray-900">Delivery date:</span> {formatDate(order.updated_at)}</span>
                  )}
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <span className="text-gray-900">Qty:</span> {order.items.length}
                </div>

                <div className="flex gap-6">
                  <button className="text-blue-600 hover:underline text-sm">
                    Download Invoice
                  </button>
                  <button className="text-blue-600 hover:underline text-sm">
                    Buy the Same
                  </button>
                  <Link href={`/checkout?orderId=${order.id}`} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                    More Details
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;