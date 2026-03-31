'use client';

import { useLocale } from 'next-intl';
import React, { useEffect, useMemo } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import TheHeartBehindDreamaze from './components/home/TheHeartBehindDreamaze';
import LastingMemorial from './components/home/LastingMemorial';
import Slideshow from './components/home/SlideShow';
import ReserveSection from '../(marketing)/components/ReserveSection';
import GiftPackage from './components/home/GiftPackage';
import { Product } from '@/types/product';
import { getBooks } from '@/services/bookService';
import BooksGrid from './components/books/BooksGrid';
import WhatMakesDreamazeDifferent from './components/home/WhatMakesDreamazeDifferent';
import TopPickThisMonth from './components/home/TopPickThisMonth';
import InfiniteScrollLogo from './components/home/InfiniteScrollLogo';
import StoriesFromRealFamilies from './components/home/StoriesFromRealFamilies';
import { DEFAULT_GIFT_PACKAGES_CONFIG } from './components/books/giftPackagesData';
import GiftPackagesSection from './components/books/GiftPackagesSection';
import { WELCOME_SUCCESS_URL } from '@/constants/links';

// 固定 Our Books 展示顺序：good night, santa, bravery, birthday, melody
const BOOK_DISPLAY_ORDER_RANK: Record<string, number> = {
  PICBOOK_GOODNIGHT3: 0,
  PICBOOK_GOODNIGHT: 0,
  PICBOOK_SANTA: 1,
  PICBOOK_BRAVEY: 2,
  PICBOOK_BIRTHDAY: 3,
  PICBOOK_MELODY: 4,
};

const getBookCode = (book: any): string =>
  String((book as any)?.spu_code ?? (book as any)?.id ?? (book as any)?.code ?? '').trim();

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, className = "", delay = 0 }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.8,
            delay: delay,
            ease: [0.22, 1, 0.36, 1]
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

export default function HomePage() {
  const locale = useLocale();

  const [books, setBooks] = React.useState<Product[]>([]);
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const {data} = await getBooks(locale);
        setBooks(data || []);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      }
    }

    fetchBooks();
  }, [locale]);

  const orderedBooks = useMemo(() => {
    const enriched = (books || []).map((book, index) => {
      const code = getBookCode(book);
      const rank = BOOK_DISPLAY_ORDER_RANK[code] ?? Number.MAX_SAFE_INTEGER;
      return { book, index, rank };
    });
    enriched.sort((a, b) => (a.rank - b.rank) || (a.index - b.index));
    return enriched.map(x => x.book);
  }, [books]);

  return (
    <main className="min-h-screen">
      {/* Slideshow doesn't need animation as it's already animated */}
      <AnimatedSection delay={0.0}>
        <Slideshow />
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <TheHeartBehindDreamaze />
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <WhatMakesDreamazeDifferent />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        {/* <OurBook /> */}
        <h2 className='text-[#222] text-[24px] md:text-[40px] font-medium text-center mb-3 mt-[64px] md:mt-[88px]'>Our Favorite<br className="md:hidden"/> Personalized Stories</h2>
        <p className='text-[#222] text-[14px] md:text-[16px] text-center mb-[24px] md:mb-[48px] leading-relaxed'>
          <span className='md:hidden'>Create the story that brings out their biggest smile.</span>
          <span className='hidden md:block'>Find the story where they become the hero.</span>
        </p>
        <BooksGrid books={orderedBooks} />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <GiftPackagesSection section={DEFAULT_GIFT_PACKAGES_CONFIG} />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <TopPickThisMonth />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <StoriesFromRealFamilies />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <InfiniteScrollLogo />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <LastingMemorial />
      </AnimatedSection>

      {/* FAQ */}
      {/* <AnimatedSection delay={0.3}>
        <FAQ FAQs={faqs} />
      </AnimatedSection> */}

      {/* Newsletter */}
      <AnimatedSection className="bg-black text-white" delay={0.3}>
        <ReserveSection cssClass='bg-white text-[#222222]' btnId="email_submit_mid" redirectUrl={WELCOME_SUCCESS_URL} title={"Every child deserves<br class='md:hidden' /> to be the hero."} desc={'Join the Dreamaze circle to get free printables, story samples, and early access gifts.'} btnText="Join Now" />
      </AnimatedSection>

    </main>
  );
}