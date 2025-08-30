'use client';

import { FC, useEffect, useState } from 'react';
import useUserStore from "@/stores/userStore";
import OrderBasicInfo from "./OrderDetails/OrderBasicInfo";
import OrderItemsList from "./OrderDetails/OrderItemsList";
import OrderAddressInfo from "./OrderDetails/OrderAddressInfo";
import OrderShippingInfo from "./OrderDetails/OrderShippingInfo";
import OrderPaymentInfo from "./OrderDetails/OrderPaymentInfo";
import OrderTimeline from "./OrderDetails/OrderTimeline";
import { OrderDetail } from '@/app/[locale]/(website)/checkout/components/types';
import api from '@/utils/api';
import { API_ADMIN_ORDERS } from '@/constants/api';
import { ApiResponse } from '@/types/api';

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
        const {data,code,success} = await api.get<ApiResponse>(`${API_ADMIN_ORDERS}/${orderDetail.id}`);
        if (success && data) {
          setOrder(data);
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
                
                <OrderBasicInfo order={order} statusColors={statusColors} paymentStatusColors={paymentStatusColors} statusLabels={statusLabels} paymentStatusLabels={paymentStatusLabels} />

                <OrderItemsList items={order.items} />

                <OrderAddressInfo order={order} />

                <OrderShippingInfo order={order} />

                <OrderPaymentInfo order={order} />


                <OrderTimeline order={order} />

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