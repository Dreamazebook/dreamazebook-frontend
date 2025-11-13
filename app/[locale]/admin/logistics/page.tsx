'use client';

import { FC, useEffect, useState } from 'react';
import api from '@/utils/api';
import { API_ADMIN_LOGSTICS } from '@/constants/api';
import { ApiResponse } from '@/types/api';

interface LogisticsData {
  id: number;
  type: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const LogisticsPage: FC = () => {
  const [logisticsData, setLogisticsData] = useState<LogisticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogisticsData = async () => {
      try {
        const { data, success, message } = await api.get<ApiResponse<LogisticsData[]>>(API_ADMIN_LOGSTICS);
        if (success && data) {
          setLogisticsData(data);
        } else {
          setError(message || 'Failed to fetch logistics data');
        }
      } catch (err) {
        console.error('Error fetching logistics data:', err);
        setError('Failed to load logistics data');
      } finally {
        setLoading(false);
      }
    };

    fetchLogisticsData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Logistics Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Shipping Management</h3>
          <p className="text-blue-700 mb-4">Manage shipping methods, carriers, and delivery options.</p>
          <a href="/admin/logistics/shipping" className="text-blue-600 hover:text-blue-800 font-medium">
            Manage Shipping →
          </a>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Order Tracking</h3>
          <p className="text-green-700 mb-4">Track orders and update delivery status.</p>
          <a href="/admin/logistics/tracking" className="text-green-600 hover:text-green-800 font-medium">
            Track Orders →
          </a>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Returns & Refunds</h3>
          <p className="text-yellow-700 mb-4">Process returns and issue refunds.</p>
          <a href="/admin/logistics/returns" className="text-yellow-600 hover:text-yellow-800 font-medium">
            Manage Returns →
          </a>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Inventory Management</h3>
          <p className="text-purple-700 mb-4">Monitor stock levels and manage inventory.</p>
          <a href="/admin/logistics/inventory" className="text-purple-600 hover:text-purple-800 font-medium">
            Manage Inventory →
          </a>
        </div>
      </div>
      
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Logistics Activity</h2>
        {loading ? (
          <div className="bg-white p-4 rounded border border-gray-200">
            <p className="text-gray-500 text-center py-8">Loading logistics data...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-4 rounded border border-gray-200">
            <p className="text-red-500 text-center py-8">{error}</p>
          </div>
        ) : logisticsData.length === 0 ? (
          <div className="bg-white p-4 rounded border border-gray-200">
            <p className="text-gray-500 text-center py-8">No recent activity to display.</p>
          </div>
        ) : (
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logisticsData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                        item.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : item.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsPage;