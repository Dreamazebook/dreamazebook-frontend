"use client";

import useUserStore from "@/stores/userStore";
import { Link } from "@/i18n/routing";
import { useEffect } from "react";
import DisplayPrice from "../components/component/DisplayPrice";
import { formatAddress } from "@/types/address";
import LatestOrderHistory from "./components/LatestOrderHistory";

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

        {
          orderList?.length > 0 && <LatestOrderHistory orderDetail={orderList[0]} />
        }
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