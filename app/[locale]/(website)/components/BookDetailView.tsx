"use client";

// Accept any product detail shape to support new API
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { roboto } from '@/app/fonts'
import useUserStore from '@/stores/userStore'
import { getBookConfig } from './books/booksConfig'

interface PagePic { id: number; pagenum: number; pagepic: string }

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

  return (
    <div className={`min-h-screen bg-white ${roboto.className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-fit">
          <div className="grid grid-cols-1 gap-0">
            {pagePics.map((page) => {
              const src = page.pagepic
              return (
              <div key={page.id} className="w-full">
                <div className="relative w-full">
                  <img 
                    src={src} 
                    alt={`Page ${page.pagenum}`} 
                    className="w-full h-auto" 
                    loading={page.pagenum === 1 ? 'eager' : 'lazy'}
                  />
                </div>
              </div>
            )})}
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
            <div className="hidden md:flex items-center justify-between gap-8">
              <div className="flex items-baseline gap-3">
                <span className="text-[#012CCE] text-[36px] font-medium">${Number((book as any)?.default_sku?.current_price ?? (book as any)?.current_price ?? (book as any)?.price ?? 0).toFixed(2)}</span>
                <span className="text-gray-400 line-through">${Number((book as any)?.default_sku?.market_price ?? (book as any)?.market_price ?? ((Number((book as any)?.price ?? 0) * 1.25) || 0)).toFixed(2)}</span>
              </div>
              <Link
                href={`${primaryButtonHref}${primaryButtonHref.includes('?') ? '&' : '?'}language=${encodeURIComponent(selectedLanguage)}`}
                onClick={(e) => {
                  setIsLoading(true);
                  onPrimaryClick?.(e, selectedLanguage);
                }}
                className={`bg-[#222222] text-[#F5E3E3] w-[243px] h-[44px] px-4 py-3 rounded-[4px] hover:bg-gray-800 transition-colors text-base font-medium flex items-center justify-center ${isLoading ? 'opacity-75 cursor-wait pointer-events-none' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  primaryButtonLabel
                )}
              </Link>
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



