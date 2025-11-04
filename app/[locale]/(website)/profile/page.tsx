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

        {orderList === undefined ? (
          // Loading skeleton
          <div className="border rounded-lg p-3 md:p-4 animate-pulse">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center mb-5 gap-2">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
            </div>
            
            {/* Delivery info skeleton */}
            <div className="mb-4">
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            </div>
            
            {/* Order items skeleton */}
            <div className="space-y-3">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t gap-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="h-10 w-32 bg-gray-200 rounded"></div>
                <div className="h-10 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : orderList.length > 0 ? (
          <LatestOrderHistory orderDetail={orderList[0]} />
        ) : (
          // No orders state
          <div className="border rounded-lg p-6 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Orders</h3>
              <p className="text-gray-500 mb-6">Start your journey by exploring our amazing collection of books.</p>
              <Link 
                href="/books"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Books
                <svg className="ml-2 -mr-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Loyalty Section */}
      {/* <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
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
      </div> */}
    </div>
  );
}