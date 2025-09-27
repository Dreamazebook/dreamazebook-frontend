import { Pickbook } from "../../checkout/components/types";

export interface CartSubItem {
  name: string;
  image: string;
  price: number;
}

export interface Preview {
  id: number;
  picbook_id: number;
  gender: string;
  language: string;
  skin_color: number[];
  face_image: string;
  characters: number[];
  recipient_name: string | null;
  message: string | null;
  status: string;
}

export interface CartItem {
  id: number;
  package_id?: number;
  picbook_id?: number;
  picbook_cover: string;
  picbook_name: string;
  binding_type?: string;
  message: string;
  edition?: string;      // 如 "Premium Jumbo Hardcover"
  description?: string;  // 额外描述，比如 "a festive gift box"
  price: number;
  quantity: number;
  total_price: number;
  discount_price?: number;
  subItems?: CartItem[]; // 附加项目
  preview?: Preview;
  preview_id?: number;
  status: string;
  created_at: string;
  updated_at: string;
  item_type?: string;
  picbook: Pickbook;
  remaining_previews?: {
    max_previews_per_day: number;
    used_previews_today: number;
    remaining_previews: number;
  };
}

export interface CartItems {
  cart_items: CartItem[];
  cart_summary: any;
}