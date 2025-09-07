'use client';

import { FC, useEffect, useState } from 'react';
import OrderDetailsModal from './components/OrderDetailsModal';
import { OrderDetail } from '../../(website)/checkout/components/types';
import api from '@/utils/api';
import { API_ADMIN_ORDERS } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { formatDate, formatCurrency } from './utils';

const statusColors:{[key:string]:string} = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
  ai_processing: 'bg-purple-100 text-purple-800',
  preparing: 'bg-blue-100 text-blue-800',
  printing: 'bg-orange-100 text-orange-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
};

const paymentStatusColors:{[key:string]:string} = {
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
  partial_refund: 'bg-yellow-100 text-yellow-800',
};

const statusLabels:{[key:string]:string} = {
  pending: '未付款',
  processing: 'AI生成中',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
  ai_processing: 'AI生成中',
  preparing: '人工审核中',
  printing: '印刷中',
  shipped: '运输中',
  delivered: '已完成',
};

const paymentStatusLabels:{[key:string]:string} = {
  paid: '已支付',
  unpaid: '支付失败',
  refunded: '已退款',
  partial_refund: '部分退款',
};

const AdminOrdersPage: FC = () => {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Lucy');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('Lucy');
  const [discountFilter, setDiscountFilter] = useState<string>('Lucy');
  const [regionFilter, setRegionFilter] = useState<string>('Lucy');
  const [currentPage, setCurrentPage] = useState(6);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const {data, code, success} = await api.get<ApiResponse>(API_ADMIN_ORDERS);
        if (success) {
          // Add mock data to match the design
          const mockOrders = [
            {
              id: 1,
              order_number: '1232343',
              user: { id: '1232343', name: '1232343', email: 'user@example.com' },
              status: 'pending',
              payment_status: 'paid',
              total_amount: 24,
              shipping_cost: 0,
              tax_amount: 0,
              discount_amount: 0,
              created_at: '2024-02-01T12:34:00Z',
              updated_at: '2024-02-01T12:34:00Z',
              items: [],
              shipping_address: { first_name: 'John', last_name: 'Doe' },
              coupon_code: 'SSJDUI'
            },
            {
              id: 2,
              order_number: '4545323',
              user: { id: '2332333', name: '2332333', email: 'user2@example.com' },
              status: 'ai_processing',
              payment_status: 'paid',
              total_amount: 64,
              shipping_cost: 0,
              tax_amount: 0,
              discount_amount: 0,
              created_at: '2024-02-01T12:34:00Z',
              updated_at: '2024-02-01T12:34:00Z',
              items: [],
              shipping_address: { first_name: 'Jane', last_name: 'Smith' },
              coupon_code: 'DFGFXI'
            },
            {
              id: 3,
              order_number: '4545323',
              user: { id: '2332333', name: '2332333', email: 'user3@example.com' },
              status: 'preparing',
              payment_status: 'paid',
              total_amount: 24,
              shipping_cost: 0,
              tax_amount: 0,
              discount_amount: 0,
              created_at: '2024-02-01T12:34:00Z',
              updated_at: '2024-02-01T12:34:00Z',
              items: [],
              shipping_address: { first_name: 'Bob', last_name: 'Johnson' },
              coupon_code: 'SSJDUI'
            },
            {
              id: 4,
              order_number: '4545323',
              user: { id: '2332333', name: '2332333', email: 'user4@example.com' },
              status: 'preparing',
              payment_status: 'paid',
              total_amount: 64,
              shipping_cost: 0,
              tax_amount: 0,
              discount_amount: 0,
              created_at: '2024-02-01T12:34:00Z',
              updated_at: '2024-02-01T12:34:00Z',
              items: [],
              shipping_address: { first_name: 'Alice', last_name: 'Wilson' },
              coupon_code: 'DFGFXI'
            },
            {
              id: 5,
              order_number: '4545323',
              user: { id: '2332333', name: '2332333', email: 'user5@example.com' },
              status: 'printing',
              payment_status: 'unpaid',
              total_amount: 24,
              shipping_cost: 0,
              tax_amount: 0,
              discount_amount: 0,
              created_at: '2024-02-01T12:34:00Z',
              updated_at: '2024-02-01T12:34:00Z',
              items: [],
              shipping_address: { first_name: 'Charlie', last_name: 'Brown' },
              coupon_code: 'SSJDUI'
            },
            {
              id: 6,
              order_number: '4545323',
              user: { id: '2332333', name: '2332333', email: 'user6@example.com' },
              status: 'shipped',
              payment_status: 'refunded',
              total_amount: 64,
              shipping_cost: 0,
              tax_amount: 0,
              discount_amount: 0,
              created_at: '2024-02-01T12:34:00Z',
              updated_at: '2024-02-01T12:34:00Z',
              items: [],
              shipping_address: { first_name: 'Diana', last_name: 'Prince' },
              coupon_code: 'DFGFXI'
            },
            {
              id: 7,
              order_number: '4545323',
              user: { id: '2332333', name: '2332333', email: 'user7@example.com' },
              status: 'delivered',
              payment_status: 'refunded',
              total_amount: 24,
              shipping_cost: 0,
              tax_amount: 0,
              discount_amount: 0,
              created_at: '2024-02-01T12:34:00Z',
              updated_at: '2024-02-01T12:34:00Z',
              items: [],
              shipping_address: { first_name: 'Eve', last_name: 'Adams' },
              coupon_code: 'SSJDUI'
            },
            {
              id: 8,
              order_number: '4545323',
              user: { id: '2332333', name: '2332333', email: 'user8@example.com' },
              status: 'cancelled',
              payment_status: 'partial_refund',
              total_amount: 64,
              shipping_cost: 0,
              tax_amount: 0,
              discount_amount: 0,
              created_at: '2024-02-01T12:34:00Z',
              updated_at: '2024-02-01T12:34:00Z',
              items: [],
              shipping_address: { first_name: 'Frank', last_name: 'Miller' },
              coupon_code: 'DFGFXI'
            }
          ];
          setOrders([...data, ...mockOrders]);
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

  const handleViewDetails = (order: OrderDetail) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const totalOrders = 312;
  const growthPercentage = 12;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-gray-600 hover:text-gray-800">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-medium text-gray-900">订单管理</h1>
            <div className="flex items-center text-sm text-gray-500 space-x-2">
              <span>共2条</span>
              <span>数据更新：2025/03/12 12:34</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              导出
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">订单笔数</h3>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">{totalOrders}</span>
              <span className="text-sm font-medium text-red-500 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {growthPercentage}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">订单笔数</h3>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">{totalOrders}</span>
              <span className="text-sm font-medium text-green-500 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                {growthPercentage}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">订单笔数</h3>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">{totalOrders}</span>
              <span className="text-sm font-medium text-green-500 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                {growthPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">下单时间：</label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="开始日期"
                />
                <span className="text-gray-500 text-sm">至</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="结束日期"
                />
              </div>
            </div>

            {/* Order Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">订单状态：</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Lucy">Lucy</option>
                <option value="pending">未付款</option>
                <option value="ai_processing">AI生成中</option>
                <option value="preparing">人工审核中</option>
                <option value="printing">印刷中</option>
                <option value="shipped">运输中</option>
                <option value="delivered">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">支付状态：</label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Lucy">Lucy</option>
                <option value="paid">已支付</option>
                <option value="unpaid">支付失败</option>
                <option value="refunded">已退款</option>
                <option value="partial_refund">部分退款</option>
              </select>
            </div>

            {/* Amount Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">实付金额：</label>
              <select
                value={discountFilter}
                onChange={(e) => setDiscountFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Lucy">Lucy</option>
                <option value="0-50">$0-$50</option>
                <option value="50-100">$50-$100</option>
                <option value="100+">$100+</option>
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">收货地区：</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Lucy">Lucy</option>
                <option value="US">美国</option>
                <option value="CN">中国</option>
                <option value="CA">加拿大</option>
                <option value="UK">英国</option>
              </select>
            </div>

            {/* Discount Code Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">折扣码：</label>
              <select
                value={discountFilter}
                onChange={(e) => setDiscountFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Lucy">Lucy</option>
                <option value="SSJDUI">SSJDUI</option>
                <option value="DFGFXI">DFGFXI</option>
              </select>
            </div>
          </div>

          {/* Search and Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                查询
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                搜索
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    支付状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    下单时间
                    <svg className="inline w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    应付金额
                    <svg className="inline w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    实付金额
                    <svg className="inline w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    折扣信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user?.id || order.user?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${statusColors[order.status]}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${paymentStatusColors[order.payment_status]}`}>
                          {paymentStatusLabels[order.payment_status] || order.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.coupon_code || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          详情
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                      没有找到符合条件的订单
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
              <span>Total 85 items</span>
            </div>
            <div className="flex items-center space-x-2">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500">
                  ...
                </span>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  4
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  5
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600 border-blue-500">
                  {currentPage}
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  7
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  8
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500">
                  ...
                </span>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  50
                </button>
                
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
              
              <div className="flex items-center space-x-2 ml-4">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                <span className="text-sm text-gray-500">Go to</span>
                <input
                  type="number"
                  min="1"
                  className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal 
          orderDetail={selectedOrder} 
          onClose={() => setShowDetailsModal(false)} 
          statusColors={statusColors} 
          paymentStatusColors={paymentStatusColors} 
          statusLabels={statusLabels} 
          paymentStatusLabels={paymentStatusLabels} 
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;