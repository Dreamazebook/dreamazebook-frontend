'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'

type Bundle = {
  id: string
  title: string
  qtyLabel: string
  features: string[]
  price: number
  ctaHref?: string
}

type BundleGroup = {
  id: string
  label: string
  bundles: [Bundle, Bundle]
}

const CURRENCY = '$'

function formatPrice(price: number) {
  return `${CURRENCY}${price}`
}

function BundleCard({ bundle }: { bundle: Bundle }) {
  return (
    <div className="bg-white rounded-[12px] p-6 md:p-8 shadow-sm border border-black/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] md:text-[18px] font-semibold text-gray-900">{bundle.title}</h3>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold select-none">
          {bundle.qtyLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="aspect-square rounded-[8px] bg-gray-100 relative overflow-hidden">
          <Image src="/home-page/cover.png" alt="Bundle cover" fill className="object-cover" />
        </div>
        <div className="aspect-square rounded-[8px] bg-gray-100 relative overflow-hidden">
          <Image src="/home-page/cover.png" alt="Bundle cover" fill className="object-cover" />
        </div>
        <div className="aspect-square rounded-[8px] bg-gray-100 relative overflow-hidden">
          <Image src="/home-page/cover.png" alt="Bundle cover" fill className="object-cover" />
        </div>
      </div>

      <ul className="space-y-2 text-[14px] md:text-[15px] text-gray-800 list-disc pl-5">
        {bundle.features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <span className="text-gray-400 text-sm line-through mr-2">{formatPrice(Math.round(bundle.price * 1.0))}</span>
          <span className="text-gray-900 font-semibold">{formatPrice(bundle.price)}</span>
        </div>
        <Link
          href={bundle.ctaHref || '#'}
          className="px-4 py-2 rounded-[8px] bg-gray-900 text-white text-sm hover:bg-black"
        >
          Get This Bundle
        </Link>
      </div>
    </div>
  )
}

export default function ChristmasPage() {
  const [activeTab, setActiveTab] = useState<'trio' | 'four' | 'classics'>('trio')

  const groups: BundleGroup[] = useMemo(() => [
    {
      id: 'trio',
      label: 'The Family Trio',
      bundles: [
        {
          id: 'trio-premium-1',
          title: 'Premium Lay-flat Set',
          qtyLabel: 'x3',
          features: [
            '3 Premium Lay-flat Hardcover Books',
            '3 Festive Gift Bags',
            '3 Personalized Book Covers (Free)',
            '3 Hand-drawn Sticker Sets',
            '3 Christmas Edition Bookmarks',
          ],
          price: 224,
          ctaHref: '#',
        },
        {
          id: 'trio-premium-2',
          title: 'Premium Lay-flat Set',
          qtyLabel: 'x3',
          features: [
            '3 Premium Lay-flat Hardcover Books',
            '3 Festive Gift Bags',
            '3 Personalized Book Covers (Free)',
            '3 Hand-drawn Sticker Sets',
            '3 Christmas Edition Bookmarks',
          ],
          price: 224,
          ctaHref: '#',
        },
      ],
    },
    {
      id: 'four',
      label: 'The Festive Four',
      bundles: [
        {
          id: 'four-premium-1',
          title: 'Premium Lay-flat Set',
          qtyLabel: 'x4',
          features: [
            '4 Premium Lay-flat Hardcover Books',
            '4 Festive Gift Bags',
            '4 Personalized Book Covers (Free)',
            '4 Hand-drawn Sticker Sets',
            '4 Christmas Edition Bookmarks',
          ],
          price: 289,
          ctaHref: '#',
        },
        {
          id: 'four-classic-1',
          title: 'Classic Hardcover Set',
          qtyLabel: 'x4',
          features: [
            '4 Classic Hardcover Books',
            '4 Festive Gift Bags',
            '4 Personalized Book Covers (Free)',
            '4 Hand-drawn Sticker Sets',
            '4 Christmas Edition Bookmarks',
          ],
          price: 239,
          ctaHref: '#',
        },
      ],
    },
    {
      id: 'classics',
      label: 'The Christmas Classics Bundle',
      bundles: [
        {
          id: 'classic-1',
          title: 'Classic Hardcover Set',
          qtyLabel: 'x2',
          features: [
            '2 Classic Hardcover Books',
            '2 Festive Gift Bags',
            '2 Personalized Book Covers (Free)',
            '2 Hand-drawn Sticker Sets',
            '2 Christmas Edition Bookmarks',
          ],
          price: 129,
          ctaHref: '#',
        },
        {
          id: 'classic-2',
          title: 'Premium Lay-flat Set',
          qtyLabel: 'x2',
          features: [
            '2 Premium Lay-flat Hardcover Books',
            '2 Festive Gift Bags',
            '2 Personalized Book Covers (Free)',
            '2 Hand-drawn Sticker Sets',
            '2 Christmas Edition Bookmarks',
          ],
          price: 169,
          ctaHref: '#',
        },
      ],
    },
  ], [])

  const activeGroup = groups.find(g => g.id === activeTab) || groups[0]

  const faqs = [
    {
      q: 'Where Are You? Save the Multiverse!',
      a: 'We pour hours of care into making every book – to help you show the people who matter just how much they mean to you.',
    },
    {
      q: 'When will my Christmas bundle ship?',
      a: 'Orders placed before Dec 10 ship within 3–5 business days. We will share tracking updates by email.',
    },
    {
      q: 'Can I personalize more than one book in a bundle?',
      a: 'Yes. Each book can be personalized independently, including name and appearance.',
    },
    {
      q: 'Do you ship internationally?',
      a: 'Yes, we ship worldwide. Shipping fees and timing will be calculated at checkout.',
    },
  ]

  return (
    <main className="bg-[#FFF7F7] min-h-screen">
      {/* Hero/Banner */}
      <section className="relative overflow-hidden md:-mt-20">
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background: [
              'linear-gradient(358.86deg, rgba(199, 26, 31, 0) 74.91%, #C81F24 97.16%)',
            ].join(', '),
          }}
        />
        {/* Banner container: 1440x537 with 10px horizontal padding and 10px gap semantics */}
        <div className="relative h-[489px] md:h-[537px] mx-auto px-[10px]">
          <div className="relative z-10 flex flex-col gap-[24px] pt-6 md:gap-[88px] md:px-36 md:pt-36">
            <div className="text-[#FFFFFF] h-[196px] p-4 md:p-0 md:max-w-[636px]">
              <p className="text-[32px] leading-[40px] md:text-[64px] md:leading-[88px] font-medium">
                Make the most memorable gift under the tree.
              </p>
              <p className="mt-4 max-w-xl text-[14px] md:text-[16px] text-white/90">
                Book your Christmas package today with a special price and festive extras.
              </p>
            </div>
          </div>

          {/* Background image: cover the entire banner area */}
          <div className="absolute inset-x-0 bottom-0 md:top-[-36px] top-[0] z-0">
            <Image
              src="/christmas/banner.png"
              alt="Christmas banner"
              fill
              className="object-cover object-right md:object-top"
              priority
            />
          </div>
        </div>
      </section>

      {/* Tab Selector */}
      <section className="max-w-[1440px] h-[1365px] mx-auto px-[88px] py-[88px] flex flex-col gap-[48px]">
        <div className="text-center flex flex-col gap-[24px]">
          <p className="text-[40px] leading-[56px] font-medium tracking-[0] text-center text-[#222222]">
            Which little ones do you want to surprise this Christmas?
          </p>
          <p className="text-[#222222] text-[18px]">
            Choose any stories you love, bundle joy for the whole family.
          </p>
        </div>

        <div className="mt-6 mx-auto max-w-3xl bg-white rounded-full p-1 shadow-sm border border-black/5 flex items-center gap-2">
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveTab(g.id as typeof activeTab)}
              className={`flex-1 text-sm md:text-base px-4 py-2 rounded-full transition-colors ${
                activeTab === g.id ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Bundles */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 pb-12">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <BundleCard bundle={activeGroup.bundles[0]} />
            <BundleCard bundle={activeGroup.bundles[1]} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <h3 className="text-center text-[22px] md:text-[24px] font-semibold text-gray-900 mb-8">Christmas Package FAQ</h3>
          <div className="divide-y divide-black/10 bg-white rounded-[12px]">
            {faqs.map((f, idx) => (
              <FaqRow key={idx} index={idx} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function FaqRow({ index, q, a }: { index: number; q: string; a: string }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-gray-900 font-medium">{String(index + 1).padStart(2, '0')}</span>
          <span className="text-gray-900 text-[16px] md:text-[18px]">{q}</span>
        </div>
        <span className="text-gray-900">{open ? '−' : '+'}</span>
      </button>
      <div className={`pl-12 pr-2 text-gray-600 text-sm md:text-base overflow-hidden transition-all ${open ? 'max-h-[200px] mt-2' : 'max-h-0'}`}>
        {a}
      </div>
    </div>
  )
}


