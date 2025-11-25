'use client';

import { useLocale } from 'next-intl';
import React, { useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import InitialSpark from './components/home/InitialSpark';
import SideLineProducts from './components/home/SideLineProducts';
import LastingMemorial from './components/home/LastingMemorial';
import Slideshow from './components/home/SlideShow';
import PicBooksShow from './components/home/PicBooksShow';
// import TestimonialCards from './components/home/TestimonialCards';
import ReserveSection from '../(marketing)/components/ReserveSection';
import GiftPackage from './components/home/GiftPackage';
import { Product } from '@/types/product';
import { getBooks } from '@/services/bookService';
import BooksGrid from './components/books/BooksGrid';
import WhatMakesDreamazeDifferent from './components/home/WhatMakesDreamazeDifferent';

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

  return (
    <main className="min-h-screen">
      {/* Slideshow doesn't need animation as it's already animated */}
      <Slideshow />

      <AnimatedSection>
        <InitialSpark />
      </AnimatedSection>

      <AnimatedSection>
        <WhatMakesDreamazeDifferent />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        {/* <OurBook /> */}
        <BooksGrid books={books} />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <PicBooksShow />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <SideLineProducts />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <GiftPackage />
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
        <ReserveSection btnId="email_submit_mid" redirectUrl={'/en/welcome/success'} title={"Every child deserves to be the hero."} desc={'Sign up to Dreamaze community to receive free printables, coloring pages, and story samples.'} btnText="Sign up Now" />
      </AnimatedSection>

    </main>
  );
}