import React from "react";
import { DetailedBook } from "@/types/book";
import { BOOK_REVIEWS_DATA, BookReviewData, Review } from "./bookReviewsData";

// 定义关键词的类型
interface Keyword {
  keyword: string;
  count: number;
}

// 定义组件的 Props 类型
interface ReviewsSectionProps {
  book: DetailedBook; // 图书详情
  keywords: Keyword[]; // 关键词数组
  reviews: Review[]; // 评论数组
  compact?: boolean; // 紧凑模式
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ book, keywords, reviews, compact = false }) => {
  const defaultKeywords = keywords?.length
    ? keywords
    : [
        { keyword: "Fantasy", count: 5 },
        { keyword: "Adventure", count: 3 },
        { keyword: "Children's Book", count: 2 },
      ];

  // 根据书籍ID获取评论数据
  const getBookReviewData = (): BookReviewData => {
    // 尝试通过book.id获取
    if (book?.id && BOOK_REVIEWS_DATA[book.id]) {
      return BOOK_REVIEWS_DATA[book.id];
    }
    
    // 尝试通过spu_code获取（如果有的话）
    const spuCode = (book as any)?.spu_code || (book as any)?.code;
    if (spuCode && BOOK_REVIEWS_DATA[spuCode]) {
      return BOOK_REVIEWS_DATA[spuCode];
    }
    
    // 如果都没有匹配，使用传入的reviews或默认值
    return {
      title: "See what customers are saying",
      rating: parseFloat(String(book?.rating || 4.8)),
      reviewsCount: reviews?.length || BOOK_REVIEWS_DATA['PICBOOK_GOODNIGHT2']?.reviewsCount || 18,
      reviews: reviews?.length ? reviews : (BOOK_REVIEWS_DATA['PICBOOK_GOODNIGHT2']?.reviews || []),
    };
  };

  const bookReviewData = getBookReviewData();
  const defaultReviews = bookReviewData.reviews;
  
  // 优先使用数据文件中的 rating 和 reviewsCount，如果没有则使用 book 对象中的数据
  const displayRating = bookReviewData.rating || parseFloat(String(book?.rating || 4.8));
  const reviewsCount = bookReviewData.reviewsCount || reviews?.length || 18;

  return (
    <div className={compact ? '' : 'py-12 bg-white gap-12'}>
      {!compact && (
        <>
          {/* 标题 */}
          <div className="text-center mb-12 pt-12">
            <span className="text-3xl font-normal">{bookReviewData.title}</span>
          </div>

          {/* 容器：平均评分区域和关键词区域 */}
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center mb-12 gap-6">
            {/* 平均评分区域 */}
            <div className="flex flex-col items-center bg-[#FFFBF3] pt-4 pb-4 px-4">
              <span className="text-[36px] font-medium text-[#222222] leading-[44px]">{displayRating.toFixed(1)}</span>

              {/* 星级评分 */}
              <div className="flex mt-0">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src="/star.svg"
                    alt="star"
                    width={24}
                    height={24}
                    className={`${i < Math.round(displayRating) ? '' : 'opacity-30'}`}
                  />
                ))}
              </div>

              {/* 评分描述和评论数量 */}
              <div className="flex items-center justify-center mt-4 text-[16px]">
                <span className="text-[#666666]">Excellent</span>
                <span className="mx-7 text-[#E5E5E5]">|</span>
                <span className="text-[#666666]">{reviewsCount} reviews</span>
              </div>
            </div>

            {/* 关键词区域 */}
            <div className="grid grid-cols-2 gap-4">
              {defaultKeywords.map((keyword, i) => (
                <span
                  key={i}
                  className="h-[56px] text-[18px] leading-[24px] bg-[#F8F8F8] p-4 rounded-[4px] text-gray-800 text-center gap-[10px]"
                >
                  {`${keyword.keyword} ${keyword.count}`}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
      
      <div className="w-[1440px] h-[496px] pr-[120px] pl-[120px] mx-auto flex flex-col gap-6">
        {/* 评论列表 */}
        {defaultReviews.map((review: Review, index: number) => (
            <React.Fragment key={index}>
              {/* 单个评论 */}
              <div className="w-[1200px] h-[88px] flex gap-[36px]">
                {/* 左侧：头像、评论者名称和评分 */}
                <div className="flex-shrink-0 flex flex-col gap-3">
                  {/* 头像和评论者名称在同一行 */}
                  <div className="flex items-center gap-3 p-2">
                    {/* 头像占位符 */}
                    <div className="w-9 h-9 rounded-full bg-gray-300 flex-shrink-0"></div>
                    
                    {/* 评论者名称 */}
                    <div className="pt-0.5">
                      <span className="text-base font-semibold text-gray-900">
                        {review.reviewer_name}
                      </span>
                    </div>
                  </div>

                  {/* 星星评分 - 放在父div下方 */}
                  <div className="flex items-center">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <img
                          key={i}
                          src="/star.svg"
                          alt="star"
                          width={18}
                          height={18}
                          className="w-4 h-4"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 右侧：评论文本 */}
                <div className="flex-1">
                  <div 
                    className="text-gray-900 text-base font-medium leading-6 tracking-[0.5px]"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    <span 
                      className="text-[24px] font-normal leading-8"
                      style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                    >"</span>
                    {review.comment}
                    <span 
                      className="text-[24px] font-normal leading-8"
                      style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                    >"</span>
                  </div>
                </div>
              </div>

              {/* 分隔线（最后一个评论后不显示） */}
              {index < defaultReviews.length - 1 && (
                <div className="h-px bg-gray-200 w-full"></div>
              )}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
};

export default ReviewsSection;

