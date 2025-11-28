"use client";

// Accept any product detail shape to support new API
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import React, { useState, useEffect, useRef } from 'react'
import { roboto, aLittleMonster } from '@/app/fonts'
import useUserStore from '@/stores/userStore'
import { getBookConfig } from './books/booksConfig'
import toast from 'react-hot-toast'

interface PagePic { id: number; pagenum: number; pagepic: string }

const AutoLoopVideo: React.FC<{ src: string; className?: string }> = ({ src, className }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== video) return;

          const isVisible =
            entry.isIntersecting && entry.intersectionRatio >= 0.4;
          visibleRef.current = isVisible;

          if (isVisible) {
            // 仅在视口内时播放
            video
              .play()
              .catch(() => {
                // 某些浏览器可能仍然阻止自动播放，忽略错误
              });
          } else {
            // 离开视口时暂停并回到开头
            video.pause();
            try {
              video.currentTime = 0;
            } catch {}
          }
        });
      },
      {
        threshold: [0.1, 0.4, 0.75],
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [src]);

  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;

    // 某些浏览器在循环数次后可能忽略 loop，这里在仍可见时手动重播
    if (visibleRef.current) {
      try {
        video.currentTime = 0;
        video.play().catch(() => {});
      } catch {}
    }
  };

  return (
    <video
      ref={videoRef}
      src={src}
      className={className ?? "w-full h-auto"}
      playsInline
      muted
      loop
      onEnded={handleEnded}
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default function BookDetailView({
  book,
  pagePics,
  tags,
  keywords,
  reviews,
  primaryButtonLabel = 'Personalize my book',
  primaryButtonHref,
  onPrimaryClick,
  availableLanguages = ['en', 'zh'],
  bookId,
}: {
  book: any,
  pagePics: PagePic[],
  tags: { tname: string }[],
  keywords: any[],
  reviews: any[],
  primaryButtonLabel?: string,
  primaryButtonHref: string,
  onPrimaryClick?: (e: React.MouseEvent, selectedLanguage: string) => void,
  availableLanguages?: string[],
  bookId?: string | number,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('BookDetail')
  const selectedLanguage = 'en'
  const [openFaq, setOpenFaq] = useState<number>(1)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const sliderRef = useRef<HTMLDivElement | null>(null)

  const description = (book as any)?.description || (book as any)?.variant?.description || 'No description available.'
  
  // 获取书籍配置
  const bookConfig = bookId ? getBookConfig(book, bookId) : null
  // 获取规格信息：优先使用书籍配置，否则使用默认值
  const specifications = bookConfig?.specifications || [
    { label: 'specifications.size' },
    { label: 'specifications.pages' },
    { label: 'specifications.delivery' },
  ]
  
  // 获取 FAQ 信息：优先使用书籍配置，否则使用默认值
  const faqs = bookConfig?.faqs || [
    { question: t('faq.title'), answer: t('faq.description') },
    { question: t('faq.title'), answer: t('faq.description') },
    { question: t('faq.title'), answer: t('faq.description') },
  ]
  
  // 渲染规格文本：如果是国际化 key（以 'specifications.' 开头），则使用 t()，否则直接显示
  const getSpecificationText = (spec: { label: string; value?: string }) => {
    if (spec.label.startsWith('specifications.')) {
      return t(spec.label)
    }
    return spec.label
  }

  const handleMobileScroll = () => {
    if (!sliderRef.current) return
    const { scrollLeft, clientWidth } = sliderRef.current
    if (!clientWidth) return
    const index = Math.round(scrollLeft / clientWidth)
    const clamped = Math.max(0, Math.min(pagePics.length - 1, index))
    if (clamped !== currentPageIndex) {
      setCurrentPageIndex(clamped)
    }
  }

  const scrollToPage = (index: number) => {
    if (!sliderRef.current || pagePics.length === 0) return
    const clamped = Math.max(0, Math.min(pagePics.length - 1, index))
    const container = sliderRef.current
    const width = container.clientWidth
    container.scrollTo({
      left: clamped * width,
      behavior: 'smooth',
    })
    setCurrentPageIndex(clamped)
  }

  const handlePrevPage = () => {
    scrollToPage(currentPageIndex - 1)
  }

  const handleNextPage = () => {
    scrollToPage(currentPageIndex + 1)
  }

  return (
    <div className={`min-h-screen bg-white ${roboto.className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-fit">
          {/* 手机端：左右滑动查看图片，高度固定为 300px */}
          <div className="block md:hidden w-full">
            <div className="relative w-full h-[300px]">
              <div
                ref={sliderRef}
                onScroll={handleMobileScroll}
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory gap-3"
              >
                {pagePics.map((page) => {
                  const src = page.pagepic;
                  const lower = src.toLowerCase();
                  const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm');

                  return (
                    <div
                      key={page.id}
                      className="flex-shrink-0 w-full snap-center flex items-center justify-center bg-[#F8F8F8]"
                    >
                      {isVideo ? (
                        <AutoLoopVideo src={src} className="h-full w-auto" />
                      ) : (
                        <img
                          src={src}
                          alt={`Page ${page.pagenum}`}
                          className="h-full w-auto object-contain"
                          loading={page.pagenum === 1 ? 'eager' : 'lazy'}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 翻页箭头 */}
              {pagePics.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPageIndex === 0}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#222222] shadow ${
                      currentPageIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'opacity-100'
                    }`}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPageIndex === pagePics.length - 1}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#222222] shadow ${
                      currentPageIndex === pagePics.length - 1 ? 'opacity-40 cursor-not-allowed' : 'opacity-100'
                    }`}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </>
              )}

              {/* 页码指示器 */}
              {pagePics.length > 0 && (
                <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#222222]/70 px-3 py-1 text-xs text-white">
                  {currentPageIndex + 1} / {pagePics.length}
                </div>
              )}
            </div>
          </div>

          {/* 桌面端：保持原有的纵向展示方式 */}
          <div className="hidden md:grid grid-cols-1 gap-0">
            {pagePics.map((page) => {
              const src = page.pagepic;
              const lower = src.toLowerCase();
              const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm');

              return (
                <div key={page.id} className="w-full">
                  <div className="relative w-full">
                    {isVideo ? (
                      <AutoLoopVideo src={src} />
                    ) : (
                      <img
                        src={src}
                        alt={`Page ${page.pagenum}`}
                        className="w-full h-auto"
                        loading={page.pagenum === 1 ? 'eager' : 'lazy'}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sticky top-0 h-screen overflow-y-auto">
          <div className="max-w-xl mx-auto md:p-12 px-3 py-2 min-h-0 flex flex-col gap-6">
            <div className="flex flex-col md:gap-3 gap-2">
              <h1 className="md:text-[36px] text-[24px] md:leading-[44px] leading-[32px] font-normal">{(book as any)?.name ?? (book as any)?.default_name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex gap-[6px]">
                  {[...Array(5)].map((_, i) => (
                    <Image key={i} src="/star.svg" alt="star" width={20} height={20} className="w-[18px] h-[18px] md:w-5 md:h-5" />
                  ))}
                </div>
                {tags && tags.map((tag, index) => (
                  <span key={index} className="text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px] text-[#666666] bg-[#F2F2F2] px-2 rounded">{tag.tname}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:gap-3 gap-2">
              <div className="text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px] text-[#222222] bg-[#F8F8F8] p-3 rounded-[12px]">
                <p dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br/>') }} />
              </div>

              <div className="text-sm space-y-3">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex items-center gap-[8px]">
                    <div className="w-4 h-4 bg-[#D9D9D9] rounded"></div>
                    <span className="text-[#666666]">{getSpecificationText(spec)}</span>
                  </div>
                ))}
              </div>
            </div>
            

            {/* 语言选择已隐藏，默认使用英文 */}

            {/* 价格和按钮 - 桌面端显示，手机端隐藏（手机端使用贴底栏） */}
            <div className="hidden md:flex items-end justify-between gap-8">
              <div className="flex items-baseline gap-3">
                <span className="text-[#012CCE] text-[36px] leading-[44px] font-medium">
                  ${Number((book as any)?.default_sku?.current_price ?? (book as any)?.current_price ?? (book as any)?.price ?? 0).toFixed(2)}
                </span>
                <span className="text-gray-400 text-[16px] leading-[24px] tracking-[0.15px] line-through">
                  ${Number((book as any)?.default_sku?.market_price ?? (book as any)?.market_price ?? ((Number((book as any)?.price ?? 0) * 1.25) || 0)).toFixed(2)}
                </span>
              </div>
              {(() => {
                const isBirthday =
                  bookId === 'PICBOOK_BIRTHDAY' ||
                  (book as any)?.id === 'PICBOOK_BIRTHDAY' ||
                  (book as any)?.spu_code === 'PICBOOK_BIRTHDAY';
                const buttonLabel = isBirthday ? 'Notify Me for Next Release' : primaryButtonLabel;

                const handleButtonClick = (e: React.MouseEvent) => {
                  if (isBirthday) {
                    e.preventDefault();
                    toast.success(
                      <div>
                        <div>On it! ✓</div>
                        <div>We&apos;ve saved your request.</div>
                      </div>,
                      {
                        duration: 4000,
                        style: {
                          borderRadius: '4px',
                          background: '#222222',
                          color: '#F5E3E3',
                        },
                      }
                    );
                  } else {
                    setIsLoading(true);
                    onPrimaryClick?.(e, selectedLanguage);
                  }
                };

                return (
                  <div className="flex flex-col">
                    {isBirthday && (
                      <div className={`bg-[#FFF5F5] text-[#C32026] text-[16px] leading-[24px] tracking-[0.5px] px-6 rounded-[4px] whitespace-nowrap ${aLittleMonster.className}`}>
                        — First Batch Sold Out —
                      </div>
                    )}
                    {isBirthday ? (
                      <button
                        onClick={handleButtonClick}
                        className={`bg-[#222222] text-[#F5E3E3] w-[243px] h-[44px] px-4 py-3 rounded-[4px] hover:bg-gray-800 transition-colors text-base font-medium flex items-center justify-center ${
                          isLoading ? 'opacity-75 cursor-wait pointer-events-none' : ''
                        }`}
                      >
                        {buttonLabel}
                      </button>
                    ) : (
                      <Link
                        href={`${primaryButtonHref}${primaryButtonHref.includes('?') ? '&' : '?'}language=${encodeURIComponent(selectedLanguage)}`}
                        onClick={handleButtonClick}
                        className={`bg-[#222222] text-[#F5E3E3] w-[243px] h-[44px] px-4 py-3 rounded-[4px] hover:bg-gray-800 transition-colors text-base font-medium flex items-center justify-center ${
                          isLoading ? 'opacity-75 cursor-wait pointer-events-none' : ''
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 mr-2"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Loading...
                          </>
                        ) : (
                          buttonLabel
                        )}
                      </Link>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="border-gray-200 md:pt-0 pt-8">
              {faqs.map((faq, index) => {
                const num = index + 1;
                const isLast = index === faqs.length - 1;
                return (
                  <div key={index} className={isLast ? "" : "border-b-[1px] border-gray-200"}>
                    <button 
                      className="w-full flex justify-between items-center gap-4" 
                      onClick={() => setOpenFaq(openFaq === num ? 0 : num)}
                      style={{ paddingTop: '12px', paddingBottom: openFaq === num ? '0px' : '12px' }}
                    >
                      <h3 className="md:text-[18px] text-[16px] leading-[24px] tracking-[0.15px] font-medium text-left flex-1 min-w-0">{String(num).padStart(2, '0')} {faq.question}</h3>
                      <span className="text-2xl flex-shrink-0">{openFaq === num ? '-' : '+'}</span>
                    </button>
                    {openFaq === num && (
                      <div className="text-[#222222] mt-4 pb-4 md:text-[16px] md:leading-[24px] md:tracking-[0.5px] text-[14px] leading-[20px] tracking-[0.25px]">
                        {faq.answer.split('\n').map((line, i) => {
                          // 如果行以 "- " 开头，渲染为 bullet point
                          if (line.trim().startsWith('- ')) {
                            return (
                              <div key={i} className="flex items-start mb-2">
                                <span className="mr-2">•</span>
                                <span>{line.trim().substring(2)}</span>
                              </div>
                            );
                          }
                          // 普通文本行
                          return line.trim() ? (
                            <div key={i} className={i > 0 && !faq.answer.split('\n')[i - 1].trim().startsWith('- ') ? 'mt-2' : ''}>
                              {line}
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



