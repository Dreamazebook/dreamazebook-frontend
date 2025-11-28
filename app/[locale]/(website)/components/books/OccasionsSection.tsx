'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface OccasionCard {
  id: string;
  title: string;
  description: string;
  image: string;
  imageDesktop?: string;
  bookId?: string;
}

interface OccasionsSectionProps {
  title?: string;
  description?: string;
  cards?: OccasionCard[];
}

const OccasionsSection: React.FC<OccasionsSectionProps> = ({
  title = 'Little Moments, Lasting Recognition',
  description = 'See how our books brighten every occasion.',
  cards = [
    {
      id: '1',
      title: 'Bedtime',
      description: 'Bring calm, comfort, and connection before sleep.',
      image:
        'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Bedtime-MOBILE.png',
      imageDesktop:
        'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Bedtime.png',
      bookId: 'PICBOOK_GOODNIGHT3',
    },
    {
      id: '2',
      title: 'Everyday',
      description: 'Discover the little acts of bravery in everyday moments.',
      image:
        'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Everyday-MOBILE.png',
      imageDesktop:
        'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Everyday.png',
      bookId: 'PICBOOK_BRAVEY',
    },
    {
      id: '3',
      title: 'Christmas',
      description: 'The most heartfelt gift under the tree.',
      image:
        'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Christmas-Time-MOBILE.png',
      imageDesktop:
        'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Christmas-Time.png',
      bookId: 'PICBOOK_SANTA',
    },
  ],
}) => {
  if (!cards || cards.length === 0) return null;

  const displayedCards = cards.slice(0, 3);
  const textAreaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [maxTextHeight, setMaxTextHeight] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // 检测是否是桌面端
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // 计算并设置所有文案区域的高度为最高值
  useEffect(() => {
    if (!isDesktop) {
      setMaxTextHeight(null);
      return;
    }

    const updateTextHeights = () => {
      const refs = textAreaRefs.current.filter((ref) => ref !== null) as HTMLDivElement[];
      
      if (refs.length === 0) return;

      // 先临时移除所有固定高度，让内容自然渲染
      const originalHeights = refs.map((ref) => {
        const height = ref.style.height;
        const minHeight = ref.style.minHeight;
        ref.style.height = 'auto';
        ref.style.minHeight = 'auto';
        return { height, minHeight };
      });

      // 使用双重 requestAnimationFrame 确保浏览器完成布局重排
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // 再次延迟确保内容完全渲染
          setTimeout(() => {
            // 获取所有元素的实际内容高度（使用 scrollHeight 获取内容高度）
            const heights = refs.map((ref) => ref.scrollHeight);

            // 恢复原始样式
            refs.forEach((ref, index) => {
              if (originalHeights[index].height) {
                ref.style.height = originalHeights[index].height;
              }
              if (originalHeights[index].minHeight) {
                ref.style.minHeight = originalHeights[index].minHeight;
              }
            });

            if (heights.length > 0) {
              const maxHeight = Math.max(...heights);
              setMaxTextHeight(maxHeight);
            }
          }, 50);
        });
      });
    };

    // 使用 requestAnimationFrame 确保在浏览器重绘后计算
    const rafId = requestAnimationFrame(() => {
      // 再次延迟以确保所有内容都已渲染
      setTimeout(updateTextHeights, 100);
    });

    // 监听窗口大小变化，使用防抖避免频繁计算
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateTextHeights, 150);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [displayedCards, isDesktop]);

  return (
    <section
      className="w-full pt-[64px] pr-[24px] pb-[64px] pl-[24px] md:h-[792px] md:pt-[88px] md:pr-[120px] md:pb-[88px] md:pl-[120px]"
      style={{ opacity: 1 }}
    >
      <div className="flex h-full flex-col gap-[24px] md:gap-[48px]">
        {/* 标题区：手机端居中，gap 12，桌面端 gap 24 */}
        <div className="flex h-auto flex-col gap-[12px] text-center md:text-left md:h-[88px] md:gap-[24px]">
          <p
            className="text-center text-[24px] font-semibold leading-[32px] text-[#222222] md:text-left md:text-[40px] md:font-medium md:leading-[40px]"
            style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
          >
            {/* 手机端：在第一个逗号后换行 */}
            <span className="md:hidden">
              {title.includes(',') ? (
                <>
                  {title.substring(0, title.indexOf(',') + 1)}
                  <br />
                  {title.substring(title.indexOf(',') + 1).trim()}
                </>
              ) : (
                title
              )}
            </span>
            {/* 桌面端：正常显示 */}
            <span className="hidden md:inline">{title}</span>
          </p>
          <p className="text-[#666666] mx-auto max-w-[480px] text-[14px] leading-[20px] tracking-[0.25px] text-[#222222] md:mx-0 md:text-[16px] md:leading-[24px] md:tracking-[0.5px]">
            {description}
          </p>
        </div>

        {/* 三张图片卡片容器：手机端 gap 12，桌面端 gap 24 */}
        <div className="flex flex-col gap-[12px] md:min-h-[480px] md:flex-row md:gap-[24px]">
          {displayedCards.map((card, index) => (
            <Link
              key={card.id}
              href={card.bookId ? `/books/${card.bookId}` : '#'}
              className="flex-1"
            >
              <div className="flex h-auto flex-col gap-1 overflow-hidden rounded-[4px] bg-[#F8F0EC] md:h-[480px] md:gap-1">
                {/* 图片区域 - 手机端固定高度，桌面端自适应剩余空间 */}
                <div className="relative h-[240px] w-full flex-shrink-0 overflow-hidden md:h-auto md:flex-1 md:min-h-0">
                  <Image
                    src={isDesktop && card.imageDesktop ? card.imageDesktop : card.image}
                    alt={card.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={false}
                  />
                </div>
            
                {/* 文案区域 - 手机端固定高度，桌面端统一高度且自适应 */}
                <div
                  ref={(el) => {
                    textAreaRefs.current[index] = el;
                  }}
                  className="flex flex-shrink-0 flex-col gap-1 bg-[#FCF2F2] max-h-[116px] p-[24px] md:max-h-none md:px-[24px] md:py-[24px]"
                  style={{
                    opacity: 1,
                    ...(maxTextHeight && isDesktop
                      ? { height: `${maxTextHeight}px` }
                      : {}),
                  }}
                >
                  <p
                    className="text-[18px] font-medium leading-[24px] tracking-[0.15px] text-[#222222]"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    {card.title}
                  </p>
                  <p className="text-[14px] leading-[20px] tracking-[0.25px] text-[#666666] md:text-[16px] md:leading-[24px] md:tracking-[0.5px]">
                    {card.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OccasionsSection;

