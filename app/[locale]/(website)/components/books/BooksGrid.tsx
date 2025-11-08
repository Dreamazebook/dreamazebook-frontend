import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface BooksGridProps {
  books: any[];
}

const BooksGrid: React.FC<BooksGridProps> = ({ books }) => {
  const t = useTranslations('BooksPage');
  if (!books || books.length === 0) return null;

  const getCoverUrl = (id: string, isHover: boolean = false) => {
    const baseUrl = 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/catalog';
    const coverType = isHover ? 'cover-hover.png' : 'cover-default.png';
    return `${baseUrl}/${id}/${coverType}`;
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
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 place-items-center">
      {booksWithComingSoon.map((book, idx) => {
        const idOrCode = (book as any)?.spu_code ?? (book as any)?.id ?? (book as any)?.code ?? `idx-${idx}`;
        const name = (book as any)?.name ?? (book as any)?.default_name ?? 'Product';
        const defaultCoverUrl = getCoverUrl(String(idOrCode), false);
        const hoverCoverUrl = getCoverUrl(String(idOrCode), true);
        const priceVal = (book as any)?.current_price ?? (book as any)?.price ?? 0;
        const desc = (book as any)?.description ?? (book as any)?.desc ?? '';
        const isComingSoon = priceVal === 0 && idOrCode === 'new-books-coming';
        
        const cardContent = (
          <div className="relative w-full aspect-square md:h-[681px] overflow-hidden mx-auto">
            {/* Default Cover Background - Mobile */}
            <div 
              className={`absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-300 md:hidden ${
                isComingSoon ? '' : 'group-hover:opacity-0'
              }`}
              style={{
                backgroundImage: `url(${defaultCoverUrl})`,
                backgroundPosition: 'center -74px',
              }}
            />
            {/* Default Cover Background - Desktop */}
            <div 
              className={`hidden md:block absolute inset-0 bg-cover bg-no-repeat bg-center transition-opacity duration-300 ${
                isComingSoon ? '' : 'group-hover:opacity-0'
              }`}
              style={{
                backgroundImage: `url(${defaultCoverUrl})`,
              }}
            />
            {/* Hover Cover - 仅非 Coming Soon 卡片显示 */}
            {!isComingSoon && (
              <Image
                src={hoverCoverUrl}
                alt={String(name || 'Product image')}
                fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 z-0"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                unoptimized={true}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = defaultCoverUrl;
                }}
              />
            )}
            {/* Overlay: name and price floated over image */}
            <div className={`absolute inset-x-0 bottom-0 pt-20 pb-8 md:pt-12 md:pb-8 lg:pt-20 lg:pb-16 flex flex-col items-center z-20 transform transition-transform duration-300 ${
              isComingSoon 
                ? 'gap-3 translate-y-[-24px] md:translate-y-[-48px]' 
                : 'gap-3 group-hover:gap-6 translate-y-[-24px] md:translate-y-[-48px] group-hover:translate-y-0'
            }`}>
              <div className="flex flex-col items-center gap-1">
                <h3 className="text-[#222222] text-[18px] md:text-[18px] font-medium text-center px-4 line-clamp-2">
                  {name}
                </h3>
                {desc && !isComingSoon && (
                  <p className="hidden group-hover:block text-[#666666] text-[14px] md:text-sm text-center px-4 line-clamp-3 transition-opacity">
                    {desc}
                  </p>
                )}
              </div>
              {!isComingSoon ? (
                <p className="text-[#222222] text-[18px] group-hover:font-medium md:text-[18px]">
                  ${Number(priceVal).toFixed(2)}
                </p>
              ) : (
                <p className="text-[#666666] text-[14px] md:text-[16px]">
                  New books will be online soon, please stay tuned
                </p>
              )}
              {!isComingSoon && (
                <button className="hidden group-hover:inline-flex text-[#222222] text-[16px] md:text-sm items-center gap-2">
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
              <div className="group relative flex flex-col items-center text-center w-full cursor-default">
                {cardContent}
              </div>
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
  );
};

export default BooksGrid;


