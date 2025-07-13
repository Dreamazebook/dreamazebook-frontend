'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaStarHalf, FaSearch, FaFilter } from 'react-icons/fa';
import api from "@/utils/api";
import { BaseBook, ApiResponse } from '@/types/book';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';

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
  const [books, setBooks] = useState<BaseBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('featured');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get<ApiResponse<BaseBook[]>>(`/picbooks`);
        setBooks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch books:', err);
        setError(t('error'));
        setLoading(false);
      }
    };

    fetchBooks();
  }, [t]);

  const filteredBooks = books.filter(book =>
    book.default_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return Number(a.price) - Number(b.price);
      case 'price-high':
        return Number(b.price) - Number(a.price);
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
            {sortedBooks.map((book) => (
              <Link 
                href={`/${locale}/books/${book.id}`} 
                key={book.id} 
                className="group flex flex-col"
              >
                <div className="relative aspect-[3/4] mb-3 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <Image
                    src={book.default_cover}
                    alt={book.default_name}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-black dark:group-hover:text-gray-300 transition-colors">
                  {book.default_name}
                </h3>
                {/* <StarRating rating={book.rating || 0} reviews={book.reviews} /> */}
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  ${book.price}
                </p>
                <button className="mt-2 bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors w-fit">
                  {t('personalize')}
                </button>
              </Link>
            ))}
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
                href={`/${locale}/books/featured`}
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