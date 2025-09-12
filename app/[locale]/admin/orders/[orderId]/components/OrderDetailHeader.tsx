'use client';

import { FC } from 'react';
import { OrderDetail } from '../../../../(website)/checkout/components/types';
import { formatDate } from '../../utils';

interface OrderDetailHeaderProps {
  order: OrderDetail;
  onBack: () => void;
  statusColors: Record<string, string>;
  paymentStatusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  paymentStatusLabels: Record<string, string>;
  onStatusUpdate: (status: string) => void;
  onPaymentStatusUpdate: (paymentStatus: string) => void;
}

const OrderDetailHeader: FC<OrderDetailHeaderProps> = ({
  order,
  onBack,
  statusColors,
  paymentStatusColors,
  statusLabels,
  paymentStatusLabels,
  onStatusUpdate,
  onPaymentStatusUpdate,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回订单列表
          </button>
          
          <div className="border-l border-gray-300 pl-4">
            <h1 className="text-xl font-medium text-gray-900">
              订单详情 #{order.order_number}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>创建时间：{formatDate(order.created_at)}</span>
              <span>更新时间：{formatDate(order.updated_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Order Status Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">订单状态：</span>
            <select
              value={order.status}
              onChange={(e) => onStatusUpdate(e.target.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${statusColors[order.status]}`}
            >
              <option value="pending">未付款</option>
              <option value="ai_processing">AI生成中</option>
              <option value="preparing">人工审核中</option>
              <option value="printing">印刷中</option>
              <option value="shipped">运输中</option>
              <option value="delivered">已完成</option>
              <option value="cancelled">已取消</option>
              <option value="refunded">已退款</option>
            </select>
          </div>

          {/* Payment Status Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">支付状态：</span>
            <select
              value={order.payment_status}
              onChange={(e) => onPaymentStatusUpdate(e.target.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${paymentStatusColors[order.payment_status]}`}
            >
              <option value="unpaid">支付失败</option>
              <option value="paid">已支付</option>
              <option value="refunded">已退款</option>
              <option value="partial_refund">部分退款</option>
            </select>
          </div>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            导出订单
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailHeader;