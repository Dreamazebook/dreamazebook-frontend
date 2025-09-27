"use client";

import { DetailedBook } from '@/types/book'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { roboto } from '@/app/fonts'
import useUserStore from '@/stores/userStore'

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
}: {
  book: DetailedBook,
  pagePics: PagePic[],
  tags: { tname: string }[],
  keywords: any[],
  reviews: any[],
  primaryButtonLabel?: string,
  primaryButtonHref: string,
  onPrimaryClick?: (e: React.MouseEvent) => void,
}) {
  const t = useTranslations('BookDetail')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [openFaq, setOpenFaq] = useState<number>(1)

  const description = book.variant ? book.variant.description : 'No description available.'

  return (
    <div className={`min-h-screen bg-white ${roboto.className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative">
          <div className="grid grid-cols-1 gap-0">
            {pagePics.map((page) => (
              <div key={page.id} className="w-full">
                <div className="relative w-full">
                  <Image src={page.pagepic} alt={`Page ${page.pagenum}`} width={0} height={0} sizes="100vw" className="w-full h-auto" priority={page.pagenum === 1} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky top-0 h-screen overflow-y-auto">
          <div className="max-w-xl mx-auto p-12">
            <h1 className="text-[36px] leading-tight font-normal mb-4">{book.default_name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#FFB800]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
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
              <div className="flex items-center gap-3"><div className="w-4 h-4 bg-gray-300 rounded"></div><span className="text-gray-600">{t('specifications.size')}</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 bg-gray-300 rounded"></div><span className="text-gray-600">{t('specifications.pages')}</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 bg-gray-300 rounded"></div><span className="text-gray-600">{t('specifications.delivery')}</span></div>
            </div>

            <div className="mb-12">
              <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-full p-4 border border-gray-200 rounded-lg text-gray-600 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-no-repeat bg-[center_right_1rem]">
                <option value="en">{t('language.en')}</option>
                <option value="zh">{t('language.zh')}</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-8 mb-12">
              <div className="flex items-baseline gap-3">
                <span className="text-[#012CCE] text-[36px] font-medium">${book.price}</span>
                <span className="text-gray-400 line-through">${(Number(book.price) * 1.25).toFixed(2)}</span>
              </div>
              <Link href={primaryButtonHref} onClick={onPrimaryClick} className="bg-[#222222] text-[#F5E3E3] w-[243px] h-[44px] px-4 py-3 rounded-[4px] hover:bg-gray-800 transition-colors text-base font-medium flex items-center justify-center">
                {primaryButtonLabel}
              </Link>
            </div>

            <div className="space-y-4 border-gray-200">
              {[1, 2, 3].map((num) => (
                <div key={num} className="border-b border-gray-200 pb-4">
                  <button className="w-full flex justify-between items-center" onClick={() => setOpenFaq(openFaq === num ? 0 : num)}>
                    <h3 className="text-base font-medium">{String(num).padStart(2, '0')} {t('faq.title')}</h3>
                    <span className="text-2xl">{openFaq === num ? '-' : '+'}</span>
                  </button>
                  {openFaq === num && (<p className="text-gray-600 mt-4 text-sm">{t('faq.description')}</p>)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



