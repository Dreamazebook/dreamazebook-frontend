"use client";

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/utils/api'
import { BaseBook, DetailedBook } from '@/types/book'
import BookDetailView from '../../components/BookDetailView'
import { Link, useRouter } from '@/i18n/routing'
import { API_KS_PACKAGE_STATUS, API_KS_ITEM_PICBOOK } from '@/constants/api'

interface ApiList<T> { success: boolean; data: T }

// 与 preview 页一致的下划线 SVG
const UnderlineIcon = () => (
  <svg
    className="absolute bottom-[3px] left-0 w-full"
    height="4"
    viewBox="0 0 100 4"
    preserveAspectRatio="none"
  >
    <line x1="0" y1="2" x2="100" y2="2" stroke="#012CCE" strokeWidth="4" />
  </svg>
)

export default function KickstarterConfigPage() {
  const params = useParams()
  const packageId = params.packageId
  const router = useRouter()

  const [books, setBooks] = useState<BaseBook[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [detail, setDetail] = useState<DetailedBook | null>(null)
  const [pagePics, setPagePics] = useState<any[]>([])
  const [tags, setTags] = useState<{ tname: string }[]>([])
  const [keywords, setKeywords] = useState<any[]>([])
  const [selectedBooks, setSelectedBooks] = useState<BaseBook[]>([])
  const [packageOptions, setPackageOptions] = useState<any>(null)
  const [pendingCount, setPendingCount] = useState<number>(0)
  
  const removeSelectedAt = (index: number) => {
    setSelectedBooks((prev) => {
      const next = [...prev]
      next.splice(index, 1)
      return next
    })
  }

  // 初始化：获取套餐状态（含待配置的 items 和允许选择的书池）
  useEffect(() => {
    const load = async () => {
      if (!packageId) return
      try {
        const res = await api.get<any>(API_KS_PACKAGE_STATUS(packageId as any))
        // 后端期望返回：{ package_items: [...], progress:{...}, available_picbooks:[...] }
        const available = res?.data?.available_picbooks || res?.available_picbooks || []
        const pkgOpts = res?.data?.package_options || res?.package_options || res?.data?.package?.package_options
        if (pkgOpts) setPackageOptions(pkgOpts)
        const items = res?.data?.package_items || res?.package_items || []
        const count = Array.isArray(items) ? items.filter((it:any) => it.config_status === 'pending').length : (res?.data?.progress?.total_items ?? 0)
        setPendingCount(count || 0)
        const normalized = Array.isArray(available)
          ? available.map((it: any) => (typeof it === 'number' ? ({ id: it } as any) : it))
          : []
        if (normalized.length > 0) {
          setBooks(normalized)
        } else {
          // 兜底：回退所有绘本
          const fallback = await api.get<ApiList<BaseBook[]>>('/picbooks')
          if (fallback?.data) setBooks(fallback.data)
        }
      } catch (e) {
        // 兜底：回退到全部绘本
        const res = await api.get<ApiList<BaseBook[]>>('/picbooks')
        if (res?.data) setBooks(res.data)
      }
    }
    load()
  }, [packageId])

  // 加载当前tab的详情
  useEffect(() => {
    const id = books[activeIndex]?.id
    if (!id) return
    const loadDetail = async () => {
      const res = await api.get<any>(`/picbooks/${id}`)
      if (res?.data) {
        setDetail(res.data)
        setPagePics(res.data.pages.map((p: any) => ({ id: p.id, pagenum: p.page_number, pagepic: p.image_url })))
        setTags(res.data.tags.map((t: string) => ({ tname: t })))
        setKeywords(res.data.keywords)
      }
    }
    loadDetail()
  }, [activeIndex, books])

  const onPick = () => {
    if (!detail) return
    // 允许重复选择；限制最多选择 pendingCount 本
    if (pendingCount && selectedBooks.length >= pendingCount) return
    setSelectedBooks((prev) => [...prev, { id: detail.id, default_name: detail.default_name, default_cover: detail.default_cover, price: detail.price, pricesymbol: detail.pricesymbol, currencycode: detail.currencycode } as BaseBook])
  }

  const onFinish = async () => {
    // 仅提交用户选择的书本：将所选 N 本映射到前 N 个待配置 item
    try {
      const status = await api.get<any>(API_KS_PACKAGE_STATUS(packageId as any))
      const items = status?.data?.package_items || status?.package_items || []
      const pendingItems = items.filter((it: any) => it.config_status === 'pending')
      const count = Math.min(selectedBooks.length, pendingItems.length)
      for (let i = 0; i < count; i++) {
        const item = pendingItems[i]
        const bk = selectedBooks[i]
        await api.put(API_KS_ITEM_PICBOOK(item.id), { picbook_id: bk.id })
      }
    } catch (e) {
      console.error('Failed to submit selected books:', e)
    }
    router.push('/shopping-cart')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto bg-white rounded-[4px] w-full h-[836px] px-6 py-3 flex flex-col gap-3">
        {/* 顶部Tabs（容器内固定在顶部） */}
        <div className="w-full sticky top-0 left-0 right-0 bg-white z-10">
          <div className="flex items-center gap-8 h-12 overflow-x-auto">
            {books.map((b, idx) => (
              <div key={b.id} className="relative">
                <button
                  onClick={() => setActiveIndex(idx)}
                  className={`relative z-10 text-sm bg-transparent ${idx === activeIndex ? 'text-black' : 'text-gray-500'}`}
                >
                  {b.default_name?.split(' ')[0] || `book${idx + 1}`}
                </button>
                {idx === activeIndex && <UnderlineIcon />}
              </div>
            ))}
          </div>
        </div>

        {/* 详情区域（复用 BookDetailView，按钮改文案） */}
        <div className="flex-1 overflow-auto">
          {detail && (
            <BookDetailView
              book={detail}
              pagePics={pagePics}
              tags={tags}
              keywords={keywords}
              reviews={[]}
              primaryButtonLabel="I want this book"
              primaryButtonHref="#"
              onPrimaryClick={(e) => { e.preventDefault(); onPick() }}
            />
          )}
        </div>

        {/* 底部选中条（容器内固定在底部） */}
        <div className="w-full sticky bottom-0 left-0 right-0 bg-white z-10">
          <div className="min-h-[88px] bg-[#F8F8F8] mx-auto my-3 rounded-sm p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 w-full md:w-auto min-w-0 flex items-center gap-3 overflow-x-auto">
              {Array.from({ length: Math.max(pendingCount, selectedBooks.length) || 0 }).map((_, idx) => {
                const b = selectedBooks[idx]
                const isActiveSlot = !b && idx === selectedBooks.length && (pendingCount === 0 || idx < pendingCount)
                const inactiveShadowStyle = { boxShadow: '0 0 4px rgba(12, 12, 12, 0.05)' }
                return (
                  <div key={idx} className="relative flex items-center w-12 h-16">
                    {b ? (
                      <>
                        <div className="absolute top-2 left-1 w-[42px] h-[48px] rounded-[2px] bg-white overflow-hidden" style={inactiveShadowStyle}>
                          <img src={b.default_cover} alt={b.default_name} className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          aria-label="Remove"
                          onClick={() => removeSelectedAt(idx)}
                          className="absolute top-0 right-0 w-4 h-4 rounded-tr-[2.67px] rounded-bl-[2.67px] bg-[#000000]/40 text-[#FFFFFF]/40 hover:bg-gray-300 flex items-center justify-center z-10"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.4571 1.66665V10.6666C10.4571 11.0205 10.3125 11.3592 10.0553 11.6095C9.79514 11.8607 9.44738 12.0008 9.08571 12H2.91429C2.55051 12 2.20149 11.8594 1.94434 11.6095C1.81771 11.4872 1.71693 11.3407 1.64796 11.1788C1.579 11.0168 1.54326 10.8427 1.54286 10.6666V1.66665H10.4571ZM9.42857 2.66676H2.57143V10.6663C2.57143 10.7547 2.60743 10.8394 2.67154 10.9022C2.736 10.9646 2.82309 10.9995 2.91429 10.9995H9.08571C9.17657 10.9995 9.264 10.9646 9.32811 10.9022C9.3598 10.8716 9.38503 10.8349 9.40228 10.7944C9.41954 10.7539 9.42848 10.7103 9.42857 10.6663V2.66676ZM4.8 9.66652C4.51577 9.66652 4.28571 9.44297 4.28571 9.16663V5.16687C4.28571 4.89087 4.51577 4.66698 4.8 4.66698C5.08389 4.66698 5.31429 4.89087 5.31429 5.16687V9.16698C5.31429 9.44332 5.08389 9.66686 4.8 9.66686V9.66652ZM7.2 9.66652C6.91577 9.66652 6.68571 9.44297 6.68571 9.16663V5.16687C6.68571 4.89087 6.91577 4.66698 7.2 4.66698C7.48389 4.66698 7.71429 4.89087 7.71429 5.16687V9.16698C7.71429 9.44332 7.48389 9.66686 7.2 9.66686V9.66652ZM11.4857 2.66676H0.514286C0.230057 2.66676 0 2.44287 0 2.16653C0 1.89053 0.230057 1.66665 0.514286 1.66665H11.4857C11.7696 1.66665 12 1.89053 12 2.16653C12 2.44287 11.7696 2.66676 11.4857 2.66676ZM7.49143 1.00013L7.57714 1.66665H4.42286L4.50857 1.00013H7.49143ZM7.79314 2.22962e-05H4.20686C3.8592 -0.00272055 3.56434 0.247908 3.52114 0.583221L3.25714 2.66676H8.74286L8.47543 0.583221C8.43189 0.247908 8.13703 -0.00272055 7.78971 0.000365148H7.79314V2.22962e-05Z" fill="white"/>
                          </svg>
                        </button>
                      </>
                    ) : (
                      isActiveSlot ? (
                        <div className="absolute top-2 left-1 w-[42px] h-[48px] rounded-[2px] border-[0.5px] border-[#012CCE] bg-white text-[#F0F0F0] flex items-center justify-center text-[30px] leading-[30px]">?</div>
                      ) : (
                        <div className="absolute top-2 left-1 w-[42px] h-[48px] rounded-[2px] border-[0.5px] border-gray-200 bg-white text-[#F0F0F0] flex items-center justify-center text-[30px] leading-[30px]" style={inactiveShadowStyle}>?</div>
                      )
                    )}
                  </div>
                )
              })}
            </div>

            <div className="text-gray-600 text-sm mx-2 w-full md:w-auto text-center md:text-left truncate">
              {pendingCount > 0 ? (
                <>You can choose {pendingCount} books, and repeated selection is allowed</>
              ) : (
                <>You can choose books, and repeated selection is allowed</>
              )}
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <button
                onClick={onFinish}
                disabled={pendingCount > 0 ? selectedBooks.length < pendingCount : selectedBooks.length === 0}
                className={`w-[243px] h-[44px] px-4 py-3 rounded-[4px] ${pendingCount > 0 && selectedBooks.length < pendingCount ? 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-40' : 'bg-[#222222] text-[#F5E3E3]'}`}
              >
                I've finished choosing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


