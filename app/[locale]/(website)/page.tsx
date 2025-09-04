'use client';

import Button from '@/app/components/Button';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FaStar, FaRegStar, FaQuoteLeft } from 'react-icons/fa';
import React from 'react';
import InitialSpark from './components/home/InitialSpark';
import OurBook from './components/home/OurBook';
import SideLineProducts from './components/home/SideLineProducts';
import HappinessHarvest from './components/home/HappinessHarvest';
import LastingMemorial from './components/home/LastingMemorial';
import Slideshow from './components/home/SlideShow';
import PicBooksShow from './components/home/PicBooksShow';
import TestimonialCards from './components/home/TestimonialCards';
//import { Link } from "@/i18n/routing";

export default function HomePage() {
  const t = useTranslations('HomePage');
  
  // const features = [
  //   {
  //     icon: '🎁',
  //     title: t('feature1Title'),
  //     description: t('feature1Desc')
  //   },
  //   {
  //     icon: '✏️',
  //     title: t('feature2Title'),
  //     description: t('feature2Desc')
  //   },
  //   {
  //     icon: '🚀',
  //     title: t('feature3Title'),
  //     description: t('feature3Desc')
  //   }
  // ];

  const books = [
    {
      id: 1,
      title: t('book1Title'),
      description: t('book1Desc'),
      price: 29.99,
      image: '/books/book1.png'
    },
    {
      id: 2,
      title: t('book2Title'),
      description: t('book2Desc'),
      price: 24.99,
      image: '/books/book2.png'
    },
    {
      id: 3,
      title: t('book3Title'),
      description: t('book3Desc'),
      price: 27.99,
      image: '/books/book3.png'
    }
  ];

  const testimonials = [
    {
      name: t('testimonial1Name'),
      text: t('testimonial1Text'),
      rating: 5
    },
    {
      name: t('testimonial2Name'),
      text: t('testimonial2Text'),
      rating: 4
    }
  ];

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
      <Slideshow />

      <InitialSpark />

      <OurBook />

      <SideLineProducts />

      <PicBooksShow />

      <TestimonialCards />

      <LastingMemorial />

      {/* Newsletter */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">{t('newsletterTitle')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t('newsletterSubtitle')}
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <Button 
              // type="submit"
              className="px-6 py-3"
              tl={t('subscribe')}
            />
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">{t('faqTitle')}</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group border-b border-gray-200 dark:border-gray-700 pb-4">
                <summary className="flex justify-between items-center py-4 cursor-pointer">
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <span className="text-xl group-open:rotate-180 transition-transform">+</span>
                </summary>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}