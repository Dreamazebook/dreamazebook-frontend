'use client';

import { FC, useEffect, useState } from 'react';
import Head from 'next/head';
import api from '@/utils/api';
import { API_ADMIN_LOGSTICS, API_ADMIN_LOGSTIC_COMFIRM, API_ADMIN_LOGSTIC_PRINT, API_ADMIN_LOGSTIC_DETAIL_PRINT_LABEL } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { LogisticsOrder } from '@/types/logistics';

const LogisticsPage: FC = () => {
  const [logisticsData, setLogisticsData] = useState<LogisticsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingOrderId, setCreatingOrderId] = useState<number | null>(null);
  const [confirmingOrderIds, setConfirmingOrderIds] = useState<number[]>([]);
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);
  const [printingOrderIds, setPrintingOrderIds] = useState<number[]>([]);
  const [printingLabelOrderId, setPrintingLabelOrderId] = useState<number | null>(null);
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
    } catch (err:any) {
      console.error('Error creating 4PX order:', err);
      setError(err?.response?.data?.message || 'Failed to create 4PX order');
    } finally {
      setCreatingOrderId(null);
    }
  };

  const handleConfirmOrder = async (orderId: number) => {
    setConfirmingOrderId(orderId);
    try {
      const response = await api.post<ApiResponse<any>>(API_ADMIN_LOGSTIC_COMFIRM, {order_ids:[orderId]});
      if (response.success) {
        // Refresh the logistics data to update the status
        const { data, success } = await api.get<ApiResponse<LogisticsOrder[]>>(API_ADMIN_LOGSTICS);
        if (success && data) {
          setLogisticsData(data);
        }
      } else {
        setError((response as any).message || 'Failed to confirm order');
      }
    } catch (err) {
      console.error('Error confirming order:', err);
      setError('Failed to confirm order');
    } finally {
      setConfirmingOrderId(null);
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

  const handlePrintLabel = async (orderId: number) => {
    setPrintingLabelOrderId(orderId);
    try {
      const response = await api.get<ApiResponse>(API_ADMIN_LOGSTIC_DETAIL_PRINT_LABEL(orderId));
      if (response.success && response.data) {
        // Open the label URL in a new window
        const labelUrl = response.data.label_url;
        if (labelUrl) {
          window.open(labelUrl, '_blank');
        }
      } else {
        setError(response.data?.message || 'Failed to print label');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to print label');
    } finally {
      setPrintingLabelOrderId(null);
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

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  return (
    <>
      <Head>
        <title>Logistics Management - Admin</title>
        <meta name="description" content="Manage logistics orders, create 4PX shipments, confirm orders, and print shipping labels" />
      </Head>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Logistics Management</h1>
      
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Logistics Activity</h2>
          
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {loading ? (
          <div className="bg-white p-4 rounded border border-gray-200">
            <p className="text-gray-500 text-center py-8">Loading logistics data...</p>
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
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logistics Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logisticsData.map((item) => {
                  const {
                    id,
                    order_number,
                    status,
                    logistics_status,
                    logistics_request_no,
                    has_logistics,
                    can_create_logistics,
                    created_at
                  } = item;

                  const isConfirmed = status === 'confirmed' || status === 'completed';
                  const hasLogisticsRequest = !!logistics_request_no;
                  const isConfirming = confirmingOrderId === id;
                  const isCreating = creatingOrderId === id;
                  const isPrintingLabel = printingLabelOrderId === id;
                  const isSelected = selectedOrderIds.includes(id);

                  const statusBadgeColor = 
                    status === 'completed' ? 'bg-green-100 text-green-800' :
                    status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800';

                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <span>{order_number}</span>
                          {!isConfirmed && (
                            <button
                              onClick={() => handleConfirmOrder(id)}
                              disabled={isConfirming || hasLogisticsRequest}
                              className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                            >
                              {isConfirming ? '确认中...' : !has_logistics ? '确认订单' : '已确认'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex gap-2">
                          {logistics_request_no && (
                            <button
                              onClick={() => handlePrintLabel(id)}
                              disabled={isPrintingLabel}
                              className="px-3 py-1 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors"
                            >
                              {isPrintingLabel ? '打印中...' : '打印面单'}
                            </button>
                          )}
                          {logistics_request_no && (
                            <button
                              onClick={() => handleCreate4PXOrder(id)}
                              disabled={isCreating}
                              className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                            >
                              {isCreating ? 'Creating...' : 'Create 4PX Order'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div>
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${statusBadgeColor}`}>
                              {status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {logistics_status || 'Not created'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
    </>
  );
};

export default LogisticsPage;