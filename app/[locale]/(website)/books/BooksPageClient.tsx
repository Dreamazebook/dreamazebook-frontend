'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Link, usePathname } from "@/i18n/routing";
import { FaStar, FaStarHalf, FaSearch } from '@/utils/icons';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import BooksGrid from '../components/books/BooksGrid';
import LovedByKidsCarousel from '../components/books/LovedByKidsCarousel';
import OccasionsSection from '../components/books/OccasionsSection';
import WhyFamiliesChooseSection from '../components/books/WhyFamiliesChooseSection';
import { getBookPath } from '@/constants/bookRoutes';
import { Product } from '@/types/product';
import { getBookListDisplayPrice, getBookMarketComparePrice } from '@/utils/bookDisplayPrice';

const BOOK_NAME_OVERRIDES: Record<string, string> = {
  PICBOOK_GOODNIGHT3: 'Good Night to You',
  PICBOOK_MOM: 'The Way I See You, Mama',
  PICBOOK_DAD: 'Dad & Me: A Little Book of Our Big Memories',
  PICBOOK_BRAVEY: "Little One, You're Brave in Many Ways",
  PICBOOK_BIRTHDAY: 'Birthday Book for You',
  PICBOOK_SANTA: "Santa's Letter for You",
};

const BOOK_DISPLAY_ORDER_RANK: Record<string, number> = {
  PICBOOK_GOODNIGHT3: 0,
  PICBOOK_GOODNIGHT: 0,
  PICBOOK_MOM: 0,
  PICBOOK_DAD: 0,
  PICBOOK_SANTA: 1,
  PICBOOK_BRAVEY: 2,
  PICBOOK_BIRTHDAY: 3,
  PICBOOK_MELODY: 4,
};

const getBookCode = (book: any): string =>
  String((book as any)?.spu_code ?? (book as any)?.id ?? (book as any)?.code ?? '').trim();

const normalizeImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/imgs/picbook/goodnight/封面1.jpg';
  if (imagePath.startsWith('http')) {
    try {
      return encodeURI(imagePath);
    } catch {
      return imagePath;
    }
  }
  let normalized = imagePath.trim();
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  normalized = normalized.replace(/^\/public\//, '/');
  return normalized;
};

const StarRating = ({ rating, reviews }: { rating: number; reviews?: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={i} className="w-3 h-3 text-yellow-400" />
        ))}
        {hasHalfStar && <FaStarHalf className="w-3 h-3 text-yellow-400" />}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <FaStar key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
        ))}
      </div>
      {reviews && <span className="text-xs text-[#222222] ml-1">({reviews})</span>}
    </div>
  );
};

interface BooksPageClientProps {
  books: Product[];
}

