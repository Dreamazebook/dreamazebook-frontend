'use client';

import { useRef, useState } from 'react';
import { Link } from '@/i18n/routing';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/pagination';

import type { DisplayBook } from './BookGrid';

// ── Mobile book card (matches design) ─────────────────────────────────

function MobileBookSlide({ book }: { book: DisplayBook }) {
  return (
    <Link
      href={book.href}
      prefetch
      className="flex flex-col items-center text-center px-6"
    >
      <div className={`w-full max-w-[320px] aspect-[4/5] rounded-2xl ${book.bg} flex items-center justify-center overflow-hidden`}>
        <img
          src={book.coverUrl}
          alt={book.name}
          className="w-[78%] h-[88%] object-contain drop-shadow-md"
        />
      </div>

      <h3 className="font-bold text-gray-900 text-xl mt-8 mb-3">
        {book.name}
      </h3>

      <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] mb-4">
        {book.description}
      </p>

      {book.price && (
        <p className="text-gray-900 font-bold text-2xl mb-7">{book.price}</p>
      )}

      <span className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] transition-all text-white text-base font-medium rounded px-7 py-3.5">
        view more <span className="text-lg">→</span>
      </span>
    </Link>
  );
}

// ── Desktop grid card (unchanged look) ─────────────────────────────────

function DesktopBookCard({ book }: { book: DisplayBook }) {
  return (
    <Link
      href={book.href}
      prefetch
      className={`rounded-2xl ${book.bg} overflow-hidden flex flex-col transition-transform hover:scale-[1.02]`}
    >
      <div className="p-4 pb-2 flex items-center justify-center">
        <img
          src={book.coverUrl}
          alt={book.name}
          className="w-full max-w-[200px] h-auto object-contain rounded-lg drop-shadow-md"
        />
      </div>
      <div className="px-4 pb-5 pt-3 flex flex-col flex-1 items-center text-center">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug mb-1">
          {book.name}
        </h3>
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4 flex-1">
          {book.description}
        </p>
        {book.price && (
          <p className="text-gray-900 font-bold text-base mb-3">{book.price}</p>
        )}
        <button className="w-full bg-gray-900 hover:bg-gray-700 active:scale-95 transition-all duration-150 text-white text-sm font-medium py-2.5 px-4 rounded-lg">
          Create my preview
        </button>
      </div>
    </Link>
  );
}

// ── Main client component ──────────────────────────────────────────────

export default function BookGridClient({ books }: { books: DisplayBook[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  if (!books || books.length === 0) return null;

  return (
    <section className="py-10 max-w-5xl mx-auto">
      {/* Heading */}
      <h2 className="block text-4xl font-bold text-gray-900 text-center mb-10 leading-tight px-4">
        Choose a story they&apos;ll love
      </h2>

      {/* ── MOBILE: swipeable carousel ── */}
      <div className="md:hidden">
        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          spaceBetween={0}
          pagination={false}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="book-swiper"
        >
          {books.map((book) => (
            <SwiperSlide key={book.code}>
              <MobileBookSlide book={book} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom dot pagination */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {books.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => swiperRef.current?.slideTo(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === activeIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── DESKTOP: grid ── */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5 px-4">
        {books.map((book) => (
          <DesktopBookCard key={book.code} book={book} />
        ))}
      </div>
    </section>
  );
}