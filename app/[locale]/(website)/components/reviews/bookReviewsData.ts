// 定义评论的类型
export interface Review {
  reviewer_name: string;
  rating: number;
  comment: string; // 评论内容
  review_date?: string; // 评论日期
  pagepic?: string; // 用户图片，可能是可选的
}

// 定义书籍评论数据的类型
export interface BookReviewData {
  title: string; // 标题
  rating: number; // 平均评分（1-5）
  reviewsCount: number; // 评论总数
  reviews: Review[]; // 评论数组
}

// 统一存储不同书籍的评论数据
// 在此文件中更新和管理不同书籍的评论数据
export const BOOK_REVIEWS_DATA: Record<string | number, BookReviewData> = {
  // Good Night 书籍的评论数据
  'PICBOOK_GOODNIGHT': {
    title: "What parents are saying",
    rating: 5.0, // 平均评分
    reviewsCount: 18, // 评论总数
    reviews: [
      {
        reviewer_name: "Where Are You!",
        rating: 5,
        comment: "My daughter couldn't stop smiling when she saw her own face in the story. She kept asking me to read it again and again—such a special bedtime routine for us now.",
      },
      {
        reviewer_name: "Where Are You!",
        rating: 5,
        comment: "The quality is amazing—thick pages, beautiful illustrations, and the personalization makes it feel like it was made just for our family. Worth every penny.",
      },
      {
        reviewer_name: "Where Are You!",
        rating: 5,
        comment: "My son was so excited to say goodnight to the animals in the book. He fell asleep hugging it—what more could a mom ask for?",
      },
      {
        reviewer_name: "Where Are You!",
        rating: 5,
        comment: "This book feels like a keepsake we'll treasure forever. I love that we could add a dedication on the first page—it makes it even more meaningful.",
      },
    ],
  },
  
  // 可以在这里添加其他书籍的评论数据
  // 示例：
  // 'PICBOOK_SANTALETTER': {
  //   title: "See what customers are saying",
  //   rating: 4.8, // 平均评分（1-5）
  //   reviewsCount: 12, // 评论总数
  //   reviews: [
  //     {
  //       reviewer_name: "Customer Name",
  //       rating: 5,
  //       comment: "Review content here...",
  //     },
  //   ],
  // },
};
