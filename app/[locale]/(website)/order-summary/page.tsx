"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrderDetailResponse } from '../checkout/components/types';
import useUserStore from '@/stores/userStore';
import api from '@/utils/api';
import { ApiResponse } from '@/types/api';
import { API_ORDER_PROGRESS, API_ORDER_UPDATE_MESSAGE } from '@/constants/api';
import OrderSummaryPrices from '../components/component/OrderSummaryPrices';
import StepIndicator from './components/StepIndicator';
import OrderSummaryDelivery from '../components/component/OrderSummaryDelivery';
import CartItemCard from '../shopping-cart/components/CartItemCard';
import MessageModal from './components/MessageModal';
import Loading from '../components/Loading';

const OrderSummary: React.FC = () => {
  const {fetchOrderDetail} = useUserStore();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [orderDetail, setOrderDetail] = useState<OrderDetailResponse>();
  const [isLoading, setIsLoading] = useState(true);

  const getOrderProgress = async(orderId:string) => {
    if (orderId) {
      const {} = await api.get<ApiResponse>(API_ORDER_PROGRESS + '/' + orderId);
    }
  }

  useEffect(()=>{
    const fetchSummaryOrder = async(orderId:string) => {
      try {
        const {data,code,message,success} = await fetchOrderDetail(orderId);
        if (success) {
          setOrderDetail(data);
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (orderId) {
      fetchSummaryOrder(orderId);
      getOrderProgress(orderId);
    }
  },[])


  const [showMessageModal, setShowMessageModal] = useState(false);
  const handleClickEditMessage = () => {
    setShowMessageModal(true);
  }
  const handleMessageSubmit = async(updateMessage:string) => {
    const {message, success, code, data} = await api.put<ApiResponse>(`${API_ORDER_UPDATE_MESSAGE}/${orderDetail?.order.id}`,{message:updateMessage});
    if (success) {
      setShowMessageModal(false);
    } else {
      alert(message);
    }
  }

  // 计算费用小结
  const discount = 0;   // 如果有优惠就填入相应数值

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">

      {showMessageModal && <MessageModal handleClose={()=>setShowMessageModal(false)} handleMessageSubmit={handleMessageSubmit}/>}
      {/* 容器 */}
      <div className="max-w-5xl mx-auto p-6">
        {/* 标题与提示 */}
        <div className="mb-4">
          <h1 className="text-2xl mb-2">
            🎉 Your book is being carefully prepared!
          </h1>
          <p className="text-gray-600">
            We will reach out within 48 hours to finalize your book&apos;s design! Keep an eye on your email ✨
          </p>
        </div>

        {/* 订单号和预计送达 */}
        <div className="flex items-center space-x-8 mb-4">
          <span className="text-gray-500">{orderDetail?.order?.order_number}</span>
          <span className="text-gray-500">预计到达时间: 04/12/2024</span>
        </div>


        {/* 进度状态指示 */}
        <StepIndicator />

        {/* 订单列表 */}
        <div className="space-y-4 mb-6">
          {orderDetail?.order?.items.map((item) => (
            <CartItemCard key={item.id} item={item} handleClickEditMessage={handleClickEditMessage} />
          ))}
        </div>

        {/* 费用小结 & 收货信息 */}
        <div className="grid gap-4 mb-6 bg-white p-4">
          {orderDetail &&
            <>
            <OrderSummaryDelivery orderDetail={orderDetail.order} />
            <OrderSummaryPrices orderDetail={orderDetail} />
            </>
          }
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
          >
            Download Invoice
          </button>
          <button
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Buy the Same
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderSummary;
