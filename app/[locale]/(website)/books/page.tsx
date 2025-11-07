'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Link, usePathname } from "@/i18n/routing";
import { FaStar, FaStarHalf, FaSearch } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import api from "@/utils/api";

import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import ReviewsSection from '../components/reviews/Reviews';
import BooksGrid from '../components/books/BooksGrid';
import LovedByKidsCarousel from '../components/books/LovedByKidsCarousel';
import { Product } from '@/types/product';
import { getBooks } from '@/services/bookService';

// 规范化图片地址：
// - 移除以 /public/ 开头的前缀
// - 确保本地静态资源以 / 开头
// - 保留 http(s) 绝对地址
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

export default function BooksPage() {
  const locale = useLocale();
  const t = useTranslations('BooksPage');
  const [books, setBooks] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const [pageInfo, setPageInfo] = useState<{ page: number; perPage: number; total: number; lastPage: number }>({ page: 1, perPage: 0, total: 0, lastPage: 1 });
  const searchParams = useSearchParams();

  // Only reveal the search input after clicking a button or when explicitly opened via URL
  const shouldOpenFromUrl = useMemo(() => {
    const qp = searchParams?.get('showSearch') || searchParams?.get('search');
    return qp === '1' || qp === 'true' || qp === 'open';
  }, [searchParams]);
  const [showSearch, setShowSearch] = useState<boolean>(shouldOpenFromUrl);
  const pathname = usePathname();

  // If opened from URL once, remove the query param to avoid reopening on refresh
  useEffect(() => {
    if (!shouldOpenFromUrl) return;
    // Replace URL without navigation so state is preserved
    try {
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', pathname);
      }
    } catch {}
  }, [shouldOpenFromUrl, pathname]);

  // Open modal reactively when query param appears via in-app navigation
  useEffect(() => {
    if (shouldOpenFromUrl) {
      setShowSearch(true);
    }
  }, [shouldOpenFromUrl]);

  // Close on Escape
  useEffect(() => {
    if (!showSearch) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSearch(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showSearch]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const {data, pagination} = await getBooks(locale);
        const list = Array.isArray(data) ? data : [];
        setBooks(list);
        setPageInfo({
          page: pagination?.current_page ?? 1,
          perPage: pagination?.per_page ?? list.length,
          total: pagination?.total ?? list.length,
          lastPage: pagination?.last_page ?? 1,
        });
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch books:', err);
        setError(t('error'));
        setLoading(false);
      }
    };

    fetchBooks();
  }, [t]);

  const filteredBooks = books.filter((book) => {
    const name = (book as any)?.name ?? (book as any)?.default_name ?? '';
    return String(name).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return Number((a as any)?.current_price ?? (a as any)?.price ?? 0) - Number((b as any)?.current_price ?? (b as any)?.price ?? 0);
      case 'price-high':
        return Number((b as any)?.current_price ?? (b as any)?.price ?? 0) - Number((a as any)?.current_price ?? (a as any)?.price ?? 0);
      default:
        return 0;
    }
  });
  const bestSeller = sortedBooks.length > 0 ? sortedBooks[0] : null;
  const bestSellerImage: string | null = bestSeller
    ? normalizeImageUrl(
        (bestSeller as any)?.primary_image ?? (bestSeller as any)?.default_cover ?? '/products/picbooks/PICBOOK_GOODNIGHT/thumb.png'
      )
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">{t('loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#222222]">
      {/* Header */}
      {/* <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h1>
          
          Search and Filter
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative">
              <select
                className="appearance-none block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="featured">{t('sortFeatured')}</option>
                <option value="price-low">{t('sortPriceLow')}</option>
                <option value="price-high">{t('sortPriceHigh')}</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="mx-auto">
        {/* Hero Section */}
        <section className="hidden md:block w-full bg-white py-12 px-4 md:h-[164px] md:pt-6 md:pb-6 md:pr-[120px] md:pl-[120px]">
          <div className="mx-auto flex flex-col gap-3 md:gap-3">
            <h1
              className="text-[32px] md:text-[40px] font-semibold md:font-medium text-[#222222] md:leading-[40px] leading-tight"
              style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
            >
              Who do you want to surprise with this super exciting gift?
            </h1>
            <p
              className="text-[16px] font-normal text-[#666666] md:leading-[24px] leading-relaxed"
              style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
            >
              Discover the only hand-drawn personalized books that let your child be the hero of the story.
            </p>
          </div>
        </section>

        {/* Books Grid */}
        {sortedBooks.length > 0 ? (
          <BooksGrid books={sortedBooks} personalizeLabel={t('personalize')} />
        ) : (
          <div className="text-center py-12">
            <p className="text-[#222222]">{t('noResults')}</p>
          </div>
        )}

        {/* Best Seller Section - Mobile Only (before LovedByKidsCarousel) */}
        {bestSeller && (
          <section className="md:hidden w-full px-4 pt-8 pb-12">
              <div className="flex flex-col items-center gap-6 pt-4">
                {/* Book Cover Image with Badge */}
                <div className="relative w-full max-w-[150px]">
                  {/* Book Cover Image */}
                  <div className="relative w-full aspect-[3/4] bg-[#F8F8F8] overflow-hidden">
                    {bestSellerImage && (
                      <Image
                        src={bestSellerImage}
                        alt="best seller"
                        fill
                        className="object-cover"
                        unoptimized={bestSellerImage.startsWith('http')}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement & { srcset?: string };
                          target.src = '/products/picbooks/PICBOOK_GOODNIGHT/thumb.png';
                          if (target.srcset) target.srcset = '';
                        }}
                      />
                    )}
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
                      {(bestSeller as any)?.name ?? (bestSeller as any)?.default_name ?? 'Bedtime story'}
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
                    {(bestSeller as any)?.market_price && (
                      <span className="text-[#999999] line-through text-[12px]">${Number((bestSeller as any)?.market_price).toFixed(2)}</span>
                    )}
                    <span className="text-[#012CCE] text-[24px] font-medium">
                      ${Number(((bestSeller as any)?.current_price ?? (bestSeller as any)?.price ?? 0)).toFixed(2)}
                    </span>
                  </div>

                  {/* Personalize Button */}
                  <Link 
                    href={`/books/${(bestSeller as any)?.spu_code ?? (bestSeller as any)?.id ?? 'featured'}`} 
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
              description: "The book is really talking about me! If anyone says I'm not brave, I'll show them this book — then they'll know what being brave really means!",
              image: '/products/picbooks/PICBOOK_YouAreBraveyInManyWays/thumb.png', // 需要替换为实际图片
              bookId: 'PICBOOK_YouAreBraveyInManyWays',
            },
            {
              id: '2',
              title: 'Birthday Book for You',
              description: "I saw some pigeons on the way to school… maybe they'll fly back to the forest and tell the animals my message!",
              image: '/products/picbooks/PICBOOK_GOODNIGHT/thumb.png', // 需要替换为实际图片
              bookId: 'PICBOOK_BIRTHDAY', // 需要替换为实际书籍ID
            },
            {
              id: '3',
              title: "Santa's Letter for You",
              description: "Santa really knows me! He even knows how I've been good… but how did he see all that?!",
              image: '/products/picbooks/PICBOOK_SANTALETTER/thumb.png', // 需要替换为实际图片
              bookId: 'PICBOOK_SANTALETTER',
            },
            {
              id: '4',
              title: 'Goodnight to You',
              description: "It's me!! I can fly! Goodnight bear, goodnight cat… they all sleep so well, I'll sleep nicely too.",
              image: '/products/picbooks/PICBOOK_GOODNIGHT/thumb.png',
              bookId: 'PICBOOK_GOODNIGHT',
            },
          ]}
        />

        {/* Featured + Newsletter container with consistent padding */}
        <div className="w-full">
          {/* Reviews under Best Seller - Mobile Only */}
          {/* {bestSeller && (
            <div className="md:hidden">
              <ReviewsSection
                compact
                book={{ rating: '5.0' } as any}
                keywords={[] as any}
                reviews={[] as any}
              />
            </div>
          )} */}

          {/* Newsletter Section */}
          {/* <section className="mt-16 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('newsletterTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('newsletterSubtitle')}
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  {t('subscribe')}
                </button>
              </form>
            </div>
          </section> */}
        </div>
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