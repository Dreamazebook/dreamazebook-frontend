'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react'
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
    <div className="bg-white rounded-[12px] p-6 md:p-8 lg:w-[528px] lg:pt-6 lg:pr-6 lg:pb-12 lg:pl-6 lg:rounded-[4px] lg:space-y-12">
      <div className="lg:flex lg:flex-col lg:w-[480px] lg:gap-6">
        <div className="bg-[#F8F8F8]">
          <div className="py-6">
            <p className="text-center text-[22px] md:text-[22px] font-semibold text-[#222222]">{bundle.title}</p>
          </div>

          <div className="relative w-full h-[185px] flex items-center justify-center">
            <Image src="https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/christmas/bundle.png" alt="Bundle cover" width={345} height={185} className="mx-auto h-full w-auto" />
            <span className="absolute left-[71px] top-[30px] inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#012CCE] text-white text-[24px] font-semibold select-none">
              {bundle.qtyLabel}
            </span>
          </div>

          <div className="bg-[#F0F0F0] max-w-[397px] px-4 py-1 mb-6 mx-auto">
            <div className="grid grid-cols-3 gap-4 md:gap-6 text-center items-start">
              <div className="flex flex-col items-center gap-2">
                <div className="w-[92px] h-[72px] rounded overflow-hidden flex items-center justify-center">
                  <Image src="https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/christmas/package.png" alt="package" width={92} height={72} className="h-full w-auto" />
                </div>
                <p className="text-[12px] md:text-[14px] text-[#222222]">package *3</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-[92px] h-[72px] mx-auto">
                  <div className="absolute left-2 top-2 w-[50px] h-[50px] overflow-hidden flex items-center justify-center z-10">
                    <Image src="https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/christmas/sticker-1.jpg" alt="sticker" width={50} height={50} className="h-full w-auto" />
                  </div>
                  <div className="absolute left-4 top-4 w-[50px] h-[50px] overflow-hidden flex items-center justify-center z-20">
                    <Image src="https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/christmas/sticker-2.jpg" alt="sticker" width={50} height={50} className="h-full w-auto" />
                  </div>
                  <div className="absolute left-6 top-6 w-[50px] h-[50px] overflow-hidden flex items-center justify-center z-30">
                    <Image src="https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/christmas/sticker-3.jpg" alt="sticker" width={50} height={50} className="h-full w-auto" />
                  </div>
                </div>
                <p className="text-[12px] md:text-[14px] text-[#222222]">sticker *3</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-[92px] h-[72px] rounded overflow-hidden flex items-center justify-center">
                  <Image src="https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/christmas/bookmark.png" alt="bookmark" width={92} height={72} className="h-full w-auto" />
                </div>
                <p className="text-[12px] md:text-[14px] text-[#222222]">bookmark *3</p>
              </div>
            </div>
          </div>
        </div>

        <ul className="mx-auto max-w-[397px] bg-white space-y-3 md:space-y-4 text-[14px] md:text-[16px] lg:text-[18px] text-gray-800 list-disc pl-5">
          {bundle.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>

        <div className="bg-white mt-6 lg:mt-0 flex flex-col items-center gap-4">
          <div className="flex items-baseline gap-1">
            <span className="text-[#999999] text-[18px] line-through">{formatPrice(Math.round(bundle.price * 1.0))}</span>
            <span className="text-[#222222] font-semibold text-[24px]">{formatPrice(bundle.price)}</span>
          </div>
          <Link
            href={bundle.ctaHref || '#'}
            className="px-6 py-3 rounded-[8px] bg-[#222222] text-[#F5E3E3] md:mt-3 text-sm md:text-base hover:bg-black"
          >
            Get This Bundle
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ChristmasPage() {
  const [activeTab, setActiveTab] = useState<'trio' | 'four' | 'classics'>('trio')

  const groups: BundleGroup[] = useMemo(() => [
    {
      id: 'trio',
      label: 'The Family Trio (3 books)',
      bundles: [
        {
          id: 'trio-classic',
          title: 'Classic Hardcover Set',
          qtyLabel: 'x3',
          features: [
            '3 Hardcover Books — durable, beautifully bound for everyday reading',
            '3 Hand-drawn Sticker Sets — playful, collectible keepsakes',
            '3 Christmas Edition Bookmarks — crafted for festive storytime',
            '1 Festive Gift Bags — ready-to-gift presentation for Christmas morning',
            '3 Personalized Book Covers (Free) — custom-designed for your child',
          ],
          price: 224,
          ctaHref: '#',
        },
        {
          id: 'trio-premium',
          title: 'Premium Lay-flat Set',
          qtyLabel: 'x3',
          features: [
            '3 Premium Lay-flat Hardcover Books — elegant keepsakes with a seamless reading experience',
            '3 Festive Gift Bags — ready-to-gift presentation for Christmas morning',
            '3 Hand-drawn Sticker Sets — playful, collectible keepsakes',
            '3 Christmas Edition Bookmarks — crafted for festive storytime',
            '3 Personalized Book Covers (Free) — custom-designed for your child',
          ],
          price: 224,
          ctaHref: '#',
        },
      ],
    },
    {
      id: 'four',
      label: 'The Festive Four (4 books)',
      bundles: [
        {
          id: 'four-classic',
          title: 'Classic Hardcover Set',
          qtyLabel: 'x4',
          features: [
            '4 Hardcover Books — durable, beautifully bound for everyday reading',
            '4 Hand-drawn Sticker Sets — playful, collectible keepsakes',
            '4 Christmas Edition Bookmarks — crafted for festive storytime',
            '4 Personalized Book Covers (Free) — custom-designed for your child',
            '2  Festive Gift Bags — ready-to-gift presentation for Christmas morning',
          ],
          price: 239,
          ctaHref: '#',
        },
        {
          id: 'four-premium',
          title: 'Premium Lay-flat Set',
          qtyLabel: 'x4',
          features: [
            '4 Premium Lay-flat Hardcover Books — elegant keepsakes with a seamless reading experience',
            '2 Festive Gift Boxes — ready-to-gift presentation for Christmas morning',
            '4 Hand-drawn Sticker Sets — playful, collectible keepsakes',
            '4 Christmas Edition Bookmarks — crafted for festive storytime',
            '4 Personalized Book Covers (Free) — custom-designed for your child',
            '2 Personalized Coloring Books',
          ],
          price: 289,
          ctaHref: '#',
        },
      ],
    },
    {
      id: 'classics',
      label: 'The Christmas Bundle',
      bundles: [
        {
          id: 'christmas-classic',
          title: 'Classic Hardcover Set',
          qtyLabel: 'x4',
          features: [
            '4 Hardcover Books — durable, beautifully bound for everyday reading',
            '5 Hand-drawn Sticker Sets — playful, collectible keepsakes',
            '5 Christmas Edition Bookmarks — crafted for festive storytime',
            '5 Personalized Book Covers (Free) — custom-designed for your child',
            '5  Festive Gift Bags — ready-to-gift presentation for Christmas morning',
            '5 Personalized Coloring Books',
          ],
          price: 129,
          ctaHref: '#',
        },
        {
          id: 'christmas-premium',
          title: 'Premium Lay-flat Set',
          qtyLabel: 'x4',
          features: [
            '4 Premium Lay-flat Hardcover Books — elegant keepsakes with a seamless reading experience',
            '5 Hand-drawn Sticker Sets — playful, collectible keepsakes',
            '5 Christmas Edition Bookmarks — crafted for festive storytime',
            '5 Personalized Book Covers (Free) — custom-designed for your child',
            '5  Festive Gift Boxes — ready-to-gift presentation for Christmas morning',
            '5 Personalized Coloring Books',
          ],
          price: 169,
          ctaHref: '#',
        },
      ],
    },
  ], [])

  const activeGroup = groups.find(g => g.id === activeTab) || groups[0]

  // Flatten all bundles from all groups for continuous scrolling (mobile only)
  const allBundles = groups.flatMap(group => group.bundles)

  // Create a map from bundle id to group id
  const bundleToGroupMap = useMemo(() => {
    const map = new Map<string, 'trio' | 'four' | 'classics'>()
    groups.forEach(group => {
      group.bundles.forEach(bundle => {
        map.set(bundle.id, group.id as 'trio' | 'four' | 'classics')
      })
    })
    return map
  }, [groups])

  // Refs for scroll container and bundle cards
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bundleRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const activeTabRef = useRef(activeTab)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Keep activeTabRef in sync with activeTab
  useEffect(() => {
    activeTabRef.current = activeTab
  }, [activeTab])

  // Set ref for a bundle card
  const setBundleRef = (bundleId: string) => (el: HTMLDivElement | null) => {
    if (el) {
      bundleRefs.current.set(bundleId, el)
    } else {
      bundleRefs.current.delete(bundleId)
    }
  }

  // Observe bundle visibility and update active tab (only on mobile/horizontal scroll)
  useEffect(() => {
    if (typeof window === 'undefined' || !scrollContainerRef.current) return

    // Check if we're in mobile view (horizontal scroll)
    const checkMobile = () => {
      return window.innerWidth < 768 // md breakpoint
    }

    if (!checkMobile()) return // Only enable on mobile

    const observers: IntersectionObserver[] = []
    const visibleBundles = new Map<string, number>() // bundleId -> intersectionRatio

    const updateActiveTab = () => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Use shorter debounce if scrolling, longer if not
      const debounceTime = isScrollingRef.current ? 50 : 100

      debounceTimerRef.current = setTimeout(() => {
        if (!scrollContainerRef.current) return

        // Find the bundle that is most centered in the viewport
        let mostCenteredBundleId: string | null = null
        let minDistanceToCenter = Infinity

        // Get all visible elements and calculate their center distance
        allBundles.forEach(bundle => {
          const element = bundleRefs.current.get(bundle.id)
          if (!element || !scrollContainerRef.current) return

          const containerRect = scrollContainerRef.current.getBoundingClientRect()
          const bundleRect = element.getBoundingClientRect()
          
          // Check if bundle is visible in the viewport
          const isVisible = bundleRect.left < containerRect.right && bundleRect.right > containerRect.left
          if (!isVisible) return

          // Calculate distance from bundle center to container center
          const containerCenter = containerRect.left + containerRect.width / 2
          const bundleCenter = bundleRect.left + bundleRect.width / 2
          const distanceToCenter = Math.abs(bundleCenter - containerCenter)

          // Choose the bundle closest to center
          if (distanceToCenter < minDistanceToCenter) {
            minDistanceToCenter = distanceToCenter
            mostCenteredBundleId = bundle.id
          }
        })

        if (mostCenteredBundleId) {
          const groupId = bundleToGroupMap.get(mostCenteredBundleId)
          if (groupId && groupId !== activeTabRef.current) {
            setActiveTab(groupId)
          }
        }
      }, debounceTime)
    }

    // Observe all bundles for intersection (for reference, but we use direct calculation)
    allBundles.forEach(bundle => {
      const element = bundleRefs.current.get(bundle.id)
      if (!element) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleBundles.set(bundle.id, entry.intersectionRatio)
            } else {
              visibleBundles.delete(bundle.id)
            }
          })
        },
        {
          root: scrollContainerRef.current, // Use scroll container as root
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        }
      )

      observer.observe(element)
      observers.push(observer)
    })

    // Handle scroll events to detect when user is scrolling
    const handleScroll = () => {
      isScrollingRef.current = true
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Also check during scroll for more responsive updates
      updateActiveTab()

      // Mark as not scrolling after scroll ends and trigger final tab update
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false
        // Force final update after scrolling stops
        updateActiveTab()
      }, 150) // Delay to ensure scroll has fully stopped
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    }

    // Initial check after a short delay to allow DOM to settle
    setTimeout(() => {
      updateActiveTab()
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
      observers.forEach(observer => observer.disconnect())
      visibleBundles.clear()
    }
  }, [allBundles, bundleToGroupMap])

  // Scroll to the first bundle of a group when tab is clicked
  const scrollToGroup = (groupId: 'trio' | 'four' | 'classics') => {
    // Update tab immediately
    setActiveTab(groupId)

    // Only scroll on mobile (horizontal scroll)
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return // Desktop uses grid layout, no need to scroll
    }

    // Find the first bundle of the group
    const group = groups.find(g => g.id === groupId)
    if (!group) return

    const firstBundleId = group.bundles[0].id
    const bundleElement = bundleRefs.current.get(firstBundleId)

    if (bundleElement && scrollContainerRef.current) {
      // Temporarily update ref to prevent observer from interfering
      activeTabRef.current = groupId

      bundleElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }

  const faqs = [
    {
      q: 'Can I choose which stories go into my package?',
      a: 'Yes! You can freely choose from any of our 5 stories to create your bundle.',
    },
    {
      q: 'What’s the difference between Classic (Hardcover) and Premium (Lay-flat) editions?',
      a: 'Classic hardcover is durable and perfect for everyday reading. Premium lay-flat has an elegant butterfly binding that opens fully flat—an ideal keepsake for years to come.',
    },
    {
      q: 'Will my package arrive before Christmas?',
      a: 'Each book is made within 48 hours, and delivery usually takes 5–14 business days depending on your location. You can also check shipping times by country at checkout.',
    },
    {
      q: 'Can I personalize each book differently?',
      a: 'Absolutely—each book can feature a different child’s name, photo, and details. Perfect for siblings, cousins, or friends.',
    },
    {
      q: 'What age are these books suitable for?',
      a: 'Each story has a recommended age range—you can find the details on the product page to choose the best fit for your child.',
    },
    {
      q: 'Can I ship one package to multiple addresses?',
      a: 'Not at the moment—each package can only be shipped to one address. If you’d like to send to multiple families, we recommend placing separate orders.',
    },
    {
      q: 'Can I combine packages with other promotions?',
      a: 'No—packages already include multi-book discounts plus exclusive Christmas extras, making them the best-value option this season.',
    },
    {
      q: 'Do you ship internationally?',
      a: 'Yes, we deliver worldwide. Shipping costs are calculated at checkout.',
    },
  ]

  return (
    <div className="bg-[#FCF2F2]">
      {/* Hero/Banner */}
      <div className="relative overflow-hidden md:-mt-20">
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background: [
              'linear-gradient(358.86deg, rgba(199, 26, 31, 0) 74.91%, #C81F24 97.16%)',
              'linear-gradient(277.52deg, rgba(163, 34, 38, 0) 43.35%, #B8191E 67.17%)',
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
              src="https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/christmas/banner.png"
              alt="Christmas banner"
              fill
              className="object-cover object-right md:object-top"
              priority
            />
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="relative flex flex-col gap-6 md:gap-12">
        <div className="absolute pointer-events-none z-0" style={{ left: 'clamp(0px, 2vw, 180px)' }}>
          <svg viewBox="0 0 346 253" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 'clamp(160px, 24vw, 346px)', height: 'auto' }}>
            <g clipPath="url(#clip0_5139_8502)">
              <path d="M253.412 11.5836C242.682 2.05637 236.166 -4.44357 233.863 -7.9186C231.635 -11.2831 228.523 -19.1066 224.528 -31.3867C224.275 -32.1644 223.842 -32.8713 223.264 -33.4495C222.685 -34.0277 221.978 -34.4608 221.201 -34.7133C220.423 -34.9659 219.596 -35.0308 218.788 -34.9027C217.981 -34.7745 217.215 -34.457 216.553 -33.9761C206.83 -26.9048 199.922 -22.7335 195.833 -21.4634C191.554 -20.1345 181.902 -19.3522 166.882 -19.1164C166.115 -19.1045 165.359 -18.9222 164.671 -18.5826C163.982 -18.243 163.378 -17.7547 162.901 -17.1529C162.424 -16.5511 162.087 -15.8509 161.914 -15.1029C161.741 -14.355 161.736 -13.5779 161.9 -12.8279C167.258 11.6739 168.377 28.3014 165.258 37.0581C162.701 44.2375 156.383 54.5908 146.303 68.1122C145.091 69.7373 144.278 71.6241 143.929 73.6207C143.579 75.6173 143.703 77.6681 144.29 79.6081C144.878 81.5481 145.912 83.3232 147.31 84.7907C148.709 86.2581 150.432 87.3769 152.341 88.0572L196.667 103.844C198.578 104.525 200.623 104.747 202.636 104.492C204.648 104.238 206.573 103.515 208.255 102.38C209.938 101.246 211.33 99.7318 212.319 97.9608C213.309 96.1898 213.869 94.211 213.954 92.1839C214.654 75.5761 216.318 63.575 218.952 56.1816C222.18 47.1177 233.586 34.9028 253.169 19.5368C253.766 19.0683 254.253 18.4743 254.595 17.797C254.938 17.1196 255.127 16.3754 255.15 15.6169C255.173 14.8583 255.029 14.104 254.728 13.4073C254.427 12.7105 253.977 12.0883 253.409 11.5847L253.412 11.5836Z" fill="#11BC68"/>
              <path d="M68.3875 99.4226C67.7877 85.0864 66.8702 75.9286 65.6338 71.9469C64.4353 68.0934 60.3404 60.7366 53.3501 49.8788C52.9073 49.1913 52.6334 48.4087 52.551 47.5951C52.4686 46.7814 52.58 45.9599 52.876 45.1975C53.172 44.4351 53.6442 43.7536 54.2541 43.2088C54.8639 42.6639 55.5941 42.2712 56.3849 42.0626C68.0109 38.9981 75.6095 36.2826 79.1785 33.9171C82.9132 31.4414 89.6185 24.458 99.298 12.9681C99.7925 12.3808 100.411 11.9107 101.11 11.5918C101.808 11.2729 102.569 11.1132 103.336 11.1242C104.104 11.1352 104.859 11.3166 105.548 11.6554C106.237 11.9942 106.842 12.4819 107.32 13.0831C122.919 32.7225 135.095 44.101 143.852 47.2199C151.031 49.7769 163.048 51.4255 179.897 52.1622C181.922 52.2508 183.898 52.8134 185.666 53.8048C187.434 54.7961 188.945 56.1885 190.077 57.87C191.208 59.5515 191.93 61.4751 192.183 63.4863C192.436 65.4974 192.214 67.5398 191.534 69.4494L175.747 113.775C175.066 115.686 173.946 117.411 172.476 118.809C171.007 120.208 169.229 121.243 167.287 121.829C165.344 122.415 163.291 122.537 161.293 122.184C159.295 121.832 157.408 121.015 155.784 119.799C142.473 109.843 132.121 103.546 124.728 100.913C115.664 97.6848 98.9893 98.8012 74.7032 104.262C73.9628 104.429 73.1947 104.431 72.4533 104.268C71.712 104.106 71.0154 103.782 70.4129 103.32C69.8105 102.859 69.3168 102.27 68.9668 101.597C68.6168 100.923 68.419 100.181 68.3875 99.4226Z" fill="#11BC68"/>
              <path d="M205.07 7.42766C202.629 6.55839 200.974 7.34408 200.105 9.78473L183.589 56.1571C182.719 58.5978 183.505 60.2527 185.946 61.122C188.386 61.9913 190.041 61.2056 190.911 58.7649L207.427 12.3925C208.296 9.95189 207.51 8.29693 205.07 7.42766Z" fill="#09A35C"/>
              <path d="M93.7963 60.2597C94.6656 57.8191 96.3206 57.0334 98.7612 57.9027L145.134 74.4188C147.574 75.2881 148.36 76.943 147.491 79.3837C146.621 81.8243 144.966 82.61 142.526 81.7407L96.1534 65.2246C93.7128 64.3554 92.9271 62.7004 93.7963 60.2597Z" fill="#09A35C"/>
              <path d="M262.663 100.159C264.852 104.77 266.111 109.766 266.369 114.863C266.627 119.96 265.878 125.058 264.166 129.865C262.454 134.673 259.811 139.096 256.389 142.883C252.968 146.669 248.833 149.745 244.223 151.933C239.613 154.122 234.617 155.381 229.52 155.639C224.423 155.897 219.325 155.148 214.517 153.436C209.709 151.724 205.286 149.081 201.5 145.66C197.713 142.238 194.638 138.104 192.449 133.493C190.26 128.883 189.001 123.887 188.743 118.79C188.485 113.693 189.234 108.595 190.946 103.787C192.659 98.9796 195.301 94.5563 198.723 90.7698C202.145 86.9834 206.279 83.908 210.889 81.7193C215.499 79.5305 220.496 78.2713 225.593 78.0134C230.69 77.7556 235.787 78.5042 240.595 80.2165C245.403 81.9288 249.826 84.5713 253.613 87.9931C257.399 91.4149 260.474 95.5489 262.663 100.159Z" fill="#E30027"/>
              <path d="M201.799 129.056C203.988 133.667 205.247 138.663 205.505 143.76C205.763 148.857 205.014 153.955 203.302 158.762C201.589 163.57 198.947 167.993 195.525 171.78C192.103 175.566 187.969 178.642 183.359 180.83C178.749 183.019 173.752 184.278 168.655 184.536C163.558 184.794 158.46 184.045 153.653 182.333C148.845 180.621 144.422 177.978 140.635 174.556C136.849 171.135 133.774 167.001 131.585 162.39C127.164 153.079 126.624 142.394 130.082 132.684C133.54 122.975 140.714 115.037 150.025 110.616C159.336 106.196 170.021 105.655 179.731 109.113C189.44 112.572 197.378 119.745 201.799 129.056Z" fill="#E30027"/>
              <path d="M212.235 72.4781C214.424 77.0884 215.683 82.0847 215.941 87.1817C216.199 92.2787 215.45 97.3765 213.738 102.184C212.026 106.992 209.383 111.415 205.962 115.202C202.54 118.988 198.406 122.063 193.795 124.252C189.185 126.441 184.189 127.7 179.092 127.958C173.995 128.216 168.897 127.467 164.089 125.755C159.282 124.043 154.858 121.4 151.072 117.978C147.286 114.557 144.21 110.423 142.021 105.812C137.601 96.5012 137.06 85.8156 140.519 76.1061C143.977 66.3966 151.15 58.4585 160.461 54.0381C169.772 49.6178 180.458 49.0772 190.167 52.5354C199.877 55.9935 207.815 63.1672 212.235 72.4781Z" fill="#FB003A"/>
            </g>
            <defs>
              <clipPath id="clip0_5139_8502">
                <rect width="259.083" height="259.083" fill="white" transform="matrix(-0.903365 0.428872 0.428872 0.903365 234.047 -93)"/>
              </clipPath>
            </defs>
          </svg>
        </div>
        <div className="absolute pointer-events-none z-0" style={{ right: 'clamp(60px, 20vw, 550px)', top: 'clamp(40px, 15vh, 220px)' }}>
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 'clamp(36px, 4.5vw, 60px)', height: 'auto' }}>
            <g clipPath="url(#clip0_5139_8350)">
            <path d="M55.3118 10.1655L34.027 5.25622C33.4249 5.10922 32.7997 5.08324 32.1875 5.17978C31.5753 5.27632 30.9884 5.49346 30.4608 5.81861C29.9332 6.14375 29.4755 6.57042 29.1141 7.07387C28.7527 7.57732 28.4948 8.14752 28.3555 8.7514C28.2162 9.35527 28.1982 9.9808 28.3025 10.5917C28.4069 11.2026 28.6315 11.7867 28.9633 12.3101C29.2952 12.8335 29.7277 13.2858 30.2357 13.6407C30.7437 13.9957 31.3171 14.2462 31.9227 14.3778L53.209 19.2882C53.808 19.4263 54.4283 19.445 55.0345 19.3434C55.6408 19.2417 56.2211 19.0216 56.7423 18.6957C57.2635 18.3698 57.7154 17.9444 58.0722 17.4438C58.4289 16.9432 58.6837 16.3773 58.8217 15.7783C58.96 15.1793 58.9789 14.5589 58.8774 13.9526C58.7758 13.3462 58.5557 12.7659 58.2298 12.2446C57.9038 11.7234 57.4783 11.2715 56.9777 10.9147C56.477 10.558 55.9109 10.3034 55.3118 10.1655Z" fill="#DAE2E5"/>
            <path opacity="0.1" d="M55.4328 16.5973L31.1056 10.9862C29.9486 10.7193 29.0079 10.0346 28.3672 9.14062C28.0163 11.5301 29.5316 13.8251 31.9246 14.3777L53.2108 19.2881C55.6041 19.8392 57.9713 18.4388 58.7012 16.1384C57.7351 16.661 56.59 16.8634 55.4328 16.5973Z" fill="black"/>
            <path d="M31.9241 14.3783L27.7153 32.623L15.5528 29.818C9.67678 28.4613 3.8102 32.1293 2.4548 38.0064C1.09975 43.882 4.7662 49.7483 10.6426 51.1035L33.4492 56.3646C39.3256 57.7199 45.191 54.0532 46.5464 48.1761L53.2103 19.2887L31.9241 14.3783Z" fill="#EF4D4D"/>
            <path d="M50.0181 23.8245L47.3702 25.4793L45.7168 22.8326C45.4974 22.4818 45.1476 22.2326 44.7445 22.1397C44.3413 22.0468 43.9177 22.1178 43.5669 22.3371L40.9208 23.9915L39.2658 21.3444C39.1574 21.1705 39.0158 21.0198 38.8491 20.9008C38.6824 20.7817 38.4938 20.6967 38.2942 20.6507C38.0946 20.6046 37.8879 20.5983 37.6858 20.6323C37.4838 20.6662 37.2904 20.7396 37.1168 20.8484L34.4713 22.5036L32.8167 19.855C32.3833 19.1638 31.4998 18.9466 30.7868 19.3142L29.8034 23.5814L30.9968 22.8346L32.6512 25.4808C33.1084 26.2111 34.0694 26.4324 34.8028 25.9758L37.448 24.322L39.1016 26.968C39.3208 27.3187 39.6703 27.568 40.0732 27.6611C40.4761 27.7543 40.8995 27.6837 41.2504 27.4648L43.8977 25.8091L45.5511 28.4558C45.7706 28.8071 46.1207 29.0567 46.5242 29.1498C46.9278 29.243 47.3519 29.172 47.7031 28.9526L50.3491 27.299L51.089 28.4837L52.0727 24.2189C51.5889 23.5834 50.7075 23.3923 50.0181 23.8245ZM48.3076 31.2411L45.659 32.8957L44.0067 30.2476C43.7867 29.8972 43.4368 29.6483 43.0336 29.5555C42.6304 29.4627 42.2068 29.5337 41.8558 29.7527L39.2095 31.4078L37.5571 28.7605C37.3374 28.4099 36.9875 28.1607 36.5842 28.0678C36.181 27.9749 35.7574 28.0458 35.4064 28.2649L32.7606 29.9209L31.1059 27.2731C30.6728 26.5803 29.7893 26.3632 29.0765 26.73L28.0906 30.9974L29.285 30.2501L30.9401 32.8964C31.3974 33.6267 32.358 33.8495 33.0905 33.3935L35.7375 31.7386L37.3902 34.3851C37.8473 35.1163 38.8098 35.3379 39.5403 34.8798L42.1861 33.227L43.8402 35.8739C44.2994 36.6031 45.2602 36.8251 45.9913 36.368L48.638 34.7146L49.3774 35.8984L50.3614 31.6353C49.8792 31.0001 48.9976 30.8098 48.3076 31.2411Z" fill="#EACA44"/>
            <path opacity="0.15" d="M31.5879 15.9156L31.9386 14.3952L53.2239 19.3062L52.8741 20.826L31.5879 15.9156ZM31.9308 56.012L33.4502 56.3633C39.3266 57.7185 45.1921 54.0519 46.5475 48.1748L46.8982 46.6544C40.1816 45.1063 33.4798 49.2948 31.9308 56.012Z" fill="black"/>
            </g>
            <defs>
              <clipPath id="clip0_5139_8350">
                <rect width="50" height="50" fill="white" transform="translate(11.1426) rotate(12.8754)"/>
              </clipPath>
            </defs>
          </svg>
        </div>
        <div className="relative z-10 w-full max-w-2xl mx-auto pt-20 md:px-10 text-center flex flex-col gap-6">
          <p className="text-[#222222] font-semibold md:font-medium text-[24px] md:text-[40px] md:leading-[56px]">
            Which little ones do you want to surprise this Christmas?
          </p>
          <p
            className="mx-auto text-center text-[#222222]"
            style={{
              maxWidth: 'clamp(280px, 60vw, 720px)',
              fontSize: 'clamp(14px, 1.5vw, 18px)',
              lineHeight: 'clamp(20px, 2.2vw, 28px)'
            }}
          >
            Choose any stories you love, bundle joy for the whole family.
          </p>
        </div>

        <div className="relative w-full max-w-[1012px] z-10 mx-auto px-3 h-[60px]">
          <div className="bg-[#FCE5E5] h-[60px] rounded-full p-1 md:p-2 flex items-center gap-[6px] md:gap-12">
            {groups.map(g => (
              <button
                key={g.id}
                onClick={() => {
                  scrollToGroup(g.id as typeof activeTab)
                }}
                className={`flex-1 text-[14px] font-medium md:text-bold md:px-3 md:gap-[10px] h-full rounded-full text-center ${
                  activeTab === g.id
                    ? 'bg-white text-[#222222]'
                    : 'text-[#222222] hover:bg-[#FADADA]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bundles */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-12">
          <div ref={scrollContainerRef} className="flex md:grid md:grid-cols-2 gap-3 md:gap-12 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 md:pb-0 scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0">
            {/* Mobile: show all bundles for continuous scrolling */}
            {/* Desktop: show only active group bundles */}
            {allBundles.map((bundle, index) => {
              const bundleGroupId = bundleToGroupMap.get(bundle.id)
              const isActiveGroup = bundleGroupId === activeTab
              
              return (
                <div 
                  key={bundle.id} 
                  ref={setBundleRef(bundle.id)} 
                  className={`min-w-[calc(75vw-2rem)] md:min-w-0 snap-center flex-shrink-0 md:flex-shrink ${!isActiveGroup ? 'md:hidden' : ''}`}
                  style={{
                    scrollSnapAlign: 'center',
                    scrollSnapStop: 'always'
                  } as React.CSSProperties}
                >
                  <BundleCard bundle={bundle} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="py-12 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <p className="text-center text-[22px] md:text-[40px] font-medium text-[#222222] mb-12">Christmas Package FAQ</p>
          <div className="divide-y divide-black/10">
            {faqs.map((f, idx) => (
              <FaqRow key={idx} index={idx} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>
    </div>
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


