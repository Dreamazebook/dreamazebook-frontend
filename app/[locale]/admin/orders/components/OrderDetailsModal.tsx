'use client';

import { FC, useEffect, useState } from 'react';
import useUserStore from "@/stores/userStore";
import { formatDate, formatCurrency } from '../utils';
import { OrderDetail } from '@/app/[locale]/(website)/checkout/components/types';
import DisplayPrice from '@/app/[locale]/(website)/components/component/DisplayPrice';
import { formatAddress } from '@/types/address';
import Image from 'next/image';

interface OrderDetailsModalProps {
  orderDetail: OrderDetail;
  onClose: () => void;
  statusColors: Record<string, string>;
  paymentStatusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  paymentStatusLabels: Record<string, string>;
}

const OrderDetailsModal: FC<OrderDetailsModalProps> = ({
  orderDetail,
  onClose,
  statusColors,
  paymentStatusColors,
  statusLabels,
  paymentStatusLabels,
}) => {
  const { fetchOrderDetail } = useUserStore();
  const [order, setOrder] = useState<OrderDetail>(orderDetail);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrderDetail = async () => {
      try {
        const { data,success } = await fetchOrderDetail(orderDetail.id.toString());
        if (success && data) {
          setOrder(data?.order);
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderDetail();
  }, [orderDetail, fetchOrderDetail]);
  if (isLoading) {
    return (
      <div className="fixed inset-0 overflow-y-auto z-50 bg-black/60">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-600">加载中...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 overflow-y-auto z-50 bg-black/60">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-600">订单详情加载失败</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 bg-black/60">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  订单详情
                </h3>
                
                {/* 基本订单信息 */}
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusColors[order.payment_status]}`}>
                          {paymentStatusLabels[order.payment_status] || order.payment_status}
                        </span>
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

                {/* 订单商品 */}
                <div className="border-t border-gray-200 py-4 mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">订单商品</h4>
                  <div className="space-y-3">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-16 h-20 flex-shrink-0 rounded overflow-hidden">
                          <Image
                            src={item.picbook_cover}
                            alt={item.picbook_name}
                            width={64}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.picbook_name}</h5>
                          <p className="text-sm text-gray-600">{item.name}</p>
                          {item.format && <p className="text-sm text-gray-500">格式: {item.format}</p>}
                          {item.box && <p className="text-sm text-gray-500">包装: {item.box}</p>}
                          <p className="text-sm text-gray-500">数量: {item.quantity}</p>
                          {item.message && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">留言:</span> {item.message}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <DisplayPrice value={item.price} style="text-sm font-medium" />
                          <p className="text-xs text-gray-500">单价</p>
                          <DisplayPrice value={item.total_price} style="text-sm font-bold" />
                          <p className="text-xs text-gray-500">小计</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 收货地址 */}
                {order.shipping_address && (
                  <div className="border-t border-gray-200 py-4 mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">收货地址</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-900">
                        {order.shipping_address.first_name} {order.shipping_address.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{order.shipping_address.email}</p>
                      <p className="text-sm text-gray-600">{order.shipping_address.phone}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatAddress(order.shipping_address)}
                      </p>
                    </div>
                  </div>
                )}

                {/* 账单地址 */}
                {order.billing_address && order.billing_address.street !== order.shipping_address?.street && (
                  <div className="border-t border-gray-200 py-4 mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">账单地址</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-900">
                        {order.billing_address.first_name} {order.billing_address.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{order.billing_address.email}</p>
                      <p className="text-sm text-gray-600">{order.billing_address.phone}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatAddress(order.billing_address)}
                      </p>
                    </div>
                  </div>
                )}

                {/* 配送信息 */}
                <div className="border-t border-gray-200 py-4 mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">配送信息</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">配送方式</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.shipping_method || '未设置'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">配送费用</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <DisplayPrice value={order.shipping_cost} />
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* 费用明细 */}
                <div className="border-t border-gray-200 py-4 mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">费用明细</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">商品小计</dt>
                      <dd className="text-sm text-gray-900">
                        <DisplayPrice value={order.total_amount - order.shipping_cost - order.tax_amount + order.discount_amount} />
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">配送费用</dt>
                      <dd className="text-sm text-gray-900">
                        <DisplayPrice value={order.shipping_cost} />
                      </dd>
                    </div>
                    {order.tax_amount > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">税费</dt>
                        <dd className="text-sm text-gray-900">
                          <DisplayPrice value={order.tax_amount} />
                        </dd>
                      </div>
                    )}
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <dt className="text-sm">折扣</dt>
                        <dd className="text-sm">
                          -<DisplayPrice value={order.discount_amount} />
                        </dd>
                      </div>
                    )}
                    {order.coupon_code && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">优惠券</dt>
                        <dd className="text-sm text-gray-900">{order.coupon_code}</dd>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <dt className="text-sm font-medium text-gray-500">总金额</dt>
                      <dd className="text-sm text-gray-900 font-bold">
                        <DisplayPrice value={order.total_amount} />
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* 重要日期 */}
                <div className="border-t border-gray-200 py-4 mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">重要日期</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">创建时间</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(order.created_at)}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">更新时间</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(order.updated_at)}</dd>
                    </div>
                    {order.paid_at && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">支付时间</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(order.paid_at)}</dd>
                      </div>
                    )}
                    {order.completed_at && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">完成时间</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(order.completed_at)}</dd>
                      </div>
                    )}
                    {order.cancelled_at && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">取消时间</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(order.cancelled_at)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* 备注信息 */}
                {order.notes && (
                  <div className="border-t border-gray-200 py-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">备注</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-900">{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => {
                // 这里可以添加编辑订单的逻辑
                console.log('Edit order:', order.id);
              }}
            >
              编辑订单
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;