"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { OrderDetailResponse } from '../checkout/components/types';
import { ApiResponse } from '@/types/api';
import { API_ORDER_DETAIL } from '@/constants/api';
import useUserStore from '@/stores/userStore';

interface OrderItem {
  id: number;
  title: string;
  subTitle: string;
  price: number;
  imageUrl: string;
}

const OrderSummary: React.FC = () => {
  const {fetchOrderDetail} = useUserStore();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [orderDetail, setOrderDetail] = useState<OrderDetailResponse >();

  useEffect(()=>{
    const fetchSummaryOrder = async(orderId:string) => {
      const {data,code,message,success} = await fetchOrderDetail(orderId);
      if (success) {
        setOrderDetail(data);
      }
    }
    if (orderId) {
      fetchSummaryOrder(orderId);
    }
  },[])
  // 模拟订单条目数据
  const orderItems: OrderItem[] = [
    {
      id: 1,
      title: 'Book name | illy child',
      subTitle: 'Premium gift box',
      price: 19.99,
      imageUrl: '/book.png',
    },
    {
      id: 2,
      title: 'Book name | illy child',
      subTitle: 'Premium gift box',
      price: 19.99,
      imageUrl: '/book.png',
    },
    {
      id: 3,
      title: 'Book name | illy child',
      subTitle: 'Premium gift box',
      price: 19.99,
      imageUrl: '/book.png',
    },
    {
      id: 4,
      title: 'Book name | illy child',
      subTitle: 'Premium gift box',
      price: 19.99,
      imageUrl: '/book.png',
    },
  ];

  // 计算费用小结
  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const shippingFee = 5; // 假设运费固定 5 USD
  const discount = 0;   // 如果有优惠就填入相应数值
  const total = subtotal + shippingFee - discount;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
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
          <span className="text-gray-500">#249334545652</span>
          <span className="text-gray-500">预计到达时间: 04/12/2024</span>
        </div>


        {/* 进度状态指示 */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-xs mt-1 text-blue-500">place order</span>
          </div>
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-xs mt-1 text-blue-500">confirm the effect</span>
          </div>
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-xs mt-1 text-blue-500">print</span>
          </div>
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-xs mt-1 text-blue-500">transport</span>
          </div>
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-xs mt-1 text-blue-500">receive books</span>
          </div>
        </div>

        {/* 订单列表 */}
        <div className="space-y-4 mb-6">
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center bg-white rounded p-4"
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={80}          // 对应 className w-20 (20 * 4 = 80 px)
                height={80}         // 对应 className h-20
                className="object-cover rounded mr-4"
              />
              <div className="flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-gray-500 text-sm">{item.subTitle}</p>
              </div>
              <div className="text-gray-800">${item.price.toFixed(2)} USD</div>
            </div>
          ))}
        </div>

        {/* 费用小结 & 收货信息 */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
          {/* 左侧：费用小结 */}
          <div className="bg-gray-100 p-4 rounded md:w-1/2 md:mr-4 mb-4 md:mb-0">
            <h2 className="font-bold text-lg mb-2">Order Summary</h2>
            <div className="flex justify-between py-1">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Shipping</span>
              <span>${shippingFee.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between py-1">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* 右侧：收货地址 & 预计送达 */}
          <div className="md:w-1/2 flex flex-col justify-between">
            <div className="border p-4 rounded mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Shipping Address</h3>
              <p className="text-gray-600">Wuhou District, Chengdu City, Sichuan Province, China</p>
            </div>
            <div className="border p-4 rounded">
              <h3 className="font-semibold text-gray-700 mb-2">Delivery Date</h3>
              <p className="text-gray-600">04/12/2024</p>
            </div>
          </div>
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
