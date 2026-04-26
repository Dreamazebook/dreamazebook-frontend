import { ResultImage } from "./order";

export interface LocaleString {
  en: string;
  zh: string;
}

export interface PriceAdjustment {
  label: LocaleString;
  premium: number;
  selected: string;
  description?: LocaleString;
}

export interface Pricing {
  base_price: string;
  cover_premium: string;
  giftbox_premium: string;
  language_premium: string;
  unit_price_with_premiums: number;
  giftbox_total_price: number;
  total_price: number;
  currency_code: string;
}

export interface GiftboxInfo {
  has_giftbox: boolean;
  quantity: number;
  unit_premium: string;
  total_premium: number;
  free_quantity: number;
  chargeable_quantity: number;
  name: string;
}

export interface CartAttributes {
  language: string;
  binding_type?: string;
  cover_style?: string;
  delivery_notes?: string | null;
  gender?: string;
  gift_message?: string;
  giftbox?: string;
  hair_color?: string;
  hair_style?: string;
  replace?: boolean;
  skin_tone?: string;
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
  attributes?: CartAttributes;
  full_name?: string;
}

export interface SPU {
  id: number;
  spu_code: string;
}

export interface CartItem {
  id: number;
  book_name?: string;
  book_cover: string;
  cover_image: string;
  full_name?: string;
  recipient_name: string;
  item_type: string;
  // create: 需要新建绘本, edit: 可以编辑已完成的绘本（后端返回）
  mode?: "create" | "edit";
  sku_id: number;
  sku_code: string;
  sku_name: string;
  spu_id: number;
  spu_code: string;
  spu?: SPU;
  product_name: string;
  product_image: string | null;
  attributes: CartAttributes;
  preview_id: number | null;
  preview: any;
  customization_hash: string;
  quantity: number;
  giftbox_quantity: number;
  pricing: Pricing;
  price_adjustments: {
    giftbox: PriceAdjustment;
    cover_style: PriceAdjustment;
  };
  giftbox_info: GiftboxInfo;
  unit_price: number;
  is_selected_for_checkout: boolean;
  total_price: number;
  original_total_price: number;
  is_available: boolean;
  stock_quantity: number;
  added_at: string;
  expires_at: string;
  package_id?: number;
  ks_pending?: boolean;
  message?: string;
  result_images?: ResultImage[];
  subItems?: CartItem[];
  status: string;
  remaining_previews?: {
    used_previews_today: number;
    remaining_previews: number;
  };
  customization_data?: CustomizationData;
}

export interface CartItems {
  items: CartItem[];
  cart_summary: any;
  selection: any;
}

export const getFormatedCover = (item:CartItem) => {
  const binding_type = item?.customization_data?.attributes?.binding_type || item?.attributes?.binding_type;
  if (!binding_type) return 'Soft Cover';
  return binding_type.split('_').join(' ');
}

export const getFormatedGiftbox = (item:CartItem) => {
  const giftboxInfo = item?.customization_data?.attributes?.giftbox || item?.giftbox_info?.name;
  if (!giftboxInfo) return 'A Festive Gift Box';
  return giftboxInfo.split('_').join(' ');
}