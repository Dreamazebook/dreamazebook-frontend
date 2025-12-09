import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'

export type BookOption = {
  spu: string
  name: string
  image: string
  href: string
  disabled?: boolean
}

type BundleLike = {
  title: string
  features: string[]
  price: number
  bookCount: number
}

type Props = {
  bundle: BundleLike
  books: BookOption[]
  loading: boolean
  onClose: () => void
}

function formatPrice(price: number) {
  return `$${price}`
}

export function BundleSelectionModal({ bundle, books, loading, onClose }: Props) {
  const [selected, setSelected] = useState<string[]>(() => Array(bundle.bookCount).fill(''))

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

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full h-full overflow-y-auto">
        <div className="h-14 bg-white flex items-center px-4 sm:px-32">
          <button className="flex items-center gap-2 text-sm text-[#222222] cursor-pointer" onClick={onClose}>
            <span aria-hidden>←</span> Back
          </button>
          <div className="flex-1" />
        </div>

        <div className="px-6 md:px-10 bg-[#F8F8F8] lg:px-[220px] py-6 md:py-10 space-y-6 md:gap-3">
          <div className="text-center space-y-2">
            <p className="text-[22px] md:text-[28px] leading-[36px] text-[#222222]">{bundle.title}</p>
            <p className="text-sm md:text-[16px] leading-[24px] tracking-[0.5px] text-[#444444]">
              {bundle.features.filter(Boolean).join(' • ')}
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-[#999999] line-through text-[16px] md:text-[18px] leading-[28px]">{formatPrice(Math.round(bundle.price * 1.0))}</span>
              <span className="text-[#222222] font-semibold text-[22px] md:text-[24px] leading-[28px]">{formatPrice(bundle.price)}</span>
            </div>
            <p className="text-xs md:text-[16px] leading-[24px] tracking-[0.5px] text-[#999999]">You can select the same book more than once.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-[10px]">
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
                      ?
                    </button>
                  ) : (
                    <div
                      className="absolute top-2 left-1 w-[42px] h-[48px] rounded-[2px] border-[0.5px] border-gray-200 bg-white text-[#F0F0F0] flex items-center justify-center text-[30px] leading-[30px]"
                      style={inactiveShadowStyle}
                    >
                      ?
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {loading ? (
              <div className="col-span-3 flex items-center justify-center py-12 text-sm text-[#666666]">Loading books…</div>
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
                    className={`relative bg-white overflow-hidden px-4 pb-6 flex flex-col items-center text-center ${
                      disabled ? 'grayscale opacity-60 cursor-not-allowed' : 'hover:shadow-md transition-shadow cursor-pointer'
                    }`}
                  >
                    {disabled && (
                      <span className="absolute left-3 top-3 z-10 rounded-sm bg-white px-2 py-1 text-[11px] font-semibold text-[#012CCE] uppercase">
                        sale out
                      </span>
                    )}
                    <div className="relative w-full aspect-[1.1/1] bg-white px-8 flex items-end justify-center">
                      <div className="relative w-full h-full overflow-hidden flex items-start justify-center pt-4">
                        <Image src={book.image} alt={book.name} fill className="object-contain" />
                      </div>
                      {selectedTimes > 0 && (
                        <span className="absolute right-3 top-3 rounded-full bg-[#222222] text-white text-xs px-2 py-1">
                          {selectedTimes}x
                        </span>
                      )}
                    </div>
                    <div className="w-full flex flex-col items-center gap-2 px-2">
                      <p className="text-[20px] md:font-medium md:text-[18px] text-[#222222] leading-[24px] tracking-[0.15px]">{book.name}</p>
                      <Link
                        href={book.href}
                        className="text-[16px] leading-[24px] tracking-[0.5px] text-[#012CCE] hover:underline flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        more details <span aria-hidden>→</span>
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={canSubmit ? onClose : undefined}
              disabled={!canSubmit}
              className={`w-full md:w-auto min-w-[240px] px-6 py-3 rounded-[4px] text-[16px] leading-[24px] tracking-[0.5px] ${
                canSubmit ? 'bg-[#012CCE] text-white hover:bg-[#001E99]' : 'bg-[#C4C4C4] text-white cursor-not-allowed'
              }`}
            >
              I&apos;ve finished choosing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
