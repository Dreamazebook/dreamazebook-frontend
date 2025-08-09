'use client';

import { FC } from 'react';
import { useEffect, useState } from 'react';

// 假数据
const mockData = {
  users: {
    total: 1254,
    active: 1087,
    new: 48,
    growth: 12.5
  },
  orders: {
    total: 3782,
    pending: 124,
    completed: 3520,
    revenue: 287650.75,
    growth: 8.2
  }
};

const AdminDashboard: FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(mockData);

  useEffect(() => {
    // 模拟加载数据
    const timer = setTimeout(() => {
      setDashboardData(mockData);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
            导出报告
          </button>
          <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
            刷新数据
          </button>
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">总用户数</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              +{dashboardData.users.growth}%
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{dashboardData.users.total.toLocaleString()}</p>
          <div className="mt-4 flex items-center text-sm font-medium text-green-600">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
            </svg>
            <span>较上月增长</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">活跃用户</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {Math.round((dashboardData.users.active / dashboardData.users.total) * 100)}%
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{dashboardData.users.active.toLocaleString()}</p>
          <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>过去30天内活跃</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">总订单数</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              +{dashboardData.orders.growth}%
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{dashboardData.orders.total.toLocaleString()}</p>
          <div className="mt-4 flex items-center text-sm font-medium text-green-600">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
            </svg>
            <span>较上月增长</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">总收入</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              +{dashboardData.orders.growth}%
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">¥{dashboardData.orders.revenue.toLocaleString()}</p>
          <div className="mt-4 flex items-center text-sm font-medium text-green-600">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
            </svg>
            <span>较上月增长</span>
          </div>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户统计 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">用户统计</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">活跃用户</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{dashboardData.users.active.toLocaleString()} ({Math.round((dashboardData.users.active / dashboardData.users.total) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.round((dashboardData.users.active / dashboardData.users.total) * 100)}%` }}></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">新注册用户（本月）</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{dashboardData.users.new.toLocaleString()} ({Math.round((dashboardData.users.new / dashboardData.users.total) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.round((dashboardData.users.new / dashboardData.users.total) * 100)}%` }}></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">不活跃用户</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{(dashboardData.users.total - dashboardData.users.active).toLocaleString()} ({Math.round(((dashboardData.users.total - dashboardData.users.active) / dashboardData.users.total) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${Math.round(((dashboardData.users.total - dashboardData.users.active) / dashboardData.users.total) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 订单统计 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">订单统计</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">已完成订单</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{dashboardData.orders.completed.toLocaleString()} ({Math.round((dashboardData.orders.completed / dashboardData.orders.total) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.round((dashboardData.orders.completed / dashboardData.orders.total) * 100)}%` }}></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">待处理订单</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{dashboardData.orders.pending.toLocaleString()} ({Math.round((dashboardData.orders.pending / dashboardData.orders.total) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.round((dashboardData.orders.pending / dashboardData.orders.total) * 100)}%` }}></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">取消/退款订单</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{(dashboardData.orders.total - dashboardData.orders.completed - dashboardData.orders.pending).toLocaleString()} ({Math.round(((dashboardData.orders.total - dashboardData.orders.completed - dashboardData.orders.pending) / dashboardData.orders.total) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.round(((dashboardData.orders.total - dashboardData.orders.completed - dashboardData.orders.pending) / dashboardData.orders.total) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近订单 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">最近订单</h2>
          <a href="/admin/orders" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            查看全部
          </a>
        </div>
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
                  日期
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { id: 'ORD-2023-8742', customer: '张三', date: '2023-11-28', amount: 1250.00, status: 'completed' },
                { id: 'ORD-2023-8741', customer: '李四', date: '2023-11-28', amount: 890.50, status: 'pending' },
                { id: 'ORD-2023-8740', customer: '王五', date: '2023-11-27', amount: 2340.75, status: 'completed' },
                { id: 'ORD-2023-8739', customer: '赵六', date: '2023-11-27', amount: 460.25, status: 'completed' },
                { id: 'ORD-2023-8738', customer: '钱七', date: '2023-11-26', amount: 1120.00, status: 'cancelled' },
              ].map((order, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-900">
                    <a href={`/admin/orders/${order.id}`}>{order.id}</a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ¥{order.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.status === 'completed' && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        已完成
                      </span>
                    )}
                    {order.status === 'pending' && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        待处理
                      </span>
                    )}
                    {order.status === 'cancelled' && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        已取消
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;