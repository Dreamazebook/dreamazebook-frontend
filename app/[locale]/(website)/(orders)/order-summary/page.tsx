"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { EMPTY_CART_ITEM, formatDate, OrderDetail } from "@/types/order";
import useUserStore from "@/stores/userStore";
import api from "@/utils/api";
import { ApiResponse } from "@/types/api";
import {
  API_ORDER_PROGRESS,
  API_ORDER_STRIPE_PAID,
  API_ORDER_UPDATE_MESSAGE,
} from "@/constants/api";
import OrderSummaryPrices from "../../components/component/OrderSummaryPrices";
import StepIndicator from "./components/StepIndicator";
import OrderSummaryDelivery from "../../components/component/OrderSummaryDelivery";
import CartItemCard from "../shopping-cart/components/CartItemCard";
import MessageModal from "./components/MessageModal";
import Image from "next/image";
import { CartItem } from "@/types/cart";
import OrderStatusLabel from "../../components/component/OrderStatusLabel";

const OrderSummary: React.FC = () => {
  const t = useTranslations("orderSummary");
  const { fetchOrderDetail } = useUserStore();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orderDetail, setOrderDetail] = useState<OrderDetail>();
  const [isLoading, setIsLoading] = useState(true);

  const getOrderProgress = async (orderId: string) => {
    if (orderId) {
      const {} = await api.get<ApiResponse>(API_ORDER_PROGRESS(orderId));
    }
  };

  const confirmOrderPayment = async (orderDetail: OrderDetail) => {
    const { data, code, message, success } = await api.post<ApiResponse>(
      `${API_ORDER_STRIPE_PAID}`,
      {
        order_id: orderId,
        payment_intent_id: orderDetail.stripe_payment_intent_id,
      }
    );
  };

  useEffect(() => {
    const fetchSummaryOrder = async (orderId: string) => {
      try {
        const { data, code, message, success } = await fetchOrderDetail(
          orderId
        );
        if (success) {
          setOrderDetail(data);
          if (data) {
            confirmOrderPayment(data);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (orderId) {
      fetchSummaryOrder(orderId);
      getOrderProgress(orderId);
    }
  }, []);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copyOrderNumberToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(orderDetail?.order_number || "");
      alert("Order number copied!");
    } catch (err) {
      console.error("Failed to copy order number:", err);
    }
  };
  const handleClickEditMessage = (orderItem: any) => {
    setSelectedItem(orderItem);
    setShowMessageModal(true);
  };
  const handleMessageSubmit = async (updateMessage: string) => {
    setIsSubmitting(true);
    try {
      const { message, success, code, data } = await api.put<ApiResponse>(
        `${API_ORDER_UPDATE_MESSAGE}/${orderDetail?.id}`,
        { message: updateMessage, item_id: selectedItem?.id }
      );
      if (success) {
        setShowMessageModal(false);
        setSelectedItem(null);
      } else {
        alert(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 计算费用小结
  const discount = 0; // 如果有优惠就填入相应数值

  if (!(orderId || orderDetail)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <p className="text-red-500 text-lg">{t("noOrderIdError")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 animate-pulse">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* 标题与提示 */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>

          {/* 订单号和预计送达 */}
          <div className="flex space-x-8">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>

          {/* 进度状态指示 */}
          <div className="h-12 bg-gray-200 rounded"></div>

          {/* 订单列表 */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>

          {/* 费用小结 & 收货信息 */}
          <div className="space-y-4 bg-white p-4">
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-4">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {showMessageModal && selectedItem && (
        <MessageModal
          isSubmitting={isSubmitting}
          message={selectedItem.message || ""}
          handleClose={() => setShowMessageModal(false)}
          handleMessageSubmit={handleMessageSubmit}
        />
      )}
      {/* 容器 */}
      <div className="max-w-[1200px] mx-auto">
        {/* 标题与提示 */}
        <div className="mb-4">
          <h1 className="text-[18px] md:text-[28px] flex items-center gap-[4px] mb-2">
            🎉 {t("preparationTitle")}
            {orderDetail && <div className="hidden md:block"><OrderStatusLabel status={orderDetail?.status} /></div>}
          </h1>
          {/* <p className="text-gray-600">{t("preparationSubtitle")} ✨</p> */}
        </div>

        {/* 订单号和预计送达 */}
        <div className="flex items-center flex-wrap space-x-8 mb-4">
          <span className="text-[#222222] flex items-center gap-1">
            <span>#{orderDetail?.order_number}</span>
            <Image
              src="/order-summary/copy.svg"
              width={24}
              height={24}
              alt="clipboard"
              className="cursor-pointer"
              onClick={copyOrderNumberToClipboard}
            />
          </span>
          <span className="text-gray-500">{t("estimatedDelivery")}: </span>
        </div>

        {/* 进度状态指示 */}
        {/* {orderDetail && <StepIndicator orderDetail={orderDetail} />} */}

        {/* 订单列表 */}
        <div className="space-y-4 mb-6">
          {orderDetail?.items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              handleClickEditMessage={handleClickEditMessage}
            />
          ))}
        </div>

        {/* 费用小结 & 收货信息 */}
        <div className="grid gap-4 mb-6 bg-white py-[16px] px-[24px]">
          {orderDetail && (
            <>
              <OrderSummaryDelivery orderDetail={orderDetail} />
              <OrderSummaryPrices orderDetail={orderDetail} />
            </>
          )}
        </div>

        {orderDetail?.stripe_payment_intent_data && 
        <div className="bg-white py-[16px] px-[24px] rounded mt-[16px] text-[16px] text-[#666666]">
          <div className="flex justify-between items-center">
            <span className="">Payment Method</span>
            <span className="">{orderDetail?.payment_method}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="">Payment Date</span>
            <span className="">{formatDate(orderDetail?.stripe_payment_intent_data?.updated_at)}</span>
          </div>
        </div>
        }

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-4 mt-[16px]">
          <button className="text-[#222] py-2 border border-[#222] px-4 rounded hover:bg-gray-300">
            {t("actions.downloadInvoice")}
          </button>
          <button className="bg-[#222] text-white py-2 px-4 rounded hover:opacity-70 cursor-pointer">
            {t("actions.buySame")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
