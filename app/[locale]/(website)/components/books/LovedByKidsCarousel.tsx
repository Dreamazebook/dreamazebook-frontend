'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface CarouselCard {
  id: string;
  title: string;
  description: string;
  image: string;
  bookId: string; // 用于链接到书籍详情页
}

interface LovedByKidsCarouselProps {
  cards: CarouselCard[];
}

const LovedByKidsCarousel: React.FC<LovedByKidsCarouselProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(2); // 默认移动端显示 2 张

  // 响应式调整显示的卡片数量
  React.useEffect(() => {
    const updateCardsToShow = () => {
      setCardsToShow(window.innerWidth >= 768 ? 3 : 2);
    };
    updateCardsToShow();
    window.addEventListener('resize', updateCardsToShow);
    return () => window.removeEventListener('resize', updateCardsToShow);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  if (!cards || cards.length === 0) return null;

  return (
    <section className="w-full py-12 md:py-16 bg-white flex flex-col gap-6 md:gap-12">
      <div className="md:gap-12 px-4 md:px-8">
        {/* Section Title */}
        <h2
          className="text-center md:text-left text-[24px] md:text-[40px] font-semibold md:font-medium text-[#222222]"
          style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
        >
          Loved by kids, chosen by kids
        </h2>
      </div>

      {/* Carousel Container - 突破容器限制，延伸到边缘 */}
      <div className="relative w-full">
        {/* 左-中-右 */}
        {(() => {
          if (!cards || cards.length === 0) return null;
          const centerIdx = ((currentIndex % cards.length) + cards.length) % cards.length;
          const prevIdx = (centerIdx - 1 + cards.length) % cards.length;
          const nextIdx = (centerIdx + 1) % cards.length;

          const renderCard = (card: CarouselCard, isCenter: boolean, align?: 'start' | 'end') => (
            <Link
              key={card.id}
              href={`/books/${card.bookId}`}
              className={`relative overflow-hidden rounded-[12px] bg-white shrink-0 ${
                isCenter ? 'w-[800px] h-[450px]' : 'w-[480px] h-[270px] hidden md:block'
              } ${align === 'start' ? 'self-start' : align === 'end' ? 'self-end' : ''}`}
            >
              {/* Image */}
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 90vw, 33vw"
              />
              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(255,240,245,0.95) 0%, rgba(255,240,245,0.7) 30%, transparent 60%)',
                }}
              />
              {/* Text */}
              <div
                className="absolute inset-0 flex flex-col justify-end"
                style={{
                  paddingTop: '88px',
                  paddingRight: '48px',
                  paddingBottom: '48px',
                  paddingLeft: '48px',
                  gap: '4px',
                }}
              >
                <h3
                  className="text-[#222222] text-[18px] md:text-[20px] font-semibold"
                  style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-[#666666] text-[14px] md:text-[16px] leading-relaxed"
                  style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                >
                  {card.description}
                </p>
              </div>
            </Link>
          );

          return (
            <>
              {/* 桌面端：左右小卡片各露出50%，中间完整显示 */}
              <div className="hidden md:block w-full overflow-hidden">
                <div className="flex items-start justify-center gap-4">
                  {renderCard(cards[prevIdx], false, 'end')}
                  {renderCard(cards[centerIdx], true)}
                  {renderCard(cards[nextIdx], false, 'start')}
                </div>
              </div>
              {/* 小屏仅展示中间卡片 */}
              <div className="md:hidden flex items-center justify-center px-4">
                {renderCard(cards[centerIdx], true)}
              </div>
            </>
          );
        })()}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute top-25 w-12 h-12 rounded-full bg-white border border-[#222222] flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          style={{
            left: 'calc(50% - 400px - 48px - 16px)',
          }}
          aria-label="Previous slide"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="#222222"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-0 bottom-25 w-12 h-12 rounded-full bg-[#012CCE] flex items-center justify-center hover:bg-[#0119A3] transition-colors z-10"
          style={{
            left: 'calc(50% + 400px + 16px)',
          }}
          aria-label="Next slide"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default LovedByKidsCarousel;

