import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface BooksGridProps {
  books: any[];
  personalizeLabel: string;
}

const BooksGrid: React.FC<BooksGridProps> = ({ books, personalizeLabel }) => {
  if (!books || books.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 place-items-center">
      {books.map((book, idx) => {
        const idOrCode = (book as any)?.spu_code ?? (book as any)?.id ?? (book as any)?.code ?? `idx-${idx}`;
        const name = (book as any)?.name ?? (book as any)?.default_name ?? 'Product';
        const imgSrc = '/products/picbooks/PICBOOK_GOODNIGHT2/thumb.png';
        const priceVal = (book as any)?.current_price ?? (book as any)?.price ?? 0;
        const desc = (book as any)?.description ?? (book as any)?.desc ?? '';
        return (
          <div className="w-full bg-[#F3F3F3]" key={String(idOrCode)}>
            <Link 
              href={`/books/${idOrCode}`} 
              className="group relative flex flex-col items-center text-center w-full"
            >
              {/* Hover gradient as tile background (behind image and text) */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                style={{ background: 'linear-gradient(90deg, #E6EAF4 0%, #DDE1EB 100%)' }}
              />
              <div className="relative w-full aspect-square md:h-[681px] overflow-hidden mx-auto">
                <Image
                  src={imgSrc}
                  alt={String(name || 'Product image')}
                  fill
                  className="object-cover -translate-y-[74px]"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  unoptimized={false}
                />
                {/* Overlay: name and price floated over image */}
                <div className="absolute inset-x-0 bottom-0 pt-20 pb-16 md:pt-12 md:pb-8 lg:pt-20 lg:pb-16 flex flex-col items-center gap-3 group-hover:gap-6 z-10 transform transition-transform duration-300 translate-y-[-24px] md:translate-y-[-48px] group-hover:translate-y-0">
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
                    {personalizeLabel}
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


