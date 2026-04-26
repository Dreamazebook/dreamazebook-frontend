import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { API_CART_CALCULATE_COST } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { CalculatedCost } from '@/types/order-summary';
import { CartItem } from '@/types/cart';

interface UseOrderSummaryProps {
  selectedItems: number[];
  onCartItemsUpdate?: (items: CartItem[]) => void;
}

export const useOrderSummary = ({ selectedItems, onCartItemsUpdate }: UseOrderSummaryProps) => {
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
        // Update cart items if available in response
        if (data?.cart?.items && onCartItemsUpdate) {
          onCartItemsUpdate(data.cart.items);
        }
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