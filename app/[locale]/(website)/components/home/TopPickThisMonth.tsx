import { HOME_TOP_PICKS } from '@/constants/cdn';
import { useState, useEffect, useRef } from 'react';
import { FaStar as Star, FaArrowRight as ArrowRight } from 'react-icons/fa';

const TopPickThisMonth = () => {
  const images = [
    HOME_TOP_PICKS('card_1.webp'),
    HOME_TOP_PICKS('card_2.webp'),
    HOME_TOP_PICKS('card_3.webp'),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isHovered, isAnimating, images.length]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="bg-[#FFF7F9] flex items-center justify-center px-4 py-8 md:py-30">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center rounded bg-white p-6">
        <div
          className="relative w-[237px] md:w-[420px] mx-auto lg:mx-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative aspect-square w-full">
            {images.map((image, index) => {
              const isActive = index === currentIndex;
              const isPrev = index === (currentIndex - 1 + images.length) % images.length;

              return (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    isActive ? 'z-10' : isPrev && isAnimating ? 'z-20' : 'z-0 opacity-0 pointer-events-none'
                  }`}
                  style={{
                    transformOrigin: 'bottom left',
                  }}
                >
                  <div
                    className={`w-full h-full bg-white rounded-lg shadow-2xl p-3 md:p-4 ${
                      isClient && window.innerWidth >= 768 ? (
                        isPrev && isAnimating
                          ? 'animate-image-exit'
                          : isActive && !isPrev
                          ? 'animate-image-enter'
                          : ''
                      ) : ''
                    }`}
                    style={{
                      transformOrigin: 'bottom left',
                      transform: isActive && !isAnimating ? 'rotate(6deg)' : undefined,
                    }}
                  >
                    <img
                      src={image}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setIsAnimating(false);
                  }, 500);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="text-center lg:text-left space-y-6 mt-12 lg:mt-0 rounded">
          <h1 className="text-[24px] md:text-[40px] font-medium text-[#222] leading-tight">
            Top Picks This Month
          </h1>

          <div className="space-y-4">
            <h2 className="text-[18px] font-semibold text-[#222222]">
              Santa's Letter For You
            </h2>

            <p className="text-[14px] text-[#222222] md:text-[16px] text-[#666666] leading-relaxed">
              Watch your child's eyes light up as Santa writes directly to them.
              This story reveals the good deeds, hopes, and holiday magic Santa has
              seen in your little one.
              <br/>
              A heartfelt keepsake that turns Christmas into a memory they'll cherish.
            </p>

            <div className="flex gap-1 justify-center lg:justify-start pt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 md:w-7 md:h-7 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>

          <button className="text-[16px] text-[#222222] font-medium flex items-center mx-auto md:ml-0 gap-2 cursor-pointer hover:text-primary transition-colors duration-200 mt-4 md:mt-20">
            Personalize This Book
            <ArrowRight className="w-5 h-5" />
          </button>
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
