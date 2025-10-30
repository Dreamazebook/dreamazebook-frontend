"use client";

import { HOME_BOOKS } from '@/constants/cdn';
import React, { useRef } from 'react';

type Book = {
  id: string | number;
  title: string;
  desc: string;
  price: string;
  img?: string;
  comingSoon?: boolean;
};

const books: Book[] = [
  {
    id: 1,
    title: "You're Brave in Many Ways",
    desc: "Celebrate your child's courage — big or small",
    price: '$250',
    img: HOME_BOOKS('cover1.png'),
  },
  {
    id: 2,
    title: 'Goodnight to You',
    desc: 'Drift into dreams with a bedtime story that sees you',
    price: '$250',
    img: HOME_BOOKS('cover2.png'),
  },
  {
    id: 3,
    title: 'Your Melody',
    desc: 'Every name has a song, discover the music hidden in yours',
    price: '$250',
    img: HOME_BOOKS('cover3.png'),
  },
  {
    id: 4,
    title: 'Birthday Book to You',
    desc: 'Celebrate the special day with a heartfelt jungle surprise',
    price: '$250',
    img: HOME_BOOKS('cover4.png'),
  },
  {
    id: 5,
    title: "Santa's Letter For You",
    desc: 'A magical letter from Santa, just for your little one',
    price: '$250',
    img: HOME_BOOKS('cover5.png'),
  },
  {
    id: 'soon',
    title: 'New book coming soon',
    desc: 'New books will be online soon, please stay tuned',
    price: '$250',
    comingSoon: true,
  },
];

export default function OurBook() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (distance: number) => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollBy({ left: distance, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (!scrollerRef.current) return;
    const w = scrollerRef.current.clientWidth;
    scrollBy(-Math.round(w * 0.8));
  };

  const handleNext = () => {
    if (!scrollerRef.current) return;
    const w = scrollerRef.current.clientWidth;
    scrollBy(Math.round(w * 0.8));
  };

  const BookCard = ({ book }: { book: Book }) => (
    <div className="bg-white rounded-lg p-4 sm:p-6 text-center shadow-sm">
      <div className="mb-3 sm:mb-4">
        {book.comingSoon ? (
          <div className="flex items-center justify-center h-48 sm:h-56 lg:h-64">
            <div className="text-4xl sm:text-5xl lg:text-6xl text-gray-400">?</div>
          </div>
        ) : (
          <img
            src={book.img}
            alt={book.title}
            className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
          />
        )}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{book.title}</h3>
      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{book.desc}</p>
      <p className="text-lg font-bold text-gray-800">{book.price}</p>
    </div>
  );

  return (
    <div className="bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Our Book</h1>

        {/* Mobile: horizontal swipeable list */}
        <div className="md:hidden relative">
          <div className="absolute z-10 left-2 top-1/2 transform -translate-y-1/2">
            <button
              aria-label="Previous"
              onClick={handlePrev}
              className="bg-white/90 p-2 rounded-full shadow hover:bg-white"
            >
              ‹
            </button>
          </div>

          <div className="absolute z-10 right-2 top-1/2 transform -translate-y-1/2">
            <button
              aria-label="Next"
              onClick={handleNext}
              className="bg-white/90 p-2 rounded-full shadow hover:bg-white"
            >
              ›
            </button>
          </div>

          <div
            ref={scrollerRef}
            className="flex space-x-4 overflow-x-auto px-4 py-4 snap-x snap-mandatory touch-pan-x scrollbar-hide"
          >
            {books.map((book) => (
              <div
                key={`mobile-${book.id}`}
                className="min-w-[78%] flex-shrink-0 snap-start"
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop / tablet: grid */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-6">
          {books.map((book) => (
            <BookCard key={`grid-${book.id}`} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}