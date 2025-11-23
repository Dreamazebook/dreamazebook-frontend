import { Address } from "@/types/address";
import { CartItem } from "./cart";

export function formatDate(date: string) {
  return date.split('T')[0];
}

export interface FaceImage {
  disk: string;
  mime: string;
  original_name: string;
  path: string;
  uploaded_at: string;
  url: string;
}

export interface CustomizationData {
  face_images: FaceImage[];
}

export interface OrderDetail {
  id: number;
  user_id: number;
  user: {
    id: string,
    name: string,
    email: string
  };
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
  paid_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  items:CartItem[];
  shipping_options: {
    options: ShippingOption[];
  };
  logistics_data?: {
    print_pdf?: {
      files: Array<{
        id: number;
        name: string;
        url: string;
        size: number;
        type: string;
      }>;
      status: string;
      completed_at: string;
    };
  };
  customization_data?: CustomizationData;
}

export const EMPTY_CART_ITEM = {
  id: 0,
  name: '',
  format: '',
  box: '',
  image: '',
  price: 0,
  quantity: 0,
  total_price: 0,
  picbook_name: '',
  picbook_cover: '',
  message: '',
  status: '',
  created_at: '',
  updated_at: '',
}

export interface ResultImage {
  base_image_path: string;
  final_image_url: string;
  face_swap_mask_url: string;
  item_id: number;
  page_code: string;
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

export interface Pickbook {
  default_name: string;
  default_cover: string;
  pricesymbol: string;
  price: number;
  currencycode: string;
  total_pages: number;
  preview_pages_count: number;
  rating: number;
  has_choices: boolean;
  has_question: boolean;
  supported_languages: string[];
  supported_genders: string[];
  supported_skincolors: string[];
  character_count: number;
  tags: string[];
  status: string;
  is_saleable: boolean;
  choices_type: string;
}