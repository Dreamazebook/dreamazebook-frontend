import React, { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { getBookDetailFinalUnitPrice, getBookDetailOriginalUnitPrice } from '@/utils/bookDisplayPrice';
import { WEBSITE_CDN_URL } from '@/constants/cdn';
import Button from '@/app/components/Button';

// 书籍名字覆盖配置（与详情页保持一致）
const BOOK_NAME_OVERRIDES: Record<string, string> = {
  PICBOOK_GOODNIGHT3: 'Good Night to You',
  PICBOOK_MOM: 'The Way I See You, Mama',
  PICBOOK_BRAVEY: "Little One, You're Brave in Many Ways",
  PICBOOK_BIRTHDAY: 'Birthday Book for You',
  PICBOOK_MELODY: 'Your Melody',
  PICBOOK_SANTA: "Santa's Letter for You",
};

interface BooksGridProps {
  books: any[];
}

// Book Card Image Component with error handling
// use to fix Cross-Origin Read Blocking (CORB) blocked a cross-origin response.
const BookCoverImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}> = ({ src, alt, className, style, priority = false }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className={className}
      style={style}
      unoptimized
      priority={priority}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          // Try without unoptimized - some images may need optimization pipeline
          const optimizedSrc = imgSrc.includes('?')
            ? imgSrc
            : `${imgSrc}?v=${Date.now()}`;
          setImgSrc(optimizedSrc);
        }
      }}
    />
  );
};

