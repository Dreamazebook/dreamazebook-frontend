// 基础 Book 接口
export interface BaseBook {
  id: number;
  default_name: string;
  default_cover: string;
  pricesymbol: string;
  price: string;
  currencycode: string;
}

// 定义分页信息接口
export interface MetaData {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

// 定义 API 响应的通用接口
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;       // BaseBook[]
  meta: MetaData;
}

// 带有详细信息的 Book 接口
export interface DetailedBook extends BaseBook {
  total_pages: number;
  preview_pages_count: number;
  character_count: number;
  rating: string;
  supported_languages: string[]; // 语言列表
  supported_genders: number[]; // 支持的性别
  supported_skincolors: number[]; // 支持的肤色
  tags: string[]; // 标签列表
  has_choices: boolean; // 是否有选项
  choices_type: number; // 选项类型
  has_question: boolean; // 是否有问题
  status: number;
  batch_processing_status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  variant: Variant;
  pages: Page[];
  reviews: Review[];
  keywords: Keyword[];
}

export interface Variant {
  bookname: string;
  intro: string;
  description: string;
  cover: string;
  price: string | null; 
  pricesymbol: string | null; 
  currencycode: string | null; 
  tags: string[] | null;
  content: string | null;
}

// 推荐书籍接口（简化版）
export interface RecommendedBook extends BaseBook {
  // 可以添加推荐书籍特有的字段
}

export interface Page {
  id: number;
  picbook_id: number;
  page_number: number;
  image_url: string;
  status: number;
  is_ai_face: boolean;
  mask_image_url: string;
  has_replaceable_text: boolean;
  text_elements: TextElement[];
  character_sequence: number[];
  has_question: boolean;
  has_choice: boolean;
  choice_type: number;
  is_preview: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  character_masks: CharacterMask[];
  variants: PageVariant[];
}

export interface TextElement {
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

export interface CharacterMask {
  character: number;
  mask_url: string;
  position: any | null;
  content: any | null;
}

export interface PageVariant {
  id: number;
  page_id: number;
  language: string;
  gender: number;
  skincolor: number;
  character_skincolors: number[];
  character_skincolors_hash: string;
  image_url: string;
  skin_mask_url: string;
  has_text: boolean;
  text_config: any | null;
  has_face: boolean;
  face_config: FaceConfig;
  is_published: boolean;
  elements: any | null;
  text_elements: TextElement[];
  variant_type: number;
  is_preview_variant: boolean;
  content: any | null;
  choice_options: any | null;
  question: any | null;
  character_masks: any | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  processing_status: number;
  processed_image_url: string | null;
}

export interface FaceConfig {
  mask_url: string;
  character_sequence: number[];
}

export interface Review {
  reviewer_name: string;
  rating: number;
  comment: string;
  review_date: string;
  pagepic?: string;
}

export interface Keyword {
  keyword: string;
  count: number;
} 