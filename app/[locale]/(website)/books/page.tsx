'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Link, usePathname } from "@/i18n/routing";
import { FaStar, FaStarHalf, FaSearch } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import api from "@/utils/api";
// Types for new products API
type Product = {
  spu_code: string;
  name: string;
  category: string;
  current_price: number;
  primary_image: string | null;
  base_price?: string;
  market_price?: string;
  description?: string;
};

type ProductsResponse = {
  success: boolean;
  data: Product[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  meta?: { timestamp: number; version: string };
};
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import ReviewsSection from '../components/reviews/Reviews';

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
        const body = await api.get<ProductsResponse>(`/products`, {
          params: {
            page: 1,
            per_page: 20,
            category: 'picbook',
            language: locale,
          },
        });
        const list = Array.isArray(body?.data) ? body.data : [];
        setBooks(list);
        setPageInfo({
          page: body.pagination?.current_page ?? 1,
          perPage: body.pagination?.per_page ?? list.length,
          total: body.pagination?.total ?? list.length,
          lastPage: body.pagination?.last_page ?? 1,
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
        (bestSeller as any)?.primary_image ?? (bestSeller as any)?.default_cover ?? '/products/picbooks/PICBOOK_GOODNIGHT2/thumb.png'
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
      <main className="mx-auto mt-8">
        {/* Books Grid */}
        {sortedBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 place-items-center">
            {sortedBooks.map((book, idx) => {
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
                        {t('personalize')}
                        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5H17M17 5L12.5 1M17 5L12.5 9" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* <button className="mt-3 bg-black text-white px-4 py-2 rounded-full text-xs md:text-sm font-medium hover:bg-gray-800 transition-colors w-fit">
                    {t('personalize')}
                  </button> */}
                </Link>
              </div>
            )})}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#222222]">{t('noResults')}</p>
          </div>
        )}

        {/* Featured + Newsletter container with consistent padding */}
        <div className="w-full">
          {/* Best Seller Section */}
          {bestSeller && (
            <section className="w-full grid grid-cols-1 md:grid-cols-2 items-center">
              {/* Left: info */}
              <div className="w-full h-[420px] pt-6 pb-6 pr-6 pl-[120px] flex flex-col justify-center gap-22">
                {/* Top block: title, desc, rating/tags */}
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-[#222222] text-[18px] font-medium">{(bestSeller as any)?.name ?? (bestSeller as any)?.default_name ?? 'Best seller'}</p>
                    <p className="text-[#666666] text-[16px]">{(bestSeller as any)?.description ?? (bestSeller as any)?.desc ?? ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Image key={i} src="/star.svg" alt="star" width={16} height={16} />
                    ))}
                    <span className="ml-2 inline-block px-2 py-1 text-xs rounded-full bg-[#F3F3F3] text-[#666666]">two people</span>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-[#F3F3F3] text-[#666666]">Mom & child</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[#012CCE] text-[36px] font-medium">${Number(((bestSeller as any)?.current_price ?? (bestSeller as any)?.price ?? 0)).toFixed(0)}</span>
                    {(bestSeller as any)?.market_price && (
                      <span className="text-[#999999] line-through text-sm">${String((bestSeller as any)?.market_price)}</span>
                    )}
                  </div>
                </div>
                {/* Bottom block: price and CTA */}
                <div>
                  <Link href={`/books/${(bestSeller as any)?.spu_code ?? (bestSeller as any)?.id ?? 'featured'}`} className="inline-block bg-black text-[#F5E3E3] px-4 py-2 rounded">
                    {t('personalize')}
                  </Link>
                </div>
              </div>
              {/* Right: image */}
              <div className="relative bg-[#F8F8F8] w-full h-[420px] flex flex-col gap-6 justify-center items-center">
                <div className="relative w-full flex-1">
                  {bestSellerImage && (
                    <Image
                      src={bestSellerImage}
                      alt="best seller"
                      fill
                      className="object-cover"
                      unoptimized={bestSellerImage.startsWith('http')}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement & { srcset?: string };
                        target.src = '/products/picbooks/PICBOOK_GOODNIGHT2/thumb.png';
                        if (target.srcset) target.srcset = '';
                      }}
                    />
                  )}
                </div>
                {/* Best seller badge in top-right of the tile */}
                <div className="absolute top-8 right-32 z-20 pointer-events-none">
                  <Image src="/best_seller.png" alt="Best seller" width={140} height={40} />
                </div>
              </div>
            </section>
          )}

          {/* Reviews under Best Seller */}
          {bestSeller && (
            <ReviewsSection
              compact
              book={{ rating: '5.0' } as any}
              keywords={[] as any}
              reviews={[] as any}
            />
          )}

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