'use client';

import Button from '@/app/components/Button';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FaStar, FaRegStar, FaQuoteLeft } from 'react-icons/fa';
import React, { useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import InitialSpark from './components/home/InitialSpark';
import OurBook from './components/home/OurBook';
import SideLineProducts from './components/home/SideLineProducts';
import LastingMemorial from './components/home/LastingMemorial';
import Slideshow from './components/home/SlideShow';
import PicBooksShow from './components/home/PicBooksShow';
// import TestimonialCards from './components/home/TestimonialCards';
import FAQ from '../(marketing)/components/FAQ';
import ReserveSection from '../(marketing)/components/ReserveSection';
import GiftPackage from './components/home/GiftPackage';

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
  const t = useTranslations('HomePage');

  const faqs = [
    {
      tl: 'Personalize It',
      ans: 'Add your child’s name, upload 1–3 photos, and choose a few fun details. (Tip: the better the photo quality, the more stunning the result!)',
      show: true
    },
    {
      tl: 'Preview & Confirm',
      ans: 'Flip through sample pages to see how your story looks—then confirm with one click.'
    },
    {
      tl: 'Receive & Enjoy',
      ans: ' Your one-of-a-kind gift is on its way. Unwrap it, read it together, and get ready for smiles that last.'
    }
  ];

  return (
    <main className="min-h-screen">
      {/* Slideshow doesn't need animation as it's already animated */}
      <Slideshow />

      <AnimatedSection>
        <InitialSpark />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <OurBook />
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
      <AnimatedSection delay={0.3}>
        <FAQ FAQs={faqs} />
      </AnimatedSection>

      {/* Newsletter */}
      <AnimatedSection className="bg-black text-white" delay={0.3}>
        <ReserveSection btnId="email_submit_mid" redirectUrl={'/en/welcome/success'} title={"Every child deserves to be the hero."} desc={'Sign up to Dreamaze community to receive free printables, coloring pages, and story samples.'} btnText="Sign up Now" />
      </AnimatedSection>

    </main>
  );
}