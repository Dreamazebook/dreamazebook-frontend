import { useEffect, useState } from 'react';
import useUserStore from '@/stores/userStore';
import { statusLabelMap } from '@/types/order';

/**
 * Custom hook to get order status label and color
 * @param status - The order status string
 * @returns Object containing orderStatus, color classes, and loading state
 */
export const useOrderStatus = (status: string) => {
  const { orderStatusMapping, fetchOrderStatus } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch order status mapping if not available
    if (!orderStatusMapping) {
      setIsLoading(true);
      fetchOrderStatus();
      setIsLoading(false);
    }
  }, [orderStatusMapping, fetchOrderStatus]);

  // Get the mapped order status
  const orderStatus = orderStatusMapping?.[status] || status;

  // Get status color classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-[#296849] bg-[#E7EDDE]";
      case "preparing":
        return "text-[#AC7B00] bg-[#FFEDC8]";
      case "processing":
        return "text-[#AC7B00] bg-[#FFEDC8]";
      case "shipping":
        return "text-[#1963C3] bg-[#E2EEFF]";
      case "delivered":
        return "text-[#666666] bg-[#F0F0F0]";
      case "cancelled":
        return "text-[#CF0F02] bg-[#FCF2F2]";
      default:
        return "text-gray-500";
    }
  };

  const colorClasses = getStatusColor(orderStatus);
  const statusLabel = statusLabelMap[orderStatus] || status;

  return {
    orderStatus,
    colorClasses,
    statusLabel,
    isLoading: isLoading || !orderStatusMapping
  };
};

export default useOrderStatus;