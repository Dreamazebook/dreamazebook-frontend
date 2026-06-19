import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState('');
  const currentCouponRef = useRef('');

  const calculateCost = useCallback(async (coupon?: string) => {
    if (selectedItems.length === 0) {
      setCalculatedCost(null);
      return;
    }

    const code = coupon ?? currentCouponRef.current;

    setCalculatingCost(true);
    try {
      const body: Record<string, any> = { cart_item_ids: selectedItems };
      if (code) {
        body.coupon_code = code;
      }

      const { data, success, message } = await api.post<ApiResponse<CalculatedCost>>(
        API_CART_CALCULATE_COST,
        body
      );

      if (success && data) {
        setCalculatedCost(data);
        setCouponError('');
        // Update cart items if available in response
        if (data?.cart?.items && onCartItemsUpdate) {
          onCartItemsUpdate(data.cart.items);
        }
      } else {
        setCouponError(message || '');
      }
    } catch (err: any) {
      // Try to extract the API's error message from the response body (e.g. 400 Bad Request).
      // Fall back to a generic message only for network/timeout errors (no response at all).
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
      if (apiMessage) {
        setCouponError(apiMessage);
      } else if (err?.request && !err?.response) {
        // Network error / timeout — no server response received
        setCouponError('Network error. Please check your connection and try again.');
      } else {
        setCouponError(err.message || err.toString());
      }
      // setCalculatedCost(null);
    } finally {
      setCalculatingCost(false);
    }
  }, [selectedItems, onCartItemsUpdate]);

  // Recalculate when selected items change (keep current coupon)
  useEffect(() => {
    calculateCost();
  }, [selectedItems]);

  const applyCoupon = async (code: string) => {
    setCouponApplying(true);
    setCouponError('');
    currentCouponRef.current = code;
    setCouponCode(code);
    try {
      await calculateCost(code);
      // If no error after calculate, mark coupon as applied
      setCouponApplied(code);
    } finally {
      setCouponApplying(false);
    }
  };

  const removeCoupon = async () => {
    currentCouponRef.current = '';
    setCouponCode('');
    setCouponApplied('');
    setCouponError('');
    await calculateCost('');
  };

  // Extract values from calculated cost or provide defaults
  const subtotal = calculatedCost?.original_subtotal || 0;
  const shipping = calculatedCost?.shipping ?? 0;
  const discountInfo = calculatedCost?.discount;
  const discountAmount = discountInfo?.applicable ? (discountInfo.amount || 0) : 0;
  const total = calculatedCost?.total_amount || 0;
  const coupon = calculatedCost?.coupon;

  return {
    calculatingCost,
    subtotal,
    shipping,
    discountInfo,
    discountAmount,
    total,
    calculateCost,
    itemsCount: calculatedCost?.items_count || 0,
    couponCode,
    couponApplied,
    couponApplying,
    couponError,
    applyCoupon,
    removeCoupon,
    coupon,
  };
};