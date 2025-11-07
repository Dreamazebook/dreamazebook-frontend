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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 place-items-center">
      {books.map((book, idx) => {
        const idOrCode = (book as any)?.spu_code ?? (book as any)?.id ?? (book as any)?.code ?? `idx-${idx}`;
        const name = (book as any)?.name ?? (book as any)?.default_name ?? 'Product';
        const defaultCoverUrl = getCoverUrl(String(idOrCode), false);
        const hoverCoverUrl = getCoverUrl(String(idOrCode), true);
        const priceVal = (book as any)?.current_price ?? (book as any)?.price ?? 0;
        const desc = (book as any)?.description ?? (book as any)?.desc ?? '';
        return (
          <div className="w-full" key={String(idOrCode)}>
            <Link 
              href={`/books/${idOrCode}`} 
              className="group relative flex flex-col items-center text-center w-full"
            >
              <div className="relative w-full aspect-square md:h-[681px] overflow-hidden mx-auto">
                {/* Default Cover Background - Mobile */}
                <div 
                  className="absolute inset-0 bg-cover bg-no-repeat group-hover:opacity-0 transition-opacity duration-300 md:hidden"
                  style={{
                    backgroundImage: `url(${defaultCoverUrl})`,
                    backgroundPosition: 'center -74px',
                  }}
                />
                {/* Default Cover Background - Desktop */}
                <div 
                  className="hidden md:block absolute inset-0 bg-cover bg-no-repeat bg-center group-hover:opacity-0 transition-opacity duration-300"
                  style={{
                    backgroundImage: `url(${defaultCoverUrl})`,
                  }}
                />
                {/* Hover Cover */}
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
                {/* Overlay: name and price floated over image */}
                <div className="absolute inset-x-0 bottom-0 pt-20 pb-8 md:pt-12 md:pb-8 lg:pt-20 lg:pb-16 flex flex-col items-center gap-3 group-hover:gap-6 z-20 transform transition-transform duration-300 translate-y-[-24px] md:translate-y-[-48px] group-hover:translate-y-0">
                  <div className="flex flex-col items-center gap-1">
                    <h3 className="text-[#222222] text-[18px] md:text-[18px] font-medium text-center px-4 line-clamp-2">
                      {name}
                    </h3>
                    {desc && (
                      <p className="hidden group-hover:block text-[#666666] text-[14px] md:text-sm text-center px-4 line-clamp-3 transition-opacity">
                        {desc}
                      </p>
                    )}
                  </div>
                  <p className="text-[#222222] text-[18px] group-hover:font-medium md:text-[18px]">
                    ${Number(priceVal).toFixed(2)}
                  </p>
                  <button className="hidden group-hover:inline-flex text-[#222222] text-[16px] md:text-sm items-center gap-2">
                    {t('personalize')}
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5H17M17 5L12.5 1M17 5L12.5 9" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              {/* <button className="mt-3 bg-black text-white px-4 py-2 rounded-full text-xs md:text-sm font-medium hover:bg-gray-800 transition-colors w-fit">
                {personalizeLabel}
              </button> */}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default BooksGrid;


