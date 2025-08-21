import { Address } from "@/types/address";

export function formatDate(date: string) {
  return date.split('T')[0];
}

export interface OrderDetailResponse {
  order: OrderDetail;
  payment_data: {
    client_secret: string,
  }
}

export interface OrderDetail {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: number;
  currency_code: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_id: string | null;
  billing_address: Address;
  shipping_method: string;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  coupon_code: string;
  notes: string;
  stripe_payment_intent_id: string;
  stripe_client_secret: string;
  shipping_address: Address;
  shipping_options: ShippingOption[];
  paid_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  items:CartItem[]
}

export interface CartItem {
  id: number;
  name: string;
  format?: string;
  box?: string;
  image: string;
  price: number;
  quantity: number;
  total_price: number;
  picbook_name: string;
  picbook_cover: string;
  message: string;
  status: string;
}

export interface ShippingErrors {
  email?: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  city?: string;
  post_code?: string;
  country?: string;
  state?: string;
  phone?: string;
}

export interface BillingErrors {
  billingEmail?: string;
  billingFirstName?: string;
  billingLastName?: string;
  billingAddress?: string;
}

export type PaymentOption = "card" | "paypal" | null;

export interface ShippingOption {
  charge_weight?: string;
  code: string;
  cost: number;
  currency?: string;
  description?: string;
  estimated_days?: string;
  is_trackable?: boolean;
  name?: string;
  original_cost?: string;
  original_currency?: string;
  type?: string;
}