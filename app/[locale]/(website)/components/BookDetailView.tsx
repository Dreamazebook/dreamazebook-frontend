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
        <div className="relative">
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
          <div className="max-w-xl mx-auto p-12">
            <h1 className="text-[36px] leading-tight font-normal mb-4">{(book as any)?.name ?? (book as any)?.default_name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Image key={i} src="/star.svg" alt="star" width={20} height={20} />
                ))}
              </div>
              {tags && tags.map((tag, index) => (
                <span key={index} className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">{tag.tname}</span>
              ))}
            </div>

            <div className="text-sm text-gray-900 bg-gray-100 px-3 py-1 mb-6 rounded-lg">
              <p>{description}</p>
            </div>

            <div className="text-sm space-y-4 mb-6">
              {specifications.map((spec, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span className="text-gray-600">{getSpecificationText(spec)}</span>
                </div>
              ))}
            </div>

            {/* 语言选择已隐藏，默认使用英文 */}

            <div className="flex items-center justify-between gap-8 mb-12">
              <div className="flex items-baseline gap-3">
                <span className="text-[#012CCE] text-[36px] font-medium">${Number((book as any)?.default_sku?.current_price ?? (book as any)?.current_price ?? (book as any)?.price ?? 0).toFixed(2)}</span>
                <span className="text-gray-400 line-through">${Number((book as any)?.default_sku?.market_price ?? (book as any)?.market_price ?? ((Number((book as any)?.price ?? 0) * 1.25) || 0)).toFixed(2)}</span>
              </div>
              <Link
                href={`${primaryButtonHref}${primaryButtonHref.includes('?') ? '&' : '?'}language=${encodeURIComponent(selectedLanguage)}`}
                onClick={(e) => onPrimaryClick?.(e, selectedLanguage)}
                className="bg-[#222222] text-[#F5E3E3] w-[243px] h-[44px] px-4 py-3 rounded-[4px] hover:bg-gray-800 transition-colors text-base font-medium flex items-center justify-center"
              >
                {primaryButtonLabel}
              </Link>
            </div>

            <div className="space-y-4 border-gray-200">
              {faqs.map((faq, index) => {
                const num = index + 1;
                const isLast = index === faqs.length - 1;
                return (
                  <div key={index} className={isLast ? "pb-4" : "border-b border-gray-200 pb-4"}>
                    <button className="w-full flex justify-between items-center" onClick={() => setOpenFaq(openFaq === num ? 0 : num)}>
                      <h3 className="md:text-[18px] text-[16px] leading-[24px] tracking-[0.15px] font-medium">{String(num).padStart(2, '0')} {faq.question}</h3>
                      <span className="text-2xl">{openFaq === num ? '-' : '+'}</span>
                    </button>
                    {openFaq === num && (
                      <div className="text-gray-600 mt-4 md:text-[16px] md:leading-[24px] md:tracking-[0.5px] text-[14px] leading-[20px] tracking-[0.25px]">
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



