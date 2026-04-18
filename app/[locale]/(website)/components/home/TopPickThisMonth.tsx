import { HOME_TOP_PICKS } from '@/constants/cdn';
import { BOOK_DETAIL_URL } from '@/constants/links';
import { Link } from '@/i18n/routing';
import { useState, useEffect, useRef } from 'react';

import { Star } from '@/utils/icons';
import Image from '../common/Image';

const TopPickThisMonth = () => {
  const images = [
    HOME_TOP_PICKS('card-1.png'),
    HOME_TOP_PICKS('card-2.png'),
    HOME_TOP_PICKS('card-3.png'),
  ];

  const images_mobile = [
    HOME_TOP_PICKS('card-1-mobile.png'),
    HOME_TOP_PICKS('card-2-mobile.png'),
    HOME_TOP_PICKS('card-3-mobile.png'),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setIsClient(true);

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  const imagesToShow = isMobile ? images_mobile : images;

  useEffect(() => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 如果正在hover或动画中，不启动新的定时器
    if (isHovered || isAnimating) {
      return;
    }

    // 启动3秒后切换的定时器
    timeoutRef.current = window.setTimeout(() => {
      setIsAnimating(true);
      // 0.5秒动画结束后切换到下一张
      setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % imagesToShow.length);
          setIsAnimating(false);
        }, 500);
      }, 3000);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [currentIndex, isHovered, isAnimating, imagesToShow.length]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // hover结束后，延迟3S再恢复自动切换
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setIsHovered(false);
    }, 3000);
  };

  return (
    <div className="bg-[#FFF7F9] flex items-center justify-center pt-[135px] px-[24px] pb-[64px] md:pt-[120px] md:pb-[88px]">
      <div className="max-w-[1200px] w-full relative">
        {/* 图片容器 - 超出白色背景 */}
        <div
          className="relative w-[237px] md:w-[420px] mx-auto -mt-[135px] md:-mt-[80px] md:absolute md:left-0 md:-ml-[40px]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative aspect-square w-full">
            {/* 堆叠背景层 */}
            <div className="hidden md:block absolute inset-0 bg-white rounded shadow" style={{
              transform: 'translate(12px, 12px) rotate(2deg)',
              zIndex: 2,
              opacity: 0.6,
            }} />
            <div className="hidden md:block absolute inset-0 bg-white rounded shadow" style={{
              transform: 'translate(24px, 24px) rotate(-2deg)',
              zIndex: 1,
              opacity: 0.3,
            }} />

            {/* 主卡片层 */}
            {imagesToShow.map((image, index) => {
              const isActive = index === currentIndex;
              const isNext = index === (currentIndex + 1) % imagesToShow.length;

              // 只显示当前图片和下一张图片
              if (!isActive && !isNext) {
                return null;
              }

              return (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ease-out`}
                  style={{
                    zIndex: isActive ? 10 : 5,
                    transformOrigin: 'bottom left',
                  }}
                >
                  <div
                    className={`w-full h-full bg-white rounded shadow ${
                      isClient
                        ? isActive && isAnimating
                          ? 'animate-image-exit'
                          : isNext && isAnimating
                          ? 'animate-image-enter'
                          : ''
                        : ''
                    }`}
                    style={{
                      transformOrigin: 'bottom left',
                      transform:
                        isClient && isActive && !isAnimating
                          ? 'rotate(6deg)'
                          : undefined,
                    }}
                  >
                    <Image
                      src={image}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 白色内容区域 */}
        <div className="flex justify-end gap-8 items-center rounded bg-white p-6 md:ml-[220px]">
          {/* <div className="hidden md:block" /> */}

          <div className="text-center lg:text-left space-y-6 mt-12 lg:mt-0 rounded md:w-[70%]">
          <h1 className="text-[24px] md:text-[40px] font-medium text-[#222] leading-tight">
            Top Picks This Month
          </h1>

          <div className="space-y-[16px]">
            <h2 className="text-[18px] font-semibold text-[#222222]">
              The Way I See You, Mama
            </h2>

            <p className="text-[14px] text-left text-[#222222] md:text-[16px] text-[#666666] leading-relaxed">
              Have you ever wondered how your child sees you through their eyes?<br/>
              From Mama’s smile to her hugs and gentle hands, this book captures all the little things your child loves most about you.<br/>
              You can even include your child’s own drawings to create a keepsake full of love and memories.
            </p>

            <div className="flex gap-1 justify-center lg:justify-start pt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 md:w-7 md:h-7 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>

          <Link href={BOOK_DETAIL_URL('PICBOOK_MOM')} className="text-[16px] text-[#222222] justify-center md:justify-start font-medium flex items-center mx-auto md:ml-0 gap-2 cursor-pointer hover:text-primary transition-colors duration-200 mt-4 md:mt-20">
            Personalize This Book
            <Image alt='Personalize' src="/images/common/arrow-black.svg" className="w-5 h-5" />
          </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          @keyframes image-exit {
            0% {
              transform: rotate(6deg);
              opacity: 1;
            }
            100% {
              transform: rotate(0deg);
              opacity: 0;
            }
          }

          @keyframes image-enter {
            0% {
              transform: rotate(10deg);
              opacity: 0.5;
            }
            100% {
              transform: rotate(6deg);
              opacity: 1;
            }
          }

          .animate-image-exit {
            animation: image-exit 0.5s ease-out forwards;
            transform-origin: bottom left;
          }

          .animate-image-enter {
            animation: image-enter 0.5s ease-out forwards;
            transform-origin: bottom left;
          }
        }
      `}</style>
    </div>
  );
};

export default TopPickThisMonth;
