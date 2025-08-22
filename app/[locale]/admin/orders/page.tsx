'use client';

import { FC, useEffect, useState } from 'react';
import OrderList from './components/OrderList';
import OrderDetailsModal from './components/OrderDetailsModal';
import Pagination from './components/Pagination';
import StatusFilter from './components/StatusFilter';
import SearchBar from './components/SearchBar';
import { OrderDetail } from '../../(website)/checkout/components/types';
import api from '@/utils/api';
import { API_ADMIN_ORDERS } from '@/constants/api';
import { ApiResponse } from '@/types/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

const paymentStatusColors = {
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

const statusLabels = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

const paymentStatusLabels = {
  paid: '已支付',
  unpaid: '未支付',
  refunded: '已退款',
};

const AdminOrdersPage: FC = () => {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const {data,code,success} = await api.get<ApiResponse>(API_ADMIN_ORDERS);
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.shipping_address?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.shipping_address?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 分页逻辑
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const getStatusCounts = () => {
    const counts:{[key:string]:number} = {
      all: orders.length,
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    };

    orders.forEach(order => {
      counts[order.status] += 1;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const handleViewDetails = (order: OrderDetail) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // 重置到第一页
  };

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
              <h3 className="text-sm font-medium text-red-800">错误</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
        <p className="mt-2 text-sm text-gray-600">查看和管理所有客户订单</p>
      </div>

      {/* 搜索和过滤 */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <SearchBar 
            searchTerm={searchTerm} 
            onSearchChange={(term) => {
              setSearchTerm(term);
              setCurrentPage(1);
            }} 
          />
          <StatusFilter 
            statusFilter={statusFilter} 
            onStatusFilterChange={handleStatusFilterChange} 
            statusCounts={statusCounts} 
          />
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <OrderList 
          orders={currentOrders} 
          onViewDetails={handleViewDetails} 
          statusColors={statusColors} 
          paymentStatusColors={paymentStatusColors} 
          statusLabels={statusLabels} 
          paymentStatusLabels={paymentStatusLabels} 
        />

        {/* 分页控件 */}
        {filteredOrders.length > 0 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
            indexOfFirstItem={indexOfFirstOrder} 
            indexOfLastItem={indexOfLastOrder} 
            totalItems={filteredOrders.length} 
          />
        )}
      </div>

      {/* 订单详情模态框 */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
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