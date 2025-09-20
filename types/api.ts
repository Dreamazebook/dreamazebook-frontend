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
    user_type?: string;
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
  has_face_swap: boolean;
  character_sequence: number[];
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
  preview_data: PreviewPage[];
  characters: number[];
  face_swap_info: {
    batch_id: string;
    total_tasks: number;
    face_swap_pages: {
      page_id: number;
      variant_id: number;
      character_sequence: number[];
    }[];
    status: 'processing' | 'completed' | 'failed';
  };
  preview_id: number;
  total_pages: number;
  face_swap_pages_count: number;
}

export interface PreviewRequest {
  given_name: string;
  dedication: string;
  gender: number;
  skincolor: number;
  photo: string;
}