"use client";

// Accept any product detail shape to support new API
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import React, { useState, useEffect, useRef } from 'react'
import { roboto } from '@/app/fonts'
import useUserStore from '@/stores/userStore'
import { getBookConfig } from './books/booksConfig'
import { getBookListDisplayPrice, getBookMarketComparePrice } from '@/utils/bookDisplayPrice'

interface PagePic { id: number; pagenum: number; pagepic: string }

const AutoLoopVideo: React.FC<{ src: string; className?: string; isActive?: boolean }> = ({ src, className, isActive = true }) => {
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

          if (isVisible && isActive) {
            // 仅在视口内时播放
            video
              .play()
              .catch(() => {
                // 某些浏览器可能仍然阻止自动播放，忽略错误
              });
          } else {
            // 离开视口或非激活时暂停并回到开头
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
  }, [src, isActive]);

  // 当轮播 active 状态变化时，立即控制播放/暂停
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!isActive) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {}
    }
  }, [isActive]);

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
      className={className ?? "w-full h-auto"}
      playsInline
      muted
      loop
      onEnded={handleEnded}
    >
      {(() => {
        const lower = src.toLowerCase();
        const hasExt = lower.endsWith('.mp4') || lower.endsWith('.webm');
        if (hasExt) {
          const base = src.replace(/\.(mp4|webm)$/i, '');
          const mp4Src = `${base}.mp4`;
          const webmSrc = `${base}.webm`;
          return (
            <>
              {/* iOS / 大部分浏览器优先使用 mp4 */}
              <source src={mp4Src} type="video/mp4" />
              {/* Chrome 等支持 webm 的浏览器可用 webm */}
              {webmSrc !== mp4Src && <source src={webmSrc} type="video/webm" />}
            </>
          );
        }
        // 兜底：使用原始 src
        return <source src={src} />;
      })()}
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
  hidePriceAndButton = false,
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
  hidePriceAndButton?: boolean,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('BookDetail')
  const selectedLanguage = 'en'
  const [openFaq, setOpenFaq] = useState<number>(1)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const scrollTimeoutRef = useRef<number | null>(null)

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

    // 防抖，避免在滚动过程中高频 setState 导致数字闪烁
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      if (!sliderRef.current) return
      const { scrollLeft: latestScrollLeft, clientWidth: latestWidth } = sliderRef.current
      if (!latestWidth) return
      const index = Math.round(latestScrollLeft / latestWidth)
      const clamped = Math.max(0, Math.min(pagePics.length - 1, index))
      setCurrentPageIndex((prev) => (prev === clamped ? prev : clamped))
    }, 80)
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
          {/* 手机端：左右滑动查看图片，宽度自适应 + 1:1 正方形比例 */}
          <div className="block md:hidden w-full">
            <div className="relative w-full max-w-[480px] mx-auto aspect-square">
              <div
                ref={sliderRef}
                onScroll={handleMobileScroll}
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory gap-3"
              >
                {pagePics.map((page, index) => {
                  const src = page.pagepic;
                  const lower = src.toLowerCase();
                  const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm');
                  const isG2Video = lower.includes('g-2.mp4') || lower.includes('g-2.webm');
                  const isG3Video = lower.includes('g-3.mp4') || lower.includes('g-3.webm');

                  let videoClassName = "w-full h-full object-cover object-center";
                  if (isG2Video) {
                    videoClassName = "w-full h-full object-cover object-bottom";
                  } else if (isG3Video) {
                    videoClassName = "w-full h-full object-cover object-right";
                  }

                  return (
                    <div
                      key={page.id}
                      className="flex-shrink-0 w-full snap-center flex items-center justify-center bg-[#F8F8F8] aspect-square overflow-hidden"
                    >
                      {isVideo ? (
                        <AutoLoopVideo
                          src={src}
                          className={videoClassName}
                          isActive={index === currentPageIndex}
                        />
                      ) : (
                        <img
                          src={src}
                          alt={`Page ${page.pagenum}`}
                          className="w-full h-full object-cover object-center"
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
              const isG2Video = lower.includes('g-2.mp4') || lower.includes('g-2.webm');
              const isG3Video = lower.includes('g-3.mp4') || lower.includes('g-3.webm');

              let videoClassName = "w-full h-auto";
              if (isG2Video) {
                videoClassName = "w-full h-auto object-cover object-bottom";
              } else if (isG3Video) {
                videoClassName = "w-full h-auto object-cover object-right";
              }

              return (
                <div key={page.id} className="w-full">
                  <div className="relative w-full overflow-hidden">
                    {isVideo ? (
                      <AutoLoopVideo 
                        src={src} 
                        className={videoClassName}
                      />
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

        {/* 右侧：桌面端固定（sticky），手机端正常跟随页面滚动，避免出现双滚动条 */}
        <div className="md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <div className="max-w-xl mx-auto md:p-12 px-3 py-2 min-h-0 flex flex-col gap-6">
            <div className="flex flex-col md:gap-3 gap-2">
              <h1 className="md:text-[36px] text-[24px] md:leading-[44px] leading-[32px] font-normal">{(book as any)?.name ?? (book as any)?.default_name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex gap-[6px]">
                  {[...Array(5)].map((_, i) => (
                    <Image key={i} src="/star.svg" alt="star" width={15} height={15} className="w-[15px] h-[15px] md:w-5 md:h-5" />
                  ))}
                </div>
                <div className="flex flex-row gap-2">
                  {tags && tags.map((tag, index) => (
                    <span key={index} className="text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px] text-[#666666] bg-[#F2F2F2] px-2 rounded">{tag.tname}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:gap-3 gap-2">
              <div className="text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px] text-[#222222] bg-[#F8F8F8] p-3 rounded-[12px]">
                <p dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br/>') }} />
              </div>

              {!hidePriceAndButton && (
              <div className="text-sm space-y-3">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex items-center gap-[8px]">
                    <div className="w-4 h-4 bg-[#D9D9D9] rounded"></div>
                    <span className="text-[#666666]">{getSpecificationText(spec)}</span>
                  </div>
                ))}
              </div>
              )}
            </div>
            

            {/* 语言选择已隐藏，默认使用英文 */}

            {/* 价格和按钮 - 桌面端显示，手机端隐藏（手机端使用贴底栏） */}
            {!hidePriceAndButton && (
            <div className="hidden md:flex items-end justify-between gap-8">
              <div className="flex items-baseline gap-3">
                {(() => {
                  const cur = getBookListDisplayPrice(book);
                  const mkt = getBookMarketComparePrice(book, cur);
                  return (
                    <>
                      <span className="text-[#012CCE] text-[36px] leading-[44px] font-medium">${cur.toFixed(2)}</span>
                      {mkt > cur && (
                        <span className="text-gray-400 text-[16px] leading-[24px] tracking-[0.15px] line-through">
                          ${mkt.toFixed(2)}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="flex flex-col">
                <Link
                  href={`${primaryButtonHref}${primaryButtonHref.includes('?') ? '&' : '?'}language=${encodeURIComponent(selectedLanguage)}`}
                  onClick={(e) => {
                    setIsLoading(true);
                    onPrimaryClick?.(e, selectedLanguage);
                  }}
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
                    primaryButtonLabel
                  )}
                </Link>
              </div>
            </div>
            )}

            {!hidePriceAndButton && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



