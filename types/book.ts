// 基础 Book 接口
export interface BaseBook {
    id: number;
    bookname: string;
    showpic: string;
    intro: string;
    pricesymbol: string;
    price: number;
    rating: number;
    language: string;
    formid: number;
}

// 带有详细信息的 Book 接口
export interface DetailedBook extends BaseBook {
  description: string;
  tags: string;
}

// 推荐书籍接口（简化版）
export interface RecommendedBook extends BaseBook {
  // 可以添加推荐书籍特有的字段
} 