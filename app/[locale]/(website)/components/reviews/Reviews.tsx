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
      reviewsCount: reviews?.length || BOOK_REVIEWS_DATA['PICBOOK_GOODNIGHT']?.reviewsCount || 18,
      reviews: reviews?.length ? reviews : (BOOK_REVIEWS_DATA['PICBOOK_GOODNIGHT']?.reviews || []),
    };
  };

  const bookReviewData = getBookReviewData();
  const defaultReviews = bookReviewData.reviews;
  
  // 优先使用数据文件中的 rating 和 reviewsCount，如果没有则使用 book 对象中的数据
  const displayRating = bookReviewData.rating || parseFloat(String(book?.rating || 4.8));
  const reviewsCount = bookReviewData.reviewsCount || reviews?.length || 18;

  return (
    <div className={compact ? '' : 'flex flex-col items-center md:py-22 py-8 px-4 md:px-0 bg-white md:gap-12 gap-6'}>
      {!compact && (
        <>
          {/* 标题 */}
          <div className="text-center">
            <span className="md:text-[40px] text-[24px] md:leading-[64px] leading-[32px] md:font-medium font-semibold">{bookReviewData.title}</span>
          </div>

          {/* 容器：平均评分区域和关键词区域 */}
          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center md:justify-center md:gap-6 gap-2">
            {/* 平均评分区域 */}
            <div className="p-3 flex flex-row md:flex-col items-center md:items-center bg-[#FFFBF3] w-full md:w-auto">
              {/* 手机端：左侧文字区域 */}
              <div className="flex flex-col flex-1 md:hidden gap-1">
                <span className="text-[16px] font-medium text-[#222222] leading-[24px] tracking-[0.25px]">Average Rating</span>
                <div className="flex items-center text-[14px] leading-[20px] tracking-[0.25px]">
                  <span className="text-[#666666]">Excellent</span>
                  <span className="mx-2 text-[#E5E5E5]">|</span>
                  <span className="text-[#666666]">{reviewsCount} reviews</span>
                </div>
              </div>

              {/* 手机端：右侧数字和星星区域 */}
              <div className="flex flex-col items-center ml-auto md:ml-0">
                <span className="text-[24px] md:text-[36px] font-medium text-[#222222] leading-[32px] md:leading-[44px]">{displayRating.toFixed(1)}</span>

                {/* 星级评分 */}
                <div className="flex mt-0 md:gap-3 gap-[6px]">
                  {[...Array(5)].map((_, i) => (
                    <img
                      key={i}
                      src="/star.svg"
                      alt="star"
                      width={24}
                      height={24}
                      className={`w-[18px] h-[18px] md:w-6 md:h-6 ${i < Math.round(displayRating) ? '' : 'opacity-30'}`}
                    />
                  ))}
                </div>
              </div>

              {/* 宽屏幕：评分描述和评论数量 */}
              <div className="hidden md:flex items-center justify-center mt-4 text-[16px]">
                <span className="text-[#666666]">Excellent</span>
                <span className="mx-7 text-[#E5E5E5]">|</span>
                <span className="text-[#666666]">{reviewsCount} reviews</span>
              </div>
            </div>

            {/* 关键词区域 */}
            <div className="md:w-auto grid grid-cols-2 md:gap-4 gap-2 self-start md:self-auto">
              {defaultKeywords.map((keyword, i) => (
                <span
                  key={i}
                  className="md:text-[18px] text-[14px] md:leading-[24px] leading-[20px] bg-[#F8F8F8] py-2 px-3 md:p-4 rounded-[4px] text-gray-800 text-center gap-[10px]"
                >
                  {`${keyword.keyword} ${keyword.count}`}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
      
      <div className="w-full max-w-[1440px] md:px-[120px] flex flex-col md:gap-6 gap-4">
        {/* 评论列表 */}
        {defaultReviews.map((review: Review, index: number) => (
            <React.Fragment key={index}>
              {/* 单个评论 */}
              <div className="w-full md:max-w-[1200px] flex flex-col md:flex-row md:h-[88px] gap-4 md:gap-[36px]">
                {/* 第一排/左侧：头像、评论者名称和评分 */}
                <div className="flex-shrink-0 md:w-[200px] flex md:flex-col flex-row items-center md:gap-3 gap-4 justify-between">
                  {/* 头像和评论者名称在同一行（小屏幕）或分开（大屏幕） */}
                  <div className="flex items-center gap-3 py-1 md:py-0">
                    {/* 头像占位符 */}
                    <div className="md:w-9 md:h-9 w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>

                    {/* 评论者名称 */}
                    <div className="md:pt-0.5 pt-0">
                      <span className="font-medium text-[14px] md:text-[16px] leading-[20px] md:leading-[24px] tracking-[0.25px] md:tracking-[0.15px] text-gray-900">
                        {review.reviewer_name}
                      </span>
                    </div>
                  </div>

                  {/* 星星评分 - 在小屏幕下和头像/名字同行，在大屏幕下在下面 */}
                  <div className="flex items-center">
                    <div className="flex md:gap-3 gap-[6px]">
                      {[...Array(5)].map((_, i) => (
                        <img
                          key={i}
                          src="/star.svg"
                          alt="star"
                          width={18}
                          height={18}
                          className="w-[18px] h-[18px] md:w-6 md:h-6"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 第二排/右侧：评论文本 */}
                <div className="flex-1">
                  <div
                    className="text-[#222222] font-normal text-[14px] leading-[20px] tracking-[0.25px] md:font-medium md:text-[16px] md:leading-[24px] md:tracking-[0.5px]"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    <span
                      className="md:text-[24px] text-[18px] font-normal md:leading-8 leading-[20px]"
                      style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                    >"</span>
                    {review.comment}
                    <span
                      className="md:text-[24px] text-[18px] font-normal md:leading-8 leading-[20px]"
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

