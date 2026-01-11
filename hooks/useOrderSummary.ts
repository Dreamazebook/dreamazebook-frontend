import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { API_CART_CALCULATE_COST } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { CalculatedCost } from '@/types/order-summary';

interface UseOrderSummaryProps {
  selectedItems: number[];
}

export const useOrderSummary = ({ selectedItems }: UseOrderSummaryProps) => {
  const [calculatedCost, setCalculatedCost] = useState<CalculatedCost | null>(null);
  const [calculatingCost, setCalculatingCost] = useState(false);

  const calculateCost = async () => {
    if (selectedItems.length === 0) {
      setCalculatedCost(null);
      return;
    }

    setCalculatingCost(true);
    try {
      const { data, success, message } = await api.post<ApiResponse<CalculatedCost>>(
        API_CART_CALCULATE_COST,
        { cart_item_ids: selectedItems }
      );

      if (success && data) {
        setCalculatedCost(data);
      } else {
        alert(message);
      }
    } catch (err: any) {
      alert(err.toString());
      setCalculatedCost(null);
    } finally {
      setCalculatingCost(false);
    }
  };

  useEffect(() => {
    calculateCost();
  }, [selectedItems]);

  // Extract values from calculated cost or provide defaults
  const subtotal = calculatedCost?.original_subtotal || 0;
  const shipping = calculatedCost?.shipping ?? 0;
  const discountInfo = calculatedCost?.discount;
  const discountAmount = discountInfo?.applicable ? (discountInfo.amount || 0) : 0;
  const total = calculatedCost?.total_amount || 0;

  return {
    calculatingCost,
    subtotal,
    shipping,
    discountInfo,
    discountAmount,
    total,
    calculateCost,
    itemsCount: calculatedCost?.items_count || 0,
  };
};