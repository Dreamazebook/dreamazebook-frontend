import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

// 书籍名字覆盖配置（与详情页保持一致）
const BOOK_NAME_OVERRIDES: Record<string, string> = {
  PICBOOK_GOODNIGHT3: 'Good Night to You',
  PICBOOK_BRAVEY: "Little One, You're Brave in Many Ways",
  PICBOOK_BIRTHDAY: 'Birthday Book for You',
  PICBOOK_MELODY: 'Your Melody',
  PICBOOK_SANTA: "Santa's Letter for You",
};

interface BooksGridProps {
  books: any[];
}

const BooksGrid: React.FC<BooksGridProps> = ({ books }) => {
  const t = useTranslations('BooksPage');
  if (!books || books.length === 0) return null;

  const getCoverUrl = (id: string, isHover: boolean = false, isMobile: boolean = false) => {
    const baseUrl = 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/catalog';
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 items-start justify-items-center pb-8 bg-[#F3F3F3]">
        {booksWithComingSoon.map((book, idx) => {
        const idOrCode = (book as any)?.spu_code ?? (book as any)?.id ?? (book as any)?.code ?? `idx-${idx}`;
        const originalName = (book as any)?.name ?? (book as any)?.default_name ?? 'Product';
        const name = BOOK_NAME_OVERRIDES[String(idOrCode)] || originalName;
        const mobileCoverUrl = getCoverUrl(String(idOrCode), false, true);
        const defaultCoverUrl = getCoverUrl(String(idOrCode), false, false);
        const hoverCoverUrl = getCoverUrl(String(idOrCode), true, false);
        const priceVal = (book as any)?.current_price ?? (book as any)?.price ?? 0;
        const desc = (book as any)?.description ?? (book as any)?.desc ?? '';
        const isComingSoon = priceVal === 0 && idOrCode === 'new-books-coming';
        
        const cardContent = (
          <div className={`flex flex-col md:relative w-full min-h-[355px] book-card-height overflow-hidden mx-auto bg-[#F3F3F3] transition-colors duration-300 ${
            isComingSoon ? '' : 'group-hover:bg-[#E0E4EF]'
          }`}>
            {/* 图片容器 */}
            <div className="relative w-full flex-shrink-0">
              {/* Mobile Cover：贴顶，宽度等于容器，高度自适应 */}
              <img
                src={mobileCoverUrl}
                alt={String(name || 'Product image')}
                className={`block md:hidden w-full h-auto object-contain object-top transition-opacity duration-300 ${
                  isComingSoon ? '' : 'group-hover:opacity-0'
                }`}
                style={{ objectPosition: 'top' }}
              />
              {/* Default Cover (Desktop)：贴顶，宽度等于容器，高度自适应 */}
              <img
                src={defaultCoverUrl}
                alt={String(name || 'Product image')}
                className={`hidden md:block w-full h-auto object-contain object-top transition-opacity duration-300 ${
                  isComingSoon ? '' : 'group-hover:opacity-0'
                }`}
                style={{ objectPosition: 'top' }}
              />
              {/* Hover Cover (Desktop only)：同样贴顶，宽度等于容器 */}
              {!isComingSoon && (
                <img
                  src={hoverCoverUrl}
                  alt={String(name || 'Product image')}
                  className="hidden md:block w-full h-auto object-contain object-top opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-x-0 top-0"
                  style={{ objectPosition: 'top' }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = defaultCoverUrl;
                  }}
                />
              )}
            </div>
            
            {/* Mobile: 标题和价格在图片下方 */}
            <div className="flex md:hidden flex-col items-center gap-3 pt-4 pb-4">
              <h3 className="text-[#222222] text-[18px] font-medium text-center px-4 line-clamp-2">
                {name}
              </h3>
              {!isComingSoon ? (
                <p className="text-[#222222] text-[18px]">
                  ${Number(priceVal).toFixed(2)}
                </p>
              ) : (
                <p className="text-[#666666] text-[14px]">
                  New books will be online soon, please stay tuned
                </p>
              )}
            </div>

            {/* Desktop: Overlay - name and price floated over image */}
            <div className={`hidden md:flex absolute inset-x-0 bottom-0 pt-12 pb-8 lg:pt-20 lg:pb-16 flex-col items-center z-20 transform transition-transform duration-300 ${
              isComingSoon 
                ? 'gap-3 translate-y-[-48px]' 
                : 'gap-3 group-hover:gap-6 translate-y-[-48px] group-hover:translate-y-0'
            }`}>
              <div className="flex flex-col items-center gap-1">
                <h3 className="text-[#222222] text-[18px] font-medium text-center px-4 line-clamp-2">
                  {name}
                </h3>
                {desc && !isComingSoon && (
                  <p className="hidden group-hover:block text-[#666666] text-sm text-center px-4 line-clamp-3 transition-opacity">
                    {desc}
                  </p>
                )}
              </div>
              {!isComingSoon ? (
                <p className="text-[#222222] text-[18px] group-hover:font-medium">
                  ${Number(priceVal).toFixed(2)}
                </p>
              ) : (
                <p className="text-[#666666] text-[16px]">
                  New books will be online soon, please stay tuned
                </p>
              )}
              {!isComingSoon && (
                <button className="hidden group-hover:inline-flex text-[#222222] text-sm items-center gap-2">
                  {t('personalize')}
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
          height: 375px;
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


