export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  code?: number;
  data?: T;
}

export interface UserResponse {
  user: {
    id: string;
    name?: string;
    email: string;
    role?: string;
  };
  token?: string;
}

// 购物车相关的类型定义
export interface CartAddRequest {
  preview_id: number;
  quantity: number;
}

export interface CartAddResponse {
  cart_item_id: number;
  message: string;
}

// 预览页面相关的类型定义
export interface PreviewPage {
  page_id: number;
  page_number: number;
  has_question: boolean;
  has_choice: boolean;
  choice_type: number;
  image_url: string;
  content: string | null;
  question: string | null;
  choice_options: string | null;
}

export interface PreviewCharacter {
  full_name: string;
  language: string;
  gender: number;
  skincolor: number;
  photo: string;
}

export interface FaceSwapBatch {
  batch_id: string;
  total_pages: number;
  status: string;
  queue_position: number;
  estimated_wait_time: number;
  queue_type: string;
  total_queue_length?: number;
}

export interface PreviewResponse {
  pages: PreviewPage[];
  characters: PreviewCharacter[];
  face_swap_batch: FaceSwapBatch;
  preview_id: number;
}

export interface PreviewRequest {
  given_name: string;
  dedication: string;
  gender: number;
  skincolor: number;
  photo: string;
}