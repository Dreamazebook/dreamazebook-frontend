"use client";

import { Link } from "@/i18n/routing";
import { OrderDetail } from "../../checkout/components/types";
import DisplayPrice from "../../components/component/DisplayPrice";
import OrderItem from "../../components/component/OrderItem";
import OrderStatusLabel from "../../components/component/OrderStatusLabel";
import OrderSummaryDelivery from "../../components/component/OrderSummaryDelivery";

export default function LatestOrderHistory({ orderDetail }:{orderDetail:OrderDetail}) {
  const {order_number,status,shipping_address,total_amount,items,updated_at} = orderDetail;

  return (
    <div key={order_number} className="border rounded-lg p-3 md:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center mb-5 gap-2">
        <Link href={`/${orderDetail.payment_status === 'paid' ? 'order-summary' : 'checkout'}?orderId=${orderDetail.id}`} className="text-base md:text-lg font-medium text-gray-900">#{order_number}</Link>
        <OrderStatusLabel status={status} />
      </div>
      
      <OrderSummaryDelivery orderDetail={orderDetail} />

      <div className="space-y-3">
        
        {items.map((item)=>(
        <OrderItem key={item.id} orderItem={item} />
        ))}
        
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t gap-4">
        <div>
          Total <DisplayPrice value={total_amount} style="text-base md:text-lg font-medium text-gray-900"/>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
            Download Invoice
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800">
            Buy the Same
          </button>
        </div>
      </div>
    </div>
  );
}