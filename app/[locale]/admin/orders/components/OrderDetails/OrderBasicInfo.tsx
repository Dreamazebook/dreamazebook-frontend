'use client';

import { formatDate, OrderDetail } from '@/app/[locale]/(website)/checkout/components/types';

interface OrderBasicInfoProps {
  order: OrderDetail;
  statusColors: Record<string, string>;
  paymentStatusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  paymentStatusLabels: Record<string, string>;
}

export default function OrderBasicInfo({
  order,
  statusColors,
  paymentStatusColors,
  statusLabels,
  paymentStatusLabels,
}: OrderBasicInfoProps) {
  return (
    <div className="border-t border-gray-200 py-4 mb-6">
      <h4 className="text-md font-medium text-gray-900 mb-3">基本信息</h4>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">订单号</dt>
          <dd className="mt-1 text-sm text-gray-900">{order.order_number}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">订单日期</dt>
          <dd className="mt-1 text-sm text-gray-900">{formatDate(order.created_at)}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">用户ID</dt>
          <dd className="mt-1 text-sm text-gray-900">{order.user_id}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">支付方式</dt>
          <dd className="mt-1 text-sm text-gray-900">{order.payment_method || '未设置'}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">订单状态</dt>
          <dd className="mt-1">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">支付状态</dt>
          <dd className="mt-1">
            <select
              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusColors[order.payment_status]}`}
              value={order.payment_status}
              onChange={(e) => {
                // TODO: Add logic to update payment status
              }}
            >
              <option value="pending">{paymentStatusLabels['pending'] || 'pending'}</option>
              <option value="paid">{paymentStatusLabels['paid'] || 'paid'}</option>
              <option value="failed">{paymentStatusLabels['failed'] || 'failed'}</option>
              <option value="refunded">{paymentStatusLabels['refunded'] || 'refunded'}</option>
              <option value="partial_refund">{paymentStatusLabels['partial_refund'] || 'partial_refund'}</option>
            </select>
          </dd>
        </div>
        {order.payment_id && (
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">支付ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{order.payment_id}</dd>
          </div>
        )}
        {order.stripe_payment_intent_id && (
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Stripe Payment Intent</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{order.stripe_payment_intent_id}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}