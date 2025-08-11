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
  preview_id: number;
  picbook_cover: string;
  picbook_name: string;
  edition?: string;      // 如 "Premium Jumbo Hardcover"
  description?: string;  // 额外描述，比如 "a festive gift box"
  price: number;
  quantity: number;
  total_price: number;
  subItems?: CartSubItem[]; // 附加项目
  preview?: Preview;
  preview_id?: number;
}

export interface CartItems {
  cart_items: CartItem[];
  cart_summary: any;
}