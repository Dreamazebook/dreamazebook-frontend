export interface OrderSummaryProps {
  calculatingCost: boolean;
  subtotal: number;
  shipping: number;
  discountInfo: DiscountInfo | undefined;
  discountAmount: number;
  total: number;
  selectedItems: number[];
  checkoutLoading: boolean;
  paypalCheckoutLoading: boolean;
  onCheckout: (paymentMethod: 'stripe' | 'paypal') => void;
}

export interface DiscountInfo {
  applicable: boolean;
  amount: number;
  percentage: number;
  description?: string;
}

export interface CalculatedCost {
  original_subtotal: number;
  shipping: number;
  total_amount: number;
  discount?: DiscountInfo;
}