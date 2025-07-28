'use client';

import { FC, useEffect, useState } from 'react';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  payment_status: 'paid' | 'unpaid' | 'refunded';
  created_at: string;
  updated_at: string;
  items_count: number;
}

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

// 模拟订单数据
const mockOrders: Order[] = [
  {
    id: 'ORD-2023-8742',
    customer_name: '张三',
    customer_email: 'zhangsan@example.com',
    total_amount: 1250.00,
    status: 'completed',
    payment_status: 'paid',
    created_at: '2023-11-28T14:32:10Z',
    updated_at: '2023-11-28T14:45:22Z',
    items_count: 3
  },
  {
    id: 'ORD-2023-8741',
    customer_name: '李四',
    customer_email: 'lisi@example.com',
    total_amount: 890.50,
    status: 'pending',
    payment_status: 'paid',
    created_at: '2023-11-28T12:15:33Z',
    updated_at: '2023-11-28T12:15:33Z',
    items_count: 2
  },
  {
    id: 'ORD-2023-8740',
    customer_name: '王五',
    customer_email: 'wangwu@example.com',
    total_amount: 2340.75,
    status: 'completed',
    payment_status: 'paid',
    created_at: '2023-11-27T09:45:12Z',
    updated_at: '2023-11-27T10:30:45Z',
    items_count: 5
  },
  {
    id: 'ORD-2023-8739',
    customer_name: '赵六',
    customer_email: 'zhaoliu@example.com',
    total_amount: 460.25,
    status: 'processing',
    payment_status: 'paid',
    created_at: '2023-11-27T08:22:18Z',
    updated_at: '2023-11-27T08:35:42Z',
    items_count: 1
  },
  {
    id: 'ORD-2023-8738',
    customer_name: '钱七',
    customer_email: 'qianqi@example.com',
    total_amount: 1120.00,
    status: 'cancelled',
    payment_status: 'refunded',
    created_at: '2023-11-26T16:10:05Z',
    updated_at: '2023-11-26T18:45:30Z',
    items_count: 3
  },
  {
    id: 'ORD-2023-8737',
    customer_name: '孙八',
    customer_email: 'sunba@example.com',
    total_amount: 750.50,
    status: 'completed',
    payment_status: 'paid',
    created_at: '2023-11-26T11:05:22Z',
    updated_at: '2023-11-26T11:45:18Z',
    items_count: 2
  },
  {
    id: 'ORD-2023-8736',
    customer_name: '周九',
    customer_email: 'zhoujiu@example.com',
    total_amount: 1890.25,
    status: 'completed',
    payment_status: 'paid',
    created_at: '2023-11-25T14:30:45Z',
    updated_at: '2023-11-25T15:20:12Z',
    items_count: 4
  },
  {
    id: 'ORD-2023-8735',
    customer_name: '吴十',
    customer_email: 'wushi@example.com',
    total_amount: 320.75,
    status: 'refunded',
    payment_status: 'refunded',
    created_at: '2023-11-25T09:15:33Z',
    updated_at: '2023-11-25T14:40:22Z',
    items_count: 1
  }
];

const AdminOrdersPage: FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // 在实际应用中，这里会从API获取订单数据
        // const response = await api.get<ApiResponse<Order[]>>(API_ADMIN_ORDERS);
        // if (response.success && response.data) {
        //   setOrders(response.data);
        // } else {
        //   setError('Failed to fetch orders');
        // }
        
        // 使用模拟数据
        setTimeout(() => {
          setOrders(mockOrders);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 分页逻辑
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusCounts = () => {
    const counts = {
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

  const handleViewDetails = (order: Order) => {
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
          <div className="w-full md:w-1/3">
            <label htmlFor="search" className="sr-only">搜索订单</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="搜索订单号、客户名称或邮箱"
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilterChange('all')}
              className={`px-3 py-1 text-sm rounded-full ${
                statusFilter === 'all'
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部 ({statusCounts.all})
            </button>
            <button
              onClick={() => handleStatusFilterChange('pending')}
              className={`px-3 py-1 text-sm rounded-full ${
                statusFilter === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              待处理 ({statusCounts.pending})
            </button>
            <button
              onClick={() => handleStatusFilterChange('processing')}
              className={`px-3 py-1 text-sm rounded-full ${
                statusFilter === 'processing'
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              处理中 ({statusCounts.processing})
            </button>
            <button
              onClick={() => handleStatusFilterChange('completed')}
              className={`px-3 py-1 text-sm rounded-full ${
                statusFilter === 'completed'
                  ? 'bg-green-100 text-green-800 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              已完成 ({statusCounts.completed})
            </button>
            <button
              onClick={() => handleStatusFilterChange('cancelled')}
              className={`px-3 py-1 text-sm rounded-full ${
                statusFilter === 'cancelled'
                  ? 'bg-red-100 text-red-800 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              已取消 ({statusCounts.cancelled})
            </button>
            <button
              onClick={() => handleStatusFilterChange('refunded')}
              className={`px-3 py-1 text-sm rounded-full ${
                statusFilter === 'refunded'
                  ? 'bg-purple-100 text-purple-800 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              已退款 ({statusCounts.refunded})
            </button>
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单号
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  支付状态
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{formatCurrency(order.total_amount)}</div>
                      <div className="text-xs text-gray-500">{order.items_count} 件商品</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusColors[order.payment_status]}`}>
                        {paymentStatusLabels[order.payment_status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    没有找到符合条件的订单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页控件 */}
        {filteredOrders.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  显示第 <span className="font-medium">{indexOfFirstOrder + 1}</span> 到 
                  <span className="font-medium"> {Math.min(indexOfLastOrder, filteredOrders.length)}</span> 条，
                  共 <span className="font-medium">{filteredOrders.length}</span> 条结果
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">上一页</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">下一页</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 订单详情模态框 */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      订单详情
                    </h3>
                    <div className="border-t border-gray-200 py-4">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">订单号</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedOrder.id}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">订单日期</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedOrder.created_at)}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">客户名称</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedOrder.customer_name}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">客户邮箱</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedOrder.customer_email}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">订单状态</dt>
                          <dd className="mt-1">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[selectedOrder.status]}`}>
                              {statusLabels[selectedOrder.status]}
                            </span>
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">支付状态</dt>
                          <dd className="mt-1">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusColors[selectedOrder.payment_status]}`}>
                              {paymentStatusLabels[selectedOrder.payment_status]}
                            </span>
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">总金额</dt>
                          <dd className="mt-1 text-sm text-gray-900 font-bold">{formatCurrency(selectedOrder.total_amount)}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDetailsModal(false)}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )};


  export default AdminOrdersPage;