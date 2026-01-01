import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'

export type BookOption = {
  spu: string
  name: string
  image: string
  href: string
  disabled?: boolean
  description?: string
}

type BundleLike = {
  title: string
  features: string[]
  originalPrice: number
  price: number
  bookCount: number
}

type Props = {
  bundle: BundleLike
  books: BookOption[]
  loading: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit?: (spuCodes: string[]) => void | Promise<void>
}

function formatPrice(price: number) {
  const n = Number(price)
  if (Number.isFinite(n)) return `$${n.toFixed(2)}`
  return `$${price}`
}

export function BundleSelectionModal({ bundle, books, loading, isSubmitting, onClose, onSubmit }: Props) {
  const [selected, setSelected] = useState<string[]>(() => Array(bundle.bookCount).fill(''))
  const [detailBook, setDetailBook] = useState<BookOption | null>(null)
  const [iframeLoading, setIframeLoading] = useState(true)

  useEffect(() => {
    setSelected(Array(bundle.bookCount).fill(''))
  }, [bundle])

  const selectionCount = useMemo(() => {
    return selected.reduce<Record<string, number>>((acc, spu) => {
      if (!spu) return acc
      acc[spu] = (acc[spu] || 0) + 1
      return acc
    }, {})
  }, [selected])

  const handleSelect = (spu: string, disabled?: boolean) => {
    if (disabled) return
    setSelected(prev => {
      const next = [...prev]
      const emptyIndex = next.findIndex(v => !v)
      if (emptyIndex !== -1) {
        next[emptyIndex] = spu
        return next
      }
      next[next.length - 1] = spu
      return next
    })
  }

  const handleClearSlot = (index: number) => {
    setSelected(prev => {
      const next = [...prev]
      next[index] = ''
      return next
    })
  }

  const canSubmit = selected.filter(Boolean).length === bundle.bookCount
  const selectedCount = selected.filter(Boolean).length

  const handleSubmit = async () => {
    if (!canSubmit) return
    // canSubmit 时 selected 中不应包含空字符串；这里仍做一次防御性过滤
    const spuCodes = selected.filter(Boolean)
    await onSubmit?.(spuCodes)
  }

  const handleMoreDetails = (book: BookOption, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDetailBook(book)
    setIframeLoading(true)
  }

  useEffect(() => {
    if (!detailBook) {
      setIframeLoading(false)
    }
  }, [detailBook])

  const handleIframeLoad = () => {
    // 延迟隐藏骨架屏，确保 iframe 内容完全渲染
    setTimeout(() => {
      setIframeLoading(false)
    }, 300)
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full h-full overflow-y-auto">
        {/* 桌面端 Header */}
        <div className="hidden md:flex h-14 bg-white items-center px-4 sm:px-32">
          <button className="flex items-center gap-2 text-md text-[#222222] cursor-pointer" onClick={onClose}>
            <span aria-hidden>←</span> Back
          </button>
          <div className="flex-1" />
        </div>

        {/* 手机端 Header - 贴顶 */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-50">
          <button 
            className="w-8 h-8 flex items-center justify-center text-[#222222] cursor-pointer"
            onClick={onClose}
            aria-label="Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="flex-1 text-center font-medium text-[16px] leading-[24px] tracking-[0.15px] text-[#222222] pr-8">
            {bundle.title}
          </h1>
        </div>

        <div className="px-6 md:px-10 bg-[#F8F8F8] lg:px-[220px] pt-18 md:pt-6 md:py-10 pb-32 md:pb-10 gap-3 flex flex-col">
          <div className="text-center gap-3 md:gap-2 flex flex-col items-center">
            <p className="text-[24px] leading-[32px] md:text-[28px] md:leading-[36px] text-[#222222]">{bundle.title}</p>
            <p className="text-sm md:text-[16px] leading-[24px] tracking-[0.5px] text-[#444444]">
              {bundle.features.filter(Boolean).join(' • ')}
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-[#999999] line-through text-[16px] md:text-[18px] leading-[28px]">{formatPrice(bundle.originalPrice)}</span>
              <span className="text-[#222222] font-semibold text-[22px] md:text-[24px] leading-[28px]">{formatPrice(bundle.price)}</span>
            </div>
            <p className="text-xs md:text-[16px] leading-[24px] tracking-[0.5px] text-[#999999]">Pick any {bundle.bookCount} books · Mix & match freely</p>
          </div>

          {/* 桌面端已选图书 */}
          <div className="hidden md:flex flex-wrap items-center justify-center gap-[10px]">
            {selected.map((spu, idx) => {
              const book = books.find(b => b.spu === spu)
              const firstEmptyIndex = selected.findIndex(v => !v)
              const isActiveSlot = !book && firstEmptyIndex === idx
              const inactiveShadowStyle = { boxShadow: '0 0 4px rgba(12, 12, 12, 0.05)' }
              return (
                <div
                  key={`${spu || 'empty'}-${idx}`}
                  className="relative flex items-start justify-center w-12 h-16 pt-2 pb-2"
                  style={{ gap: '10px' }}
                >
                  {book ? (
                    <div
                      className="absolute top-2 left-1 w-[48px] h-[48px] rounded-[2px] bg-white overflow-hidden"
                      style={inactiveShadowStyle}
                    >
                      <Image src={book.image} alt={book.name} width={48} height={48} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        aria-label="Remove book"
                        onClick={() => handleClearSlot(idx)}
                        className="absolute top-[0px] right-[0px] z-10 w-4 h-4 rounded-tr-[2.67px] rounded-bl-[2.67px] bg-[#000000]/60 text-white flex items-center justify-center hover:bg-[#000000]/80"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 6.5H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          <path d="M10 10.5V16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          <path d="M14 10.5V16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          <path d="M6 6.5H18L17.2 19C17.127 20.0781 16.2329 21 15.1537 21H8.84627C7.7671 21 6.87299 20.0781 6.79999 19L6 6.5Z" stroke="currentColor" strokeWidth="1.6" />
                          <path d="M9.5 6.5L10.25 4.25C10.5268 3.41605 11.3012 2.875 12.1753 2.875H12.8247C13.6988 2.875 14.4732 3.41605 14.75 4.25L15.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ) : isActiveSlot ? (
                    <button
                      type="button"
                      onClick={() => handleClearSlot(idx)}
                      className="absolute top-2 left-1 w-[42px] h-[48px] rounded-[2px] border-[0.5px] border-[#012CCE] bg-white text-[#F0F0F0] flex items-center justify-center text-[30px] leading-[30px]"
                    >
                      +
                    </button>
                  ) : (
                    <div
                      className="absolute top-2 left-1 w-[42px] h-[48px] rounded-[2px] bg-white text-[#F0F0F0] flex items-center justify-center text-[30px] leading-[30px]"
                      style={inactiveShadowStyle}
                    >
                      +
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-3 md:gap-6 justify-between md:justify-center pb-14 md:pb-8">
            {loading ? (
              <div className="w-full flex items-center justify-center py-12 text-sm text-[#666666]">Loading books…</div>
            ) : (
              books.map(book => {
                const disabled = !!book.disabled
                const selectedTimes = selectionCount[book.spu] || 0
                return (
                  <div
                    key={book.spu}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => {
                      if (!disabled) handleSelect(book.spu, disabled)
                    }}
                    onKeyDown={(e) => {
                      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        handleSelect(book.spu, disabled)
                      }
                    }}
                    className={`flex-none basis-[calc(50%-6px)] md:basis-[calc(33.333%-16px)] rounded-[4px] relative bg-white overflow-hidden px-3 md:px-4 py-3 md:py-0 md:pb-6 flex flex-col items-center text-center ${
                      // Figma: X=6, Y=12, Blur=20, Spread=0, Color=#000000 @ 2%
                      'shadow-[6px_12px_20px_rgba(0,0,0,0.02)]'
                    } ${disabled ? 'cursor-default' : 'hover:shadow-md transition-shadow cursor-pointer'}`}
                  >
                    {disabled && (
                      <span className="font-normal absolute right-0 top-0 z-10 rounded-bl-[4px] rounded-tr-[4px] bg-[#012CCE1A] px-2 text-[12px] md:text-[16px] leading-[24px] tracking-[0.5px] text-[#012CCE] uppercase">
                        Sold out
                      </span>
                    )}
                    <div className="relative w-full aspect-[1.1/1] bg-white md:px-8 flex items-end justify-center">
                      <div className="relative w-full h-full overflow-hidden flex items-start justify-center pt-4">
                        <Image
                          src={book.image}
                          alt={book.name}
                          fill
                          className={`object-contain transition-opacity ${disabled ? 'opacity-40' : 'opacity-100'}`}
                        />
                      </div>
                      {selectedTimes > 0 && (
                        <span className="absolute right-0 top-0 md:right-3 md:top-3 md:bottom-auto rounded-full bg-[#222222] text-white text-xs px-2 py-1">
                          {selectedTimes}x
                        </span>
                      )}
                    </div>
                    <div className="w-full flex flex-col items-center gap-2 px-2">
                      <p className="hidden md:block text-[20px] md:font-medium md:text-[18px] text-[#222222] leading-[24px] tracking-[0.15px]">{book.name}</p>
                      <Link
                        href={book.href}
                        className="text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px] text-[#222222] hover:underline flex items-center gap-1"
                        onClick={(e) => handleMoreDetails(book, e)}
                      >
                        About this book <span aria-hidden className="hidden md:inline">→</span>
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* 桌面端 Finish Button */}
          <div className="hidden md:flex justify-center">
            <button
              type="button"
              onClick={canSubmit ? handleSubmit : undefined}
              disabled={!canSubmit || !!isSubmitting}
              className={`w-full md:w-auto min-w-[240px] px-6 py-3 rounded-[4px] text-[16px] leading-[24px] tracking-[0.5px] ${
                canSubmit && !isSubmitting
                  ? 'bg-[#222222] text-[#F5E3E3]'
                  : 'bg-[#C4C4C4] text-white cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                  Adding…
                </span>
              ) : canSubmit ? (
                `Add ${bundle.bookCount} books to cart`
              ) : (
                `Choose ${bundle.bookCount} books (${selectedCount}/${bundle.bookCount})`
              )}
            </button>
          </div>
        </div>

        {/* 手机端底部 Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
          <div className="px-4 py-3 space-y-3">
            {/* 已选图书 */}
            <div className="flex flex-wrap items-center gap-6 bg-[#F8F8F8] rounded-[4px] px-3 py-2">
              {selected.map((spu, idx) => {
                const book = books.find(b => b.spu === spu)
                const firstEmptyIndex = selected.findIndex(v => !v)
                const isActiveSlot = !book && firstEmptyIndex === idx
                const inactiveShadowStyle = { boxShadow: '0 0 4px rgba(12, 12, 12, 0.05)' }
                return (
                  <div
                    key={`${spu || 'empty'}-${idx}`}
                    className="relative flex items-start justify-center w-12 h-16 pt-2 pb-2"
                    style={{ gap: '10px' }}
                  >
                    {book ? (
                      <div
                        className="absolute top-2 left-1 w-[48px] h-[48px] rounded-[2px] bg-white overflow-hidden"
                        style={inactiveShadowStyle}
                      >
                        <Image src={book.image} alt={book.name} width={48} height={48} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          aria-label="Remove book"
                          onClick={() => handleClearSlot(idx)}
                          className="absolute top-[0px] right-[0px] z-10 w-4 h-4 rounded-tr-[2.67px] rounded-bl-[2.67px] bg-[#000000]/60 text-white flex items-center justify-center hover:bg-[#000000]/80"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 6.5H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            <path d="M10 10.5V16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            <path d="M14 10.5V16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            <path d="M6 6.5H18L17.2 19C17.127 20.0781 16.2329 21 15.1537 21H8.84627C7.7671 21 6.87299 20.0781 6.79999 19L6 6.5Z" stroke="currentColor" strokeWidth="1.6" />
                            <path d="M9.5 6.5L10.25 4.25C10.5268 3.41605 11.3012 2.875 12.1753 2.875H12.8247C13.6988 2.875 14.4732 3.41605 14.75 4.25L15.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    ) : isActiveSlot ? (
                      <button
                        type="button"
                        onClick={() => handleClearSlot(idx)}
                        className="absolute top-2 left-1 w-[42px] h-[48px] rounded-[2px] border-[0.5px] border-[#012CCE] bg-white text-[#F0F0F0] flex items-center justify-center text-[30px] leading-[30px]"
                      >
                        +
                      </button>
                    ) : (
                      <div
                        className="absolute top-2 left-1 w-[42px] h-[48px] rounded-[4px] border-[0.5px] border-gray-200 bg-white text-[#F0F0F0] flex items-center justify-center text-[30px] leading-[30px]"
                        style={inactiveShadowStyle}
                      >
                        +
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {/* Finish Button */}
            <button
              type="button"
              onClick={canSubmit ? handleSubmit : undefined}
              disabled={!canSubmit || !!isSubmitting}
              className={`w-full px-6 py-3 rounded-[4px] text-[16px] leading-[24px] tracking-[0.5px] ${
                canSubmit && !isSubmitting
                  ? 'bg-[#222222] text-[#F5E3E3] hover:bg-[#001E99]'
                  : 'bg-[#C4C4C4] text-white cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                  Adding…
                </span>
              ) : canSubmit ? (
                `Add ${bundle.bookCount} books to cart`
              ) : (
                `Choose ${bundle.bookCount} books (${selectedCount}/${bundle.bookCount})`
              )}
            </button>
          </div>
        </div>
      </div>

      {detailBook && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={() => setDetailBook(null)} />
          <div className="absolute right-0 top-26 bottom-0 md:top-0 md:bottom-0 w-full md:w-[360px] bg-[#F8F8F8] shadow-2xl pointer-events-auto overflow-hidden md:rounded-none flex flex-col">
            {/* 手机端 Header */}
            <div className="md:hidden bg-white flex items-center justify-center px-4 h-14 flex-shrink-0 relative">
              <h2 className="font-medium text-[16px] leading-[24px] tracking-[0.15px] text-center text-[#222222]">
                {detailBook.name}
              </h2>
              <button
                type="button"
                onClick={() => setDetailBook(null)}
                className="absolute right-4 w-8 h-8 flex items-center justify-center text-[#222222] hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 relative overflow-y-auto">
              {iframeLoading && (
                <div className="absolute inset-0 bg-[#F8F8F8] overflow-y-auto z-10">
                  <div className="animate-pulse">
                    {/* 骨架屏：图片区域 */}
                    <div className="w-full aspect-[3/4] bg-gray-300" />
                    
                    {/* 骨架屏：标题区域 */}
                    <div className="px-4 pt-6 pb-4 space-y-3 bg-white">
                      <div className="h-6 bg-gray-300 rounded w-3/4" />
                      <div className="h-4 bg-gray-300 rounded w-1/2" />
                    </div>
                    
                    {/* 骨架屏：描述区域 */}
                    <div className="px-4 pb-6 pt-4 space-y-2 bg-white">
                      <div className="h-4 bg-gray-300 rounded w-full" />
                      <div className="h-4 bg-gray-300 rounded w-full" />
                      <div className="h-4 bg-gray-300 rounded w-5/6" />
                      <div className="h-4 bg-gray-300 rounded w-full" />
                      <div className="h-4 bg-gray-300 rounded w-4/5" />
                    </div>
                  </div>
                </div>
              )}
              <iframe
                src={`${detailBook.href}${detailBook.href.includes('?') ? '&' : '?'}embed=true`}
                title={detailBook.name}
                className={`w-full h-full border-0 bg-[#F8F8F8] ${iframeLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-500`}
                onLoad={handleIframeLoad}
                style={{ display: 'block', minHeight: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