export default function BooksPageClient({ books }: BooksPageClientProps) {
  const t = useTranslations('BooksPage');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const searchParams = useSearchParams();

  const shouldOpenFromUrl = useMemo(() => {
    const qp = searchParams?.get('showSearch') || searchParams?.get('search');
    return qp === '1' || qp === 'true' || qp === 'open';
  }, [searchParams]);
  const [showSearch, setShowSearch] = useState<boolean>(shouldOpenFromUrl);
  const pathname = usePathname();

  useEffect(() => {
    if (!shouldOpenFromUrl) return;
    try {
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', pathname);
      }
    } catch {}
  }, [shouldOpenFromUrl, pathname]);

  useEffect(() => {
    if (shouldOpenFromUrl) {
      setShowSearch(true);
    }
  }, [shouldOpenFromUrl]);

  useEffect(() => {
    if (!showSearch) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSearch(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showSearch]);

  const filteredBooks = books.filter((book) => {
    const name = (book as any)?.name ?? (book as any)?.default_name ?? '';
    return String(name).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedBooks = useMemo(() => {
    const base = (filteredBooks || []).map((book, index) => ({
      book,
      index,
      code: getBookCode(book),
      price: getBookListDisplayPrice(book),
    }));

    switch (sortOption) {
      case 'price-low': {
        base.sort((a, b) => (a.price - b.price) || (a.index - b.index));
        return base.map(x => x.book);
      }
      case 'price-high': {
        base.sort((a, b) => (b.price - a.price) || (a.index - b.index));
        return base.map(x => x.book);
      }
      default: {
        base.sort((a, b) => {
          const ar = BOOK_DISPLAY_ORDER_RANK[a.code] ?? Number.MAX_SAFE_INTEGER;
          const br = BOOK_DISPLAY_ORDER_RANK[b.code] ?? Number.MAX_SAFE_INTEGER;
          return (ar - br) || (a.index - b.index);
        });
        return base.map(x => x.book);
      }
    }
  }, [filteredBooks, sortOption]);

  const bestSeller = sortedBooks.length > 0 ? sortedBooks[0] : null;
  const bestSellerImage: string | null = bestSeller
    ? normalizeImageUrl(
        (bestSeller as any)?.primary_image ??
          (bestSeller as any)?.default_cover ??
          '/products/picbooks/PICBOOK_GOODNIGHT3/thumb.png'
      )
    : null;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#222222]">
      {/* Main Content */}
      <main className="mx-auto">
        {/* Hero Section */}
        <section className="block w-full bg-white py-6 px-6 md:h-[164px] md:pt-6 md:pb-6 md:px-[120px]">
          <div className="mx-auto flex flex-col gap-3 md:gap-3 text-center md:text-left">
            <h1
              className="text-[24px] leading-[32px] md:text-[40px] font-semibold md:font-medium text-[#222222] md:leading-[40px]"
              style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
            >
              Who do you want to surprise with this super exciting gift?
            </h1>
            <p
              className="text-[14px] leading-[20px] tracking-[0.25px] text-[#666666] md:text-[16px] md:leading-[24px] md:tracking-[0.5px]"
              style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
            >
              Discover the only hand-drawn personalized books that let your child be the hero of the story.
            </p>
          </div>
        </section>

        {/* Books Grid */}
        {sortedBooks.length > 0 ? (
          <BooksGrid books={sortedBooks} />
        ) : (
          <div className="text-center py-12">
            <p className="text-[#222222]">{t('noResults')}</p>
          </div>
        )}

        {/* Best Seller Section - Mobile Only */}
        {false && bestSeller && bestSellerImage && (
          <section className="md:hidden w-full px-4 pt-8 pb-12">
              <div className="flex flex-col items-center gap-6 pt-4">
                {/* Book Cover Image with Badge */}
                <div className="relative w-full max-w-[150px]">
                  {/* Book Cover Image */}
                  <div className="relative w-full aspect-[3/4] bg-[#F8F8F8] overflow-hidden">
                    <Image
                      src={bestSellerImage!}
                      alt="best seller"
                      fill
                      className="object-cover"
                      unoptimized={bestSellerImage!.startsWith('http')}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement & { srcset?: string };
                        if (!target.dataset.fallbackApplied) {
                          target.dataset.fallbackApplied = '1';
                          target.src = '/products/picbooks/PICBOOK_GOODNIGHT/thumb.png';
                          if (target.srcset) target.srcset = '';
                        }
                      }}
                    />
                  </div>
                  {/* Best Seller Badge - positioned at top-right of book cover, outside container */}
                  <div className="absolute top-0 right-0 z-10 transform translate-x-20 -translate-y-8">
                    <Image src="/best_seller.png" alt="Best seller" width={140} height={40} />
                  </div>
                </div>

                {/* Book Details */}
                <div className="flex flex-col items-center gap-6 w-full">
                  <div className="flex flex-col items-center gap-3 w-full">
                    {/* Title */}
                    <h2 className="text-[#222222] text-[24px] font-normal">
                      {(() => {
                        const idOrCode = (bestSeller as any)?.spu_code ?? (bestSeller as any)?.id ?? (bestSeller as any)?.code ?? '';
                        const originalName = (bestSeller as any)?.name ?? (bestSeller as any)?.default_name ?? 'Bedtime story';
                        return BOOK_NAME_OVERRIDES[String(idOrCode)] || originalName;
                      })()}
                    </h2>

                    {/* Description */}
                    <p className="text-[#222222] text-[14px] font-normal leading-relaxed">
                      {(bestSeller as any)?.description ?? (bestSeller as any)?.desc ?? 'Already, our first group of stars has stepped into the spotlight, discovering the magic of seeing themselves as the heroes of their own personalized stories.'}
                    </p>
                  </div>
                
                  {/* Tags */}
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-block px-3 py-1 text-xs rounded-[4px] bg-[#F3F3F3] text-[#666666]">two people</span>
                      <span className="inline-block px-3 py-1 text-xs rounded-[4px] bg-[#F3F3F3] text-[#666666]">Mom & child</span>
                    </div>
                    {/* Star Rating */}
                    <div className="flex items-center justify-center gap-[6px]">
                      {[...Array(5)].map((_, i) => (
                        <Image key={i} src="/star.svg" alt="star" width={18} height={18} />
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline justify-center gap-1">
                    {(() => {
                      const cur = getBookListDisplayPrice(bestSeller);
                      const mkt = getBookMarketComparePrice(bestSeller, cur);
                      return (
                        <>
                          {mkt > cur && (
                            <span className="text-[#999999] line-through text-[12px]">${mkt.toFixed(2)}</span>
                          )}
                          <span className="text-[#012CCE] text-[24px] font-medium">${cur.toFixed(2)}</span>
                        </>
                      );
                    })()}
                  </div>

                  {/* Personalize Button */}
                  <Link 
                    href={getBookPath(
                      String(
                        (bestSeller as any)?.spu_code ??
                          (bestSeller as any)?.id ??
                          'featured'
                      )
                    )} 
                    className="text-[#222222] text-[16px] font-normal hover:underline flex items-center gap-1"
                  >
                    {t('personalize')} →
                  </Link>
                </div>
              </div>
            </section>
        )}

        {/* Loved by Kids Carousel */}
        <LovedByKidsCarousel
          cards={[
            {
              id: '1',
              title: "Little One, You're Brave in Many Ways",
              description: "It's really me in the book! See? I'm super brave!",
              image: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/loved-by-kids/Brave-MOBILE.png',
              imageDesktop: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/loved-by-kids/Brave.png',
              bookId: 'PICBOOK_BRAVEY',
            },
            {
              id: '2',
              title: 'Birthday Book for You',
              description: "Best birthday gift ever!",
              image: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/loved-by-kids/Birthday-Book-for-You-MOBILE.png',
              imageDesktop: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/loved-by-kids/Birthday-Book-for-You.png',
              bookId: 'PICBOOK_BIRTHDAY',
            },
            {
              id: '3',
              title: "Santa's Letter for You",
              description: "Santa really knows me! I'm really on the nice list!",
              image: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/loved-by-kids/Santa-Letter-for-You-MOBILE.png',
              imageDesktop: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/loved-by-kids/Santa-Letter-for-You.png',
              bookId: 'PICBOOK_SANTA',
            },
            {
              id: '4',
              title: 'Goodnight to You',
              description: "Goodnight bear, goodnight cat, see, I can fly!",
              image: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/loved-by-kids/Good-Night-MOBILE.png',
              imageDesktop: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/loved-by-kids/Good-Night.png',
              bookId: 'PICBOOK_GOODNIGHT3',
            },
          ]}
        />

        {/* Occasions Section */}
        <OccasionsSection />

        {/* Why Families Choose Section */}
        <WhyFamiliesChooseSection />

        <div className="w-full" />
      </main>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSearch(false)} />
          <div className="relative w-full max-w-lg rounded-xl bg-[#FFFFFF] p-4 shadow-xl border border-gray-200">
            <div className="flex items-center gap-2">
              <FaSearch className="text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder={t('searchPlaceholder')}
                className="flex-1 bg-transparent outline-none text-[#222222] placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="px-2 py-1 text-gray-600 hover:text-gray-900"
                onClick={() => setShowSearch(false)}
                aria-label="Close search"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
