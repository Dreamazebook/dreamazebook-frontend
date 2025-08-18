"use client";

import { formatAddress } from "@/types/address";
import { OrderDetail } from "../../checkout/components/types";
import DisplayPrice from "../../components/component/DisplayPrice";
import OrderItem from "../../components/component/OrderItem";
import { formatDate } from "@/app/[locale]/admin/orders/utils";

export default function LatestOrderHistory({ orderDetail }:{orderDetail:OrderDetail}) {
  const {order_number,status,shipping_address,total_amount,items,updated_at} = orderDetail;

  return (
    <div key={order_number} className="border rounded-lg p-3 md:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center mb-3 gap-2">
        <span className="text-base md:text-lg font-medium text-gray-900">{order_number}</span>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium w-fit capitalize">
          {status}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#222] mb-4 bg-[#F8F8F8] p-3">
        <div className="space-y-3">
          <div><span className="font-medium text-[#999] mr-4">Ship to</span> {formatAddress(shipping_address)}</div>
          <div><span className="font-medium text-[#999] mr-4">Order date</span> {formatDate(updated_at)}</div>
          {/* <div><span className="font-medium text-[#999] mr-4">Qty</span> 1</div> */}
        </div>
        <div>
          <div><span className="font-medium text-[#999] mr-4">Delivery date</span> </div>
        </div>
      </div>

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