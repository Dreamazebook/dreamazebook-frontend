import { CartItem } from "./cart";

export interface OrderSummaryProps {
  calculatingCost: boolean;
  subtotal: number;
  shipping: number;
  discountInfo: DiscountInfo | undefined;
  discountAmount: number;
  total: number;
  itemsCount: number;
  freeShipping: boolean;
  checkoutLoading: boolean;
  paypalCheckoutLoading: boolean;
  onCheckout: (paymentMethod: 'card' | 'paypal') => void;
  couponCode?: string;
  couponApplied?: string;
  couponApplying?: boolean;
  couponError?: string;
  onApplyCoupon?: (code: string) => void;
  coupon?: CouponInfo;
}

export interface DiscountInfo {
  applicable: boolean;
  amount: number;
  percentage: number;
  description?: string;
}

export interface CouponInfo {
  status: string;
  coupon_id: number;
  code: string;
  campaign_name: string;
  created_for: string | null;
  description: string;
  type: string;
  value: number;
  discount_amount: number;
  subtotal_before_coupon: number;
  subtotal_after_coupon: number;
  reservation_ttl_hours: number;
  applied_at: string;
}

export interface CalculatedCost {
  cart: {
    items: CartItem[];
  },
  original_subtotal: number;
  shipping: number;
  total_amount: number;
  discount?: DiscountInfo;
  items_count: number;
  coupon?: CouponInfo;
}