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
  reviews_count: number;
  description: string;
  tags: string;
}

// 推荐书籍接口（简化版）
export interface RecommendedBook extends BaseBook {
  // 可以添加推荐书籍特有的字段
} 