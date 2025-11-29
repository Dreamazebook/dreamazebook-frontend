'use client';

import { FC, useEffect, useState } from 'react';
import api from '@/utils/api';
import { API_ADMIN_LOGSTICS, API_ADMIN_LOGSTIC_COMFIRM, API_ADMIN_LOGSTIC_PRINT } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { LogisticsOrder } from '@/types/logistics';

const LogisticsPage: FC = () => {
  const [logisticsData, setLogisticsData] = useState<LogisticsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingOrderId, setCreatingOrderId] = useState<number | null>(null);
  const [confirmingOrderIds, setConfirmingOrderIds] = useState<number[]>([]);
  const [printingOrderIds, setPrintingOrderIds] = useState<number[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

  const handleCreate4PXOrder = async (orderId: number) => {
    setCreatingOrderId(orderId);
    try {
      const response = await api.post<ApiResponse<any>>(`/admin/logistics/${orderId}/create-4px-order`);
      if (response.success) {
        // Refresh the logistics data to update the status
        const { data, success } = await api.get<ApiResponse<LogisticsOrder[]>>(API_ADMIN_LOGSTICS);
        if (success && data) {
          setLogisticsData(data);
        }
      } else {
        setError((response as any).message || 'Failed to create 4PX order');
      }
    } catch (err) {
      console.error('Error creating 4PX order:', err);
      setError('Failed to create 4PX order');
    } finally {
      setCreatingOrderId(null);
    }
  };

  const handleConfirmOrders = async () => {
    if (selectedOrderIds.length === 0) {
      setError('Please select at least one order to confirm');
      return;
    }

    setConfirmingOrderIds(selectedOrderIds);
    try {
      const response = await api.post<ApiResponse<any>>(API_ADMIN_LOGSTIC_COMFIRM, {order_ids:selectedOrderIds});
      if (response.success) {
        // Refresh the logistics data to update the status
        const { data, success } = await api.get<ApiResponse<LogisticsOrder[]>>(API_ADMIN_LOGSTICS);
        if (success && data) {
        }
        setSelectedOrderIds([]);
      } else {
        setError((response as any).message || 'Failed to confirm orders');
      }
    } catch (err) {
      console.error('Error confirming orders:', err);
      setError('Failed to confirm orders');
    } finally {
      setConfirmingOrderIds([]);
    }
  };

  const handlePrintOrders = async () => {
    if (selectedOrderIds.length === 0) {
      setError('Please select at least one order to print');
      return;
    }

    // Get logistics request numbers for selected orders
    const selectedOrders = logisticsData.filter(item => selectedOrderIds.includes(item.id));
    const requestNos = selectedOrders
      .map(item => item.logistics_request_no)
      .filter(no => no !== null) as string[];

    if (requestNos.length === 0) {
      setError('No logistics request numbers found for selected orders');
      return;
    }

    setPrintingOrderIds(selectedOrderIds);
    try {
      const response = await api.post<ApiResponse<any>>(API_ADMIN_LOGSTIC_PRINT, { request_nos: requestNos });
      if (response.success) {
        // Handle successful print response - could be a PDF download or print preview
        // For now, just show success message
        const { data, success } = await api.get<ApiResponse<LogisticsOrder[]>>(API_ADMIN_LOGSTICS);
        if (success && data) {
          setLogisticsData(data);
        }
        setSelectedOrderIds([]);
      } else {
        setError((response as any).message || 'Failed to print orders');
      }
    } catch (err) {
      console.error('Error printing orders:', err);
      setError('Failed to print orders');
    } finally {
      setPrintingOrderIds([]);
    }
  };

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === logisticsData.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(logisticsData.map(item => item.id));
    }
  };

  useEffect(() => {
    const fetchLogisticsData = async () => {
      try {
        const { data, success, message } = await api.get<ApiResponse<LogisticsOrder[]>>(API_ADMIN_LOGSTICS);
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
      
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Logistics Activity</h2>
          {selectedOrderIds.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handlePrintOrders}
                disabled={printingOrderIds.length > 0}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors"
              >
                {printingOrderIds.length > 0 ? 'Printing...' : `Print Selected (${selectedOrderIds.length})`}
              </button>
              <button
                onClick={handleConfirmOrders}
                disabled={confirmingOrderIds.length > 0}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
              >
                {confirmingOrderIds.length > 0 ? 'Confirming...' : `Confirm Selected (${selectedOrderIds.length})`}
              </button>
            </div>
          )}
        </div>
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
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.length === logisticsData.length && logisticsData.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logistics Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logisticsData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(item.id)}
                        onChange={() => handleSelectOrder(item.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                        item.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : item.status === 'confirmed' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.logistics_status || 'Not created'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.can_create_logistics && (
                        <button
                          onClick={() => handleCreate4PXOrder(item.id)}
                          disabled={creatingOrderId === item.id}
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {creatingOrderId === item.id ? 'Creating...' : 'Create 4PX Order'}
                        </button>
                      )}
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