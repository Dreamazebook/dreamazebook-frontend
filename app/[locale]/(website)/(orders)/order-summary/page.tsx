"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ORDER_SUMMARY_URL } from "@/constants/links";

/**
 * Redirect legacy ?orderId=X queries to the new /order-summary/[orderId] route.
 */
export default function OrderSummaryRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (orderId) {
      router.replace(ORDER_SUMMARY_URL(Number(orderId)));
    }
  }, [orderId, router]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <p className="text-red-500 text-lg">No order ID provided</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}