const BooksGrid: React.FC<BooksGridProps> = ({ books }) => {
  const t = useTranslations('BooksPage');
  const tDetail = useTranslations('BookDetail');
  if (!books || books.length === 0) return null;

  const getCoverUrl = (id: string, isHover: boolean = false, isMobile: boolean = false) => {
    const baseUrl = `${WEBSITE_CDN_URL}catalog`;
    let coverType: string;
    if (isHover) {
      coverType = 'cover-hover.png';
    } else {
      coverType = isMobile ? 'cover-MOBILE.png' : 'cover-default.png';
    }

    const rawId = String(id).trim();
    if (rawId === 'new-books-coming') {
      return `${baseUrl}/new-books-coming/${coverType}`;
    }
    let normalizedId = rawId;
    if (normalizedId === 'PICBOOK_GOODNIGHT3') {
      normalizedId = 'PICBOOK_GOODNIGHT';
    }

    return `${baseUrl}/${normalizedId}/${coverType}`;
  };

  // 在书籍列表末尾添加 "new book coming soon" 卡片
  const booksWithComingSoon = [
    ...books,
    {
      spu_code: 'new-books-coming',
      name: 'New book coming soon',
      description: 'New books will be online soon, please stay tuned',
      current_price: 0,
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 items-start justify-items-center pb-8 md:pb-0 bg-[#F3F3F3]">
        {booksWithComingSoon.map((book, idx) => {
        const idOrCode = (book as any)?.spu_code ?? (book as any)?.id ?? (book as any)?.code ?? `idx-${idx}`;
        const originalName = (book as any)?.name ?? (book as any)?.default_name ?? 'Product';
        const name = BOOK_NAME_OVERRIDES[String(idOrCode)] || originalName;
        const mobileCoverUrl = getCoverUrl(String(idOrCode), false, true);
        const defaultCoverUrl = getCoverUrl(String(idOrCode), false, false);
        const hoverCoverUrl = getCoverUrl(String(idOrCode), true, false);
        const finalUnit = getBookDetailFinalUnitPrice(book);
        const originalUnit = getBookDetailOriginalUnitPrice(book, finalUnit);
        const desc = (book as any)?.description ?? (book as any)?.desc ?? '';
        // 仅对我们人工插入的“new-books-coming”卡片做 coming soon 判定
        // （不要用 price===0 来判断，避免误伤真实 0 元商品或数据异常）
        const isComingSoon = idOrCode === 'new-books-coming';
        const categories = book.marketing_tags || [];
        
        const cardContent = (
          <div className="flex flex-col md:relative w-full min-h-[355px] book-card-height overflow-hidden mx-auto bg-[#F3F3F3] transition-colors duration-300 group-hover:bg-[#E0E4EF]">
            {/* 图片容器 */}
            <div className="relative w-full flex-shrink-0 h-[285px] md:h-[480px]">
              {/* Mobile Cover：贴顶，宽度等于容器，高度自适应 */}
              <div className="block md:hidden relative w-full h-full">
                <BookCoverImage
                  src={mobileCoverUrl}
                  alt={String(name || 'Product image')}
                  className="object-contain object-top transition-opacity duration-300 group-hover:opacity-0"
                  style={{ objectPosition: 'top' }}
                />
              </div>
              {/* Default Cover (Desktop)：贴顶，宽度等于容器，高度自适应 */}
              <div className="hidden md:block relative w-full h-full">
                <BookCoverImage
                  src={defaultCoverUrl}
                  alt={String(name || 'Product image')}
                  className="object-contain object-top transition-opacity duration-300 group-hover:opacity-0"
                  style={{ objectPosition: 'top' }}
                  priority={idx < 3}
                />
              </div>
              {/* Hover Cover (Desktop only)：同样贴顶，宽度等于容器 */}
              <div className="hidden md:block absolute inset-x-0 top-0 w-full h-full">
                <BookCoverImage
                  src={hoverCoverUrl}
                  alt={String(name || 'Product image')}
                  className="object-contain object-top opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ objectPosition: 'top' }}
                />
              </div>
            </div>
            
            {/* Mobile: 标题和价格在图片下方 */}
            {/* <div className="flex md:hidden flex-col items-center gap-2 pt-4 pb-4">
              <h3 className="text-[#222222] text-[18px] font-medium text-center px-4 line-clamp-2">
                {name}
              </h3>
              {desc && !isComingSoon && (
                <p className="group-hover:block text-[#666666] text-sm text-center px-4 line-clamp-3 transition-opacity">
                  {desc}
                </p>
              )}
              {!isComingSoon ? (
                <p className="text-[#222222] flex gap-2 items-center text-[18px] group-hover:font-medium">
                  <span className="text-[18px]">From ${book.current_price}</span><span className="line-through text-[#999] text-[16px]">${Number(priceVal).toFixed(2)}</span>
                </p>
              ) : (
                <div className="flex flex-col items-center gap-2 px-4">
                  <p className="text-[#666666] text-[14px] text-center">
                    New books will be online soon, please stay tuned
                  </p>
                  <span className="text-[#222222] text-[14px] font-medium inline-flex items-center gap-2">
                    Fill it out
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5H17M17 5L12.5 1M17 5L12.5 9" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              )}
            </div> */}

            {/* Desktop: Overlay - name and price floated over image */}
            <div className="flex md:absolute inset-x-0 bottom-0 pt-12 pb-8 lg:pt-20 lg:pb-16 flex-col items-center z-20 transform transition-transform duration-300 gap-2 group-hover:gap-3 translate-y-[-48px] group-hover:translate-y-0">
              <div className="flex flex-col items-center gap-1">
                <h3 className="text-[#222222] text-[18px] font-medium text-center px-4 line-clamp-2">
                  {name}
                </h3>
                {desc && !isComingSoon && (
                  <p className="group-hover:block text-[#666666] text-sm text-center px-4 line-clamp-3 transition-opacity">
                    {desc}
                  </p>
                )}
              </div>
              <div className="md:hidden group-hover:flex text-[#666666] text-[16px] flex justify-center items-center gap-[10px]">
                {categories.map((c:string)=><span className="bg-[#F3F6FF66] p-1" key={c}>{c}</span>)}
              </div>
              {!isComingSoon ? (
                <p className="text-[#222222] flex gap-2 items-center text-[18px] group-hover:font-medium">
                  <span className="text-[18px]">From ${finalUnit.toFixed(2)}</span>
                  {originalUnit > finalUnit && (
                    <span className="line-through text-[#999] text-[16px]">${originalUnit.toFixed(2)}</span>
                  )}
                </p>
              ) : (
                <p className="text-[#666666] text-[16px] text-center px-4">
                  New books will be online soon, please stay tuned
                </p>
              )}
              {!isComingSoon && (
                <Button tl={tDetail('personalizeButton')} className="md:hidden group-hover:inline-flex items-center bg-[#222222] text-white w-auto" />
              )}
              {isComingSoon && (
                <button className="md:hidden group-hover:inline-flex text-[#222222] text-sm items-center gap-2">
                  Fill it out
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5H17M17 5L12.5 1M17 5L12.5 9" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        );

        return (
          <div className="w-full" key={String(idOrCode)}>
            {isComingSoon ? (
              <Link 
                href="/survey" 
                className="group relative flex flex-col items-center text-center w-full"
                prefetch={true}
              >
                {cardContent}
              </Link>
            ) : (
              <Link 
                href={`/books/${idOrCode}`} 
                className="group relative flex flex-col items-center text-center w-full"
                prefetch={true}
              >
                {cardContent}
              </Link>
            )}
          </div>
        );
      })}
      </div>
      <style jsx>{`
        .book-card-height {
          height: 500px;
        }

        @media (min-width: 768px) {
          .book-card-height {
            height: 680px;
          }
        }

        @media (min-width: 1800px) {
          .book-card-height {
            height: 770px;
          }
        }
      `}</style>
    </>
  );
};

export default BooksGrid;


