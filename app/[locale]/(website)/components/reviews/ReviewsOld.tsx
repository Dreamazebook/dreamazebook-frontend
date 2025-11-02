import React, { useState }from "react";
//import Image from "next/image";
import { DetailedBook } from "@/types/book";

// 定义关键词的类型
interface Keyword {
  keyword: string;
  count: number;
}

// 定义评论的类型
interface Review {
  reviewer_name: string;
  rating: number;
  comment: string; // 评论内容
  review_date: string; // 评论日期
  pagepic?: string; // 用户图片，可能是可选的
}

// 定义组件的 Props 类型
interface ReviewsSectionProps {
  book: DetailedBook; // 图书详情
  keywords: Keyword[]; // 关键词数组
  reviews: Review[]; // 评论数组
  compact?: boolean; // 紧凑模式：仅展示底部 Reviews 卡片
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ book, keywords, reviews, compact = false }) => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0); // 当前展示的评论索引

  const reviewsCount = reviews?.length || 18; // 如果 reviews 数组存在，使用它的长度，否则设为 0
  const defaultKeywords = keywords?.length
    ? keywords
    : [
        { keyword: "Fantasy", count: 5 },
        { keyword: "Adventure", count: 3 },
        { keyword: "Children's Book", count: 2 },
      ];

  const defaultReviews = reviews?.length
    ? reviews
    : [
        {
          reviewer_name: "John Doe",
          rating: 4,
          comment: "Great book! Really enjoyed it.",
          review_date: "2025-04-01",
          pagepic: "https://via.placeholder.com/150",
        },
        {
          reviewer_name: "Jane Smith",
          rating: 5,
          comment: "An amazing adventure. Highly recommend!",
          review_date: "2025-04-02",
          pagepic: "https://via.placeholder.com/150",
        },
        {
          reviewer_name: "Michael Lee",
          rating: 3.5,
          comment: "Good book, but a bit slow in the middle.",
          review_date: "2025-04-03",
          pagepic: "https://via.placeholder.com/150",
        },
      ]; 

  // 翻页函数，用于切换评论
  const handleUserClick = (index: number) => {
    setCurrentReviewIndex(index);
  };

  return (
    <div className={compact ? '' : 'py-12'}>
      {!compact && (
        <>
          {/* 标题 */}
          <div className="text-center mb-12 pt-12">
            <span className="text-3xl font-normal">See what customers are saying</span>
          </div>

          {/* 容器 */}
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center">
            {/* 平均评分区域 */}
            <div className="flex flex-col items-center bg-[#FFFBF3] pt-4 pb-4 px-6">
              <span className="text-[44px] font-medium text-[#222222]">{book.rating}</span>

              {/* 星级评分 */}
              <div className="flex mt-0">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src="/star.svg"
                    alt="star"
                    width={24}
                    height={24}
                    className={`${i < Math.round(parseFloat(String(book.rating))) ? '' : 'opacity-30'}`}
                  />
                ))}
              </div>

              {/* 评分描述和评论数量 */}
              <div className="flex items-center justify-center mt-4 text-2lg">
                <span className="text-[#666666]">Excellent</span>
                <span className="mx-7 text-[#E5E5E5]">|</span>
                <span className="text-[#666666]">{reviewsCount} reviews</span>
              </div>
            </div>

            {/* 关键词区域 */}
            <div className="grid grid-cols-2 gap-4 p-6">
              {defaultKeywords.map((keyword, i) => (
                <span
                  key={i}
                  className="text-sm bg-[#F8F8F8] px-4 py-2 rounded text-gray-800 text-center"
                >
                  {`${keyword.keyword} ${keyword.count}`}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* 评论区域 */}
      <div
        className="flex flex-col mx-auto bg-[#F7F2EC] overflow-hidden"
        style={{
          width: '100%',
          maxWidth: compact ? 'none' : '1440px',
          height: '551px',
          padding: '64px 120px',
          gap: '48px',
          marginTop: compact ? '0px' : '48px',
        }}
      >
        {/* 评论卡片 */}
        <div className="flex flex-col md:flex-row overflow-hidden h-full items-center justify-center md:items-stretch">
          {/* 左侧：当前用户名 */}
          <div className="w-full md:w-12 bg-[#F5E3E3] flex items-center justify-center py-3 md:py-0">
            <div
              className="text-sm font-bold text-gray-700 text-center md:rotate-[-90deg]"
              style={{
                width: "48px",
                display: "flex",
                justifyContent: "center",
                whiteSpace: "nowrap",
              }}
            >
              {defaultReviews[currentReviewIndex].reviewer_name}
            </div>
          </div>

          {/* 中间部分：评论内容 */}
          <div className="w-full md:w-10/12 p-6 flex bg-white flex-col justify-center">
            <p className="text-xl font-semibold mb-4">
              {`"${defaultReviews[currentReviewIndex].comment}"`}
            </p>
            <div className="flex items-center mb-2">
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <img
                    key={index}
                    src="/star.svg"
                    alt="star"
                    width={24}
                    height={24}
                    className={`${index < defaultReviews[currentReviewIndex].rating ? '' : 'opacity-30'}`}
                  />
                ))}
              </div>
              <span className="ml-4 text-sm text-gray-500">
                {defaultReviews[currentReviewIndex].review_date}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {defaultReviews[currentReviewIndex].reviewer_name}
            </p>
          </div>

          {/* 右侧：用户名索引 */}
          <div className="w-full md:w-40 bg-[#F5E3E3] flex justify-center items-center">
            <div className="flex flex-col md:flex-row items-center w-full h-full">
              {defaultReviews.map((review, index) => (
                <React.Fragment key={index}>
                  {/* 用户名按钮 */}
                  <button
                    className={`text-sm text-gray-700 md:rotate-[-90deg] md:px-0 md:py-0 md:w-13 md:flex md:items-center md:justify-center ${
                      index === currentReviewIndex ? "font-bold text-black" : ""
                    }`}
                    onClick={() => handleUserClick(index)}
                    style={{
                      writingMode: "horizontal-tb",
                      padding: "8px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {review.reviewer_name}
                  </button>
                  {/* 分割线 */}
                  {index < defaultReviews.length - 1 && (
                    <div className="w-full h-[1px] bg-black md:w-[1px] md:h-full" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;

