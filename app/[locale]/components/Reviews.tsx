import React from "react";
//import Image from "next/image";
import { DetailedBook } from "@/types/book";

// 定义关键词的类型
interface Keyword {
  keyword: string;
  count: number;
}

// 定义评论的类型
interface Review {
  reviewerName: string;
  rating: number;
  comment: string; // 评论内容
  reviewDate: string; // 评论日期
  pagepic?: string; // 用户图片，可能是可选的
}

// 定义组件的 Props 类型
interface ReviewsSectionProps {
  book: DetailedBook; // 图书详情
  keywords: Keyword[]; // 关键词数组
  reviews: Review[]; // 评论数组
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ book, keywords }) => {
  //const [currentReviewIndex, setCurrentReviewIndex] = useState(0); // 当前展示的评论索引

  // 翻页函数，用于切换评论
  // const handlePageChange = (index: number) => {
    //setCurrentReviewIndex(index);
  //};

  return (
    <div className="py-12">
      {/* 容器 */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center">
        {/* 平均评分区域 */}
        <div className="flex flex-col items-center bg-[#FFFBF3] pt-4 pb-4 px-6">
          <span className="text-[44px] font-medium text-[#222222]">{book.rating?.toFixed(1)}</span>

          {/* 星级评分 */}
          <div className="flex mt-0">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-6 h-6 ${
                  i < Math.round(book.rating) ? "text-yellow-500" : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* 评分描述和评论数量 */}
          <div className="flex items-center justify-center mt-4 text-2lg">
            <span className="text-[#666666]">Excellent</span>
            <span className="mx-7 text-[#E5E5E5]">|</span>
            <span className="text-[#666666]">{book.reviews_count} reviews</span>
          </div>
        </div>

        {/* 关键词区域 */}
        <div className="grid grid-cols-2 gap-4 p-6">
          {keywords.map((keyword, i) => (
            <span
              key={i}
              className="text-sm bg-[#F8F8F8] px-4 py-2 rounded text-gray-800 text-center"
            >
              {`${keyword.keyword} ${keyword.count}`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;