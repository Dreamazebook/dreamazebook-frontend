'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface CarouselCard {
  id: string;
  title: string;
  description: string;
  image: string;
  imageDesktop?: string;
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
  const isDesktopRef = useRef<boolean>(false);

  // 根据 bookId 获取文本区域底部颜色
  const getTextAreaBottomColor = (bookId: string): string => {
    if (bookId.includes('GOODNIGHT')) {
      return '#012CCE'; // Good-night
    } else if (bookId.includes('BIRTHDAY')) {
      return '#FFA336'; // Birthday
    } else if (bookId.includes('SANTA')) {
      return '#FF6544'; // Santa
    } else if (bookId.includes('BRAVEY')) {
      return '#2A9F82'; // Brave
    }
    return '#2A9F82'; // 默认颜色
  };

  // 响应式调整显示的卡片数量
  React.useEffect(() => {
    const updateCardsToShow = () => {
      const isDesktop = window.innerWidth >= 1024;
      isDesktopRef.current = isDesktop;
      setCardsToShow(isDesktop ? 3 : 2); // lg breakpoint (1024px)
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
    <section className="w-full md:py-22 py-16 bg-white flex flex-col md:gap-12 gap-6 overflow-x-hidden">
      <div className="gap-12 md:px-30 px-3">
        {/* Section Title */}
        <h2
          className="md:text-[40px] text-[24px] md:font-medium font-semibold text-[#222222] leading-[40px] text-center md:text-left"
          style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
        >
          Loved by Kids, Chosen by Kids
        </h2>
      </div>

      {/* Carousel Container - 突破容器限制，延伸到边缘 */}
      <div className="relative w-full overflow-x-hidden">
        {/* 左-中-右 */}
        {(() => {
          if (!cards || cards.length === 0) return null;
          const centerIdx = ((currentIndex % cards.length) + cards.length) % cards.length;
          const prevIdx = (centerIdx - 1 + cards.length) % cards.length;
          const nextIdx = (centerIdx + 1) % cards.length;

          // 统一使用绝对定位 + transform 的方式，并通过 scale 实现中间卡片放大
          const renderAnimatedCard = (
            card: CarouselCard,
            position: 'prev' | 'center' | 'next'
          ) => {
            const isDesktop = isDesktopRef.current;
            const baseW = isDesktop ? 800 : 280;
            const baseH = isDesktop ? 450 : 361; // 中间卡片的高度 → 用于固定容器高度
            const gap = isDesktop ? 32 : 18;
            // 左右卡片的目标缩放（模拟 480x270 与 800x450 的比例 ≈ 0.6）
            const sideScale = isDesktop ? 0.6 : 0.9; // 移动端原设计 325/361 ≈ 0.9
            const centerScale = 1;

            // 计算 X 位移：prev 在左，next 在右
            const offsetX =
              position === 'center'
                ? 0
                : (position === 'prev' ? -1 : 1) * (baseW * 0.5 + baseW * sideScale * 0.5 + gap / 2);

            // 桌面端：调整左右两张卡片的垂直对齐
            // - 左侧（prev）：底部与母容器底部对齐 → 向下偏移 baseH*(1 - sideScale)
            // - 右侧（next）：贴母容器顶部 → 不偏移
            // - 中间（center）：不偏移
            // 以元素中心为 transform-origin 时的垂直位移修正：
            // - 为了让左侧卡片底部贴近容器底部，需要下移 (baseH - sideScale*baseH)/2
            // - 为了让右侧卡片贴近容器顶部，需要上移同样的距离
            const sideDelta = isDesktop ? (baseH * (1 - sideScale)) / 2 : 0;
            const offsetY = isDesktop
              ? (position === 'prev' ? sideDelta : position === 'next' ? -sideDelta : 0)
              : 0;

            const scale = position === 'center' ? centerScale : sideScale;
            const zIndex = position === 'center' ? 20 : 10;
            const opacity = 1;

            return (
              <Link
                key={card.id}
                href={`/books/${card.bookId}`}
                className="absolute left-1/2 top-0 will-change-transform"
                style={{
                  width: `${baseW}px`,
                  height: `${baseH}px`,
                  transform: `translateX(calc(-50% + ${offsetX}px)) translateY(${offsetY}px) scale(${scale})`,
                  transition: 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 450ms',
                  zIndex,
                  opacity,
                }}
              >
                <div className="relative w-full h-full bg-white">
                  {/* 图片容器：负责圆角和裁剪 */}
                  <div
                    className={`absolute inset-0 ${isDesktop ? 'rounded-[12px]' : 'rounded-[8px]'} overflow-hidden`}
                  >
                    <Image
                      src={isDesktop ? (card.imageDesktop || card.image) : card.image}
                      alt={card.title}
                      fill
                      className="object-top object-cover"
                      sizes="(max-width: 768px) 90vw, 33vw"
                    />
                    <div
                      className="absolute inset-0"
                      // style={{
                      //   background:
                      //     'linear-gradient(206.13deg, rgba(249, 232, 232, 0) 32.16%, #F9E8E8 75.03%)',
                      // }}
                    />
                  </div>

                  {/* 文案容器：只在中间卡片显示，固定相对卡片底部的距离，可以超出卡片边界 */}
                  {position === 'center' && (
                    <div
                      className={`absolute flex flex-col z-30 text-white gap-3 rounded ${
                        isDesktop ? 'w-[613px] px-8 py-6' : 'w-[260px] p-6'
                      }`}
                      style={{
                        right: isDesktop ? -12 : -16, // 固定与卡片右侧的水平距离
                        bottom: isDesktop ? -12 : -8, // 固定与卡片底部的垂直距离
                        backgroundColor: getTextAreaBottomColor(card.bookId), // 根据书籍类型设置底部颜色
                      }}
                    >
                      <p
                        className="md:text-[16px] text-[14px] md:leading-[24px] leading-[20px] md:tracking-[0.5px] tracking-[0.25px]"
                      >
                        {card.description}
                      </p>
                      <h3
                        className="text-[16px] leading-[24px] tracking-[0.15px] min-w-0"
                      >
                        {card.title.split(' ').slice(0, -1).join(' ')}
                        {' '}
                        <span className="whitespace-nowrap inline-flex items-center text-white">
                          {card.title.split(' ').slice(-1)[0]}
                          <svg
                            width="18"
                            height="10"
                            viewBox="0 0 18 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="ml-[10px] flex-shrink-0"
                          >
                            <path
                              d="M0.75 4.75H16.75M16.75 4.75L12.25 0.75M16.75 4.75L12.25 8.75"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </h3>
                    </div>
                  )}
                </div>
              </Link>
            );
          };

          const isDesktop = isDesktopRef.current;
          const baseH = isDesktop ? 450 : 361;
          // 文本气泡相对于卡片底部有一个固定的向下偏移量
          const extraBottom = isDesktop ? 24 : 8;
          // 统一容器高度需要把这段偏移也包含进去，否则内容会在容器内产生垂直滚动
          const containerH = baseH + extraBottom;

          return (
            <>
              {/* 统一容器：固定高度，避免滑动时高度抖动 */}
              <div
                className="relative w-full overflow-x-hidden overflow-y-visible"
                style={{
                  height: containerH,
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {renderAnimatedCard(cards[prevIdx], 'prev')}
                {renderAnimatedCard(cards[centerIdx], 'center')}
                {renderAnimatedCard(cards[nextIdx], 'next')}
              </div>
            </>
          );
        })()}

        {/* Navigation Arrows - 仅桌面端显示 */}
        <button
          onClick={prevSlide}
          className="hidden lg:flex absolute top-25 w-12 h-12 rounded-full bg-transparent border border-[#222222] items-center justify-center hover:bg-[#F9E8E8] transition-colors z-10"
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
          className="hidden lg:flex absolute right-0 bottom-25 w-12 h-12 rounded-full bg-transparent border border-[#222222] items-center justify-center hover:bg-[#F9E8E8] transition-colors z-10"
          style={{
            left: 'calc(50% + 400px + 16px)',
          }}
          aria-label="Next slide"
        >
          <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.75 4.75H16.75M16.75 4.75L12.25 0.75M16.75 4.75L12.25 8.75" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* 分页指示器 - 移动端和小屏幕显示 */}
      <div className="lg:hidden flex items-center justify-center gap-3">
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

