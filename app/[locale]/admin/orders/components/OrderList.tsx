'use client';

import { FC } from 'react';
import { formatCurrency, formatDate } from '../utils';
import { OrderDetail } from '@/app/[locale]/(website)/checkout/components/types';

interface OrderListProps {
  orders: OrderDetail[];
  onViewDetails: (order: OrderDetail) => void;
  statusColors: Record<string, string>;
  paymentStatusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  paymentStatusLabels: Record<string, string>;
}

const OrderList: FC<OrderListProps> = ({
  orders,
  onViewDetails,
  statusColors,
  paymentStatusColors,
  statusLabels,
  paymentStatusLabels,
}) => {
  return (
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
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.shipping_address.firstName}</div>
                  <div className="text-sm text-gray-500">{order.shipping_address.lastName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">{formatCurrency(order.total_amount)}</div>
                  <div className="text-xs text-gray-500">{order.items.length} 件商品</div>
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
                    onClick={() => onViewDetails(order)}
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
  );
};

export default OrderList;