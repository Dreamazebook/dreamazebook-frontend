"use client";

import useUserStore from "@/stores/userStore";
import { Link } from "@/i18n/routing";
import { useEffect } from "react";
import DisplayPrice from "../components/component/DisplayPrice";
import { formatAddress } from "@/types/address";

// Profile Page Component
export default function ProfilePage() {
  const {orderList, fetchOrderList} = useUserStore();
  useEffect(()=>{
    fetchOrderList();
  },[]);
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Order History Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-medium text-gray-900">📋 Order History</h2>
          <div className="flex items-center text-gray-600">
            <Link href={'/profile/order-history'}>More</Link>
            
          </div>
        </div>

        {orderList.length > 0 && [orderList[0]]?.map(({order_number,status,shipping_address,total_amount,items,updated_at}) => (
        <div key={order_number} className="border rounded-lg p-3 md:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
            <span className="text-base md:text-lg font-medium text-gray-900">{order_number}</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium w-fit capitalize">
              {status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
            <div className="space-y-1">
              <div><span className="font-medium">Ship to</span> {formatAddress(shipping_address)}</div>
              <div><span className="font-medium">Order date</span> {updated_at}</div>
              {/* <div><span className="font-medium">Qty</span> 1</div> */}
            </div>
            <div>
              <div><span className="font-medium">Delivery date</span> </div>
            </div>
          </div>

          <div className="space-y-3">
            
            {items.map(({total_price,id})=>(
            <div key={id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">Book name | lily child</div>
                  <div className="text-sm text-gray-600">Premium Jumbo Hardcover | a festive gift box</div>
                  <div className="text-sm text-gray-500">特殊分类已过期，正在寻找新的选择</div>
                </div>
              </div>
              <DisplayPrice style='font-medium text-gray-900 text-right sm:text-left' value={total_price} />
            </div>
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
        ))}
      </div>

      {/* Loyalty Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-medium text-gray-900">🎯 Loyalty</h2>
          <div className="flex items-center text-gray-600">
            <span className="mr-2 text-sm md:text-base">More</span>
          </div>
        </div>

        <div className="bg-gray-200 rounded-lg p-4">
          <div className="h-24 md:h-32 bg-gray-300 rounded mb-4"></div>
          
          <h3 className="font-medium text-gray-900 mb-2">Where Are You? Save the Multiverse!</h3>
          <p className="text-sm text-gray-600 mb-4">A search-and-find adventure for 1-3 kids</p>
          
          <button className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 w-full sm:w-auto">
            Invite friends
          </button>
        </div>
      </div>
    </div>
  );
}