'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from "@/i18n/routing";
import { FaStar, FaStarHalf, FaSearch, FaFilter } from 'react-icons/fa';
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
          <FaStar key={`empty-${i}`} className="w-3 h-3 text-gray-300 dark:text-gray-500" />
        ))}
      </div>
      {reviews && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({reviews})</span>}
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Books Grid */}
        {sortedBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {sortedBooks.map((book, idx) => {
              const idOrCode = (book as any)?.spu_code ?? (book as any)?.id ?? (book as any)?.code ?? `idx-${idx}`;
              const name = (book as any)?.name ?? (book as any)?.default_name ?? 'Product';
              const primary = (book as any)?.primary_image ?? (book as any)?.default_cover ?? '';
              const imgSrc = primary && typeof primary === 'string' ? normalizeImageUrl(primary) : '/home-page/cover.png';
              const priceVal = (book as any)?.current_price ?? (book as any)?.price ?? 0;
              return (
              <Link 
                href={`/books/${idOrCode}`} 
                key={String(idOrCode)} 
                className="group flex flex-col"
              >
                <div className="relative aspect-[3/4] mb-3 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <Image
                    src={imgSrc}
                    alt={String(name || 'Product image')}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    unoptimized={imgSrc.startsWith('http')}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement & { srcset?: string };
                      target.src = '/home-page/cover.png';
                      if (target.srcset) target.srcset = '';
                    }}
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-black dark:group-hover:text-gray-300 transition-colors">
                  {name}
                </h3>
                {/* <StarRating rating={book.rating || 0} reviews={book.reviews} /> */}
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  ${Number(priceVal).toFixed(2)}
                </p>
                <button className="mt-2 bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors w-fit">
                  {t('personalize')}
                </button>
              </Link>
            )})}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">{t('noResults')}</p>
          </div>
        )}

        {/* Featured Book Section */}
        <section className="mt-16 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('featuredTitle')}</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-square md:aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/featured-book.png"
                alt={t('featuredAlt')}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('featuredBookTitle')}</h3>
              <StarRating rating={5} reviews={24} />
              <p className="text-gray-600 dark:text-gray-300">
                {t('featuredDescription')}
              </p>
              <Link 
                href={`/books/featured`}
                className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors mt-4"
              >
                {t('learnMore')}
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="mt-16 bg-gray-100 dark:bg-gray-800 p-8 rounded-xl">
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
        </section>
      </main>
    </div>
  );
}