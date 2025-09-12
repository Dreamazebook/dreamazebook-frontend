'use client';

import { FC, useState } from 'react';
import { OrderDetail } from '../../../../(website)/checkout/components/types';

interface OrderActionsProps {
  order: OrderDetail;
  onRefresh: () => void;
}

const OrderActions: FC<OrderActionsProps> = ({ order, onRefresh }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePrintInvoice = () => {
    // Implement print invoice functionality
    window.print();
  };

  const handleSendEmail = async () => {
    setIsProcessing(true);
    try {
      // Implement send email functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('邮件发送成功');
    } catch (error) {
      alert('邮件发送失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = async () => {
    if (!confirm('确定要退款吗？此操作不可撤销。')) return;
    
    setIsProcessing(true);
    try {
      // Implement refund functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('退款处理成功');
      onRefresh();
    } catch (error) {
      alert('退款处理失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const canRefund = order.payment_status === 'paid' && !['cancelled', 'refunded'].includes(order.status);
  const canCancel = !['completed', 'cancelled', 'refunded'].includes(order.status);

  return (
    <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">订单操作</h3>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新数据
        </button>

        <button
          onClick={handlePrintInvoice}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          打印发票
        </button>

        <button
          onClick={handleSendEmail}
          disabled={isProcessing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {isProcessing ? '发送中...' : '发送邮件'}
        </button>

        {canRefund && (
          <button
            onClick={handleRefund}
            disabled={isProcessing}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
            </svg>
            {isProcessing ? '处理中...' : '申请退款'}
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => {
              if (confirm('确定要取消此订单吗？')) {
                // Implement cancel order functionality
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            取消订单
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderActions;