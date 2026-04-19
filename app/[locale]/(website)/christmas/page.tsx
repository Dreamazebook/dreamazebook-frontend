'use client'

import Image from 'next/image'
import BundlePromotionBlock, { type BundlePromotionBlockProps } from './BundlePromotionBlock'

const CHRISTMAS_PROMO: Pick<
  BundlePromotionBlockProps,
  'introTitle' | 'introSubtitle' | 'faqTitle' | 'faqs'
> = {
  introTitle: 'Choose Your Christmas Gift Set',
  introSubtitle: 'Gifts filled with joy, wonder, and meaningful keepsakes.',
  faqTitle: 'Christmas Package FAQ',
  faqs: [
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
  ],
}

export default function ChristmasPage() {
  return (
    <div className="bg-[#FCF2F2]">
      {/* Hero/Banner */}
      <div className="relative overflow-hidden md:-mt-20">
        <div className="absolute inset-0 z-[5] pointer-events-none" />
        <div className="relative h-[489px] md:h-[537px] mx-auto px-[10px]">
          <div className="relative z-10 flex flex-col gap-[24px] pt-6 md:gap-[88px] md:px-36 md:pt-36">
            <div className="text-[#FFFFFF] h-[196px] p-4 md:p-0 md:max-w-[736px]">
              <p className="text-[32px] leading-[40px] md:text-[64px] md:leading-[88px] font-medium">
                Watch Christmas Wonder Come Alive
              </p>
              <p className="mt-4 max-w-xl text-[14px] md:text-[16px] text-white/90">
                Personal, heartfelt, and truly magical.
              </p>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 md:top-[-36px] top-[0] z-0">
            <Image
              src="https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/christmas/banner-mobile.png"
              alt="Christmas banner"
              fill
              className="object-cover object-right block md:hidden"
              priority
            />
            <Image
              src="https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/christmas/banner.png"
              alt="Christmas banner"
              fill
              className="object-cover object-top hidden md:block"
              priority
            />
          </div>
        </div>
      </div>

      <BundlePromotionBlock {...CHRISTMAS_PROMO} />
    </div>
  )
}
