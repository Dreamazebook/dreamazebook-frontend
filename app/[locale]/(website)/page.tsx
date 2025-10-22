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
import TestimonialCards from './components/home/TestimonialCards';

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
      question: t('faq1Question'),
      answer: t('faq1Answer')
    },
    {
      question: t('faq2Question'),
      answer: t('faq2Answer')
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
        <SideLineProducts />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <PicBooksShow />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <TestimonialCards />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <LastingMemorial />
      </AnimatedSection>

      {/* Newsletter */}
      <AnimatedSection className="py-20 bg-black text-white" delay={0.3}>
        <div className="container mx-auto px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold mb-6"
          >
            {t('newsletterTitle')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl mb-8 max-w-2xl mx-auto"
          >
            {t('newsletterSubtitle')}
          </motion.p>
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <Button 
              className="px-6 py-3"
              tl={t('subscribe')}
            />
          </motion.form>
        </div>
      </AnimatedSection>

      {/* FAQ */}
      <AnimatedSection className="py-20" delay={0.3}>
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-12"
          >
            {t('faqTitle')}
          </motion.h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.details 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group border-b border-gray-200 dark:border-gray-700 pb-4"
              >
                <summary className="flex justify-between items-center py-4 cursor-pointer">
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <span className="text-xl group-open:rotate-180 transition-transform">+</span>
                </summary>
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-gray-600 dark:text-gray-300 mt-2"
                >
                  {faq.answer}
                </motion.p>
              </motion.details>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}