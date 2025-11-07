'use client';

import React, { useState, useRef } from 'react';
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
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // 触摸事件处理
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
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

          const renderCard = (
            card: CarouselCard,
            isCenter: boolean,
            align?: 'start' | 'end',
            isMobile?: boolean
          ) => (
            <Link
              key={card.id}
              href={`/books/${card.bookId}`}
              className={`relative overflow-hidden bg-white shrink-0 ${
                isMobile
                  ? isCenter
                    ? 'w-[280px] h-[361px] rounded-[8px]'
                    : 'w-[280px] h-[325px] rounded-[8px]'
                  : isCenter
                  ? 'w-[800px] h-[450px] rounded-[12px]'
                  : 'w-[480px] h-[270px] rounded-[12px] hidden md:block'
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
                  background: 'linear-gradient(206.13deg, rgba(249, 232, 232, 0) 32.16%, #F9E8E8 75.03%)',
                }}
              />
              {/* Text */}
              {(!isMobile || isCenter) && (
                <div
                  className={`absolute inset-0 flex flex-col justify-end ${
                    isMobile ? 'items-start' : ''
                  }`}
                  style={{
                    paddingTop: isMobile ? '0' : '88px',
                    paddingRight: isMobile ? '24px' : '48px',
                    paddingBottom: isMobile ? '24px' : '48px',
                    paddingLeft: isMobile ? '24px' : '48px',
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
              )}
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
              {/* 移动端：中央卡片完全显示，左右卡片部分可见（peek效果） */}
              <div 
                className="md:hidden w-full overflow-hidden relative"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div className="flex items-center justify-center" style={{ gap: '18px' }}>
                  {renderCard(cards[prevIdx], false, undefined, true)}
                  {renderCard(cards[centerIdx], true, undefined, true)}
                  {renderCard(cards[nextIdx], false, undefined, true)}
                </div>
              </div>
            </>
          );
        })()}

        {/* Navigation Arrows - 仅桌面端显示 */}
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute top-25 w-12 h-12 rounded-full bg-white border border-[#222222] items-center justify-center hover:bg-gray-50 transition-colors z-10"
          style={{
            left: 'calc(50% - 400px - 48px - 16px)',
          }}
          aria-label="Previous slide"
        >
          <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.75 4.75H0.75M0.75 4.75L5.25 0.75M0.75 4.75L5.25 8.75" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-0 bottom-25 w-12 h-12 rounded-full bg-[#012CCE] items-center justify-center hover:bg-[#0119A3] transition-colors z-10"
          style={{
            left: 'calc(50% + 400px + 16px)',
          }}
          aria-label="Next slide"
        >
          <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.75 4.75H16.75M16.75 4.75L12.25 0.75M16.75 4.75L12.25 8.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* 分页指示器 - 仅移动端显示 */}
      <div className="md:hidden flex items-center justify-center gap-3">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-[#012CCE]' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default LovedByKidsCarousel;

