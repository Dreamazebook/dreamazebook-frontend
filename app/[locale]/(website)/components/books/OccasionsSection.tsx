'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface OccasionCard {
  id: string;
  title: string;
  description: string;
  image: string;
  imageDesktop?: string;
  bookId?: string;
}

interface OccasionsSectionProps {
  title?: string;
  description?: string;
  cards?: OccasionCard[];
}

const OccasionsSection: React.FC<OccasionsSectionProps> = ({
  title = "From birthdays to bedtime, every moment is a chance to plant the seed of self-recognition",
  description = "Discover how our books fit into every occasion — as gifts, as bonding moments, and as keepsakes for families.",
  cards = [
    {
      id: '1',
      title: 'Bedtime',
      description: 'Turn every night into a moment of comfort and connection.',
      image: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Bedtime-MOBILE.png',
      imageDesktop: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Bedtime.png',
      bookId: 'PICBOOK_GOODNIGHT3',
    },
    {
      id: '2',
      title: 'Birthday',
      description: 'A keepsake gift that makes their special day unforgettable.',
      image: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Birthday-MOBILE.png',
      imageDesktop: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Birthday.png',
      bookId: 'PICBOOK_BIRTHDAY',
    },
    {
      id: '3',
      title: 'Baby Shower',
      description: 'Welcome little ones with a personalized treasure made just for them.',
      image: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Baby-Shower-MOBILE.png',
      imageDesktop: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Baby-Shower.png',
      bookId: 'PICBOOK_MELODY',
    },
    {
      id: '4',
      title: 'Family Time',
      description: 'Celebrate togetherness with stories that everyone can share.',
      image: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Family-Time-MOBILE.png',
      imageDesktop: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Family-Time.png',
      bookId: 'PICBOOK_BRAVEY',
    },
    {
      id: '5',
      title: 'Christmas Time',
      description: 'The most heartfelt gift under the tree — made for your child.',
      image: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Christmas-Time-MOBILE.png',
      imageDesktop: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/from-birthdays-to-bedtime/Christmas-Time.png',
      bookId: 'PICBOOK_SANTA',
    },
  ],
}) => {
  if (!cards || cards.length === 0) return null;

  return (
    <section 
      className="w-full bg-[#FFFCF7] pt-[64px] pr-[18px] pb-[64px] pl-[18px] md:pt-[88px] md:pr-[120px] md:pb-[88px] md:pl-[120px]"
      style={{
        opacity: 1,
      }}
    >
      <div className="flex flex-col gap-[24px] md:gap-[48px]">
        {/* Title and Description */}
        <div className="flex flex-col md:flex-row gap-[12px] md:gap-[24px] items-start">
          <h2 className="text-[#222222] md:text-[40px] text-[24px] leading-[32px] md:leading-[40px] md:font-medium font-semibold flex-1">
            {title}
          </h2>
          <p className="text-[#222222] text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px] w-[calc((100%-44px)/2)] md:w-[calc((100%-48px)/3)]">
            {description}
          </p>
        </div>

        {/* Cards Grid Container */}
        <div className="flex flex-row gap-[8px] md:gap-[24px] items-start md:justify-start -mt-[72px] md:mt-0">
          {/* Mobile: First Column - 2 cards, Desktop: First Column - 1 card - 垂直居中 */}
          <div className="flex flex-col gap-[8px] md:gap-[24px] flex-1 self-center">
            {/* Mobile: show 2 cards */}
            {cards.slice(0, 2).map((card) => (
              <Link
                key={`mobile-${card.id}`}
                href={card.bookId ? `/books/${card.bookId}` : '#'}
                className="md:hidden w-full"
              >
                <div
                  className="relative bg-[#F5E3E3] flex flex-col overflow-hidden rounded-[8px] w-full cursor-pointer"
                  style={{
                    aspectRatio: '331/360', // 165.5/180 = 331/360
                    padding: '24px',
                    gap: '36px',
                    opacity: 1,
                    borderRadius: '8px',
                  }}
                >
                  {/* Background Image - Baby with book */}
                {card.image && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                      style={{ objectPosition: 'center' }}
                    />
                  </div>
                )}
                  
                  {/* Gradient Overlay */}
                  <div
                    className="absolute inset-0 z-[1]"
                    // style={{
                    //   background: 'linear-gradient(197.76deg, rgba(249, 232, 232, 0) 33.41%, #F9E8E8 70.1%)',
                    // }}
                  />

                  {/* Text Content */}
                  <div className="relative z-10 flex flex-col mt-auto gap-1 md:gap-[36px]">
                    <h3 className="text-[#FFFFFF] font-bold text-[18px] leading-[24px] tracking-[0.15px]">
                      {card.title}
                    </h3>
                    <p className="text-[#FFFFFF] font-normal text-[14px] leading-[20px] tracking-[0.25px] md:text-[#FFFFFF] md:text-[16px] md:leading-[24px] md:tracking-[0.5px]">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {/* Desktop: show only first card */}
            {cards.slice(0, 1).map((card) => (
              <Link
                key={`desktop-${card.id}`}
                href={card.bookId ? `/books/${card.bookId}` : '#'}
                className="hidden md:block"
              >
                <div
                  className="relative bg-[#F5E3E3] rounded-[12px] flex flex-col overflow-hidden w-full cursor-pointer"
                style={{
                  aspectRatio: '3/4',
                  paddingTop: '31.25%', // 160/512 = 31.25%
                  paddingRight: '12.5%', // 48/384 = 12.5%
                  paddingBottom: '9.375%', // 48/512 = 9.375%
                  paddingLeft: '12.5%', // 48/384 = 12.5%
                  gap: '4px',
                  opacity: 1,
                  borderRadius: '12px',
                }}
              >
                {/* Background Image - Baby with book */}
                {(card.imageDesktop || card.image) && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={card.imageDesktop || card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                      style={{ objectPosition: 'center' }}
                    />
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0 z-[1]"
                  // style={{
                  //   background: 'linear-gradient(197.76deg, rgba(249, 232, 232, 0) 33.41%, #F9E8E8 70.1%)',
                  // }}
                />
                
                {/* Book Cover Overlay */}
                {/* {card.bookImage && (
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2 z-10"
                    style={{
                      top: '9.375%', // 48/512 = 9.375%
                      width: '52.08%', // 200/384 ≈ 52.08%
                      aspectRatio: '4/3', // 200:150 = 4:3
                    }}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={card.bookImage}
                        alt="Book cover"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )} */}

                {/* Text Content */}
                <div 
                  className="absolute z-10 flex flex-col gap-[4px]"
                  style={{
                    bottom: '9.375%', // paddingBottom
                    left: '12.5%', // paddingLeft
                    right: '12.5%', // paddingRight
                  }}
                >
                  <h3
                    className="text-[#FFFFFF] font-bold text-[18px] leading-[24px] tracking-[0.15px]"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-[#FFFFFF] font-normal text-[16px] leading-[24px] tracking-[0.5px]"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    {card.description}
                    </p>
                </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile: Second Column - 3 cards, Desktop: Second Column - 2 cards - 贴底部 */}
          <div className="flex flex-col gap-[8px] md:gap-[24px] flex-1 md:pt-22">
            {/* Mobile: show cards 2-4 (3 cards) */}
            {cards.slice(2, 5).map((card) => (
              <Link
                key={`mobile-col2-${card.id}`}
                href={card.bookId ? `/books/${card.bookId}` : '#'}
                className="md:hidden w-full"
              >
                <div
                  className="relative bg-[#F5E3E3] flex flex-col overflow-hidden rounded-[8px] w-full cursor-pointer"
                  style={{
                    aspectRatio: '331/360', // 165.5/180 = 331/360
                    padding: '24px',
                    gap: '36px',
                    opacity: 1,
                    borderRadius: '8px',
                  }}
                >
                  {/* Background Image - Baby with book */}
                {card.image && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                      style={{ objectPosition: 'center' }}
                    />
                  </div>
                )}
                  
                  {/* Gradient Overlay */}
                  <div
                    className="absolute inset-0 z-[1]"
                    // style={{
                    //   background: 'linear-gradient(197.76deg, rgba(249, 232, 232, 0) 33.41%, #F9E8E8 70.1%)',
                    // }}
                  />

                  {/* Text Content */}
                  <div className="relative z-10 flex flex-col mt-auto gap-1 md:gap-[36px]">
                    <h3 className="text-[#FFFFFF] font-bold text-[18px] leading-[24px] tracking-[0.15px]">
                      {card.title}
                    </h3>
                    <p className="text-[#FFFFFF] font-normal text-[14px] leading-[20px] tracking-[0.25px] md:text-[#FFFFFF] md:text-[16px] md:leading-[24px] md:tracking-[0.5px]">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {/* Desktop: show cards 1-2 (2 cards) */}
            {cards.slice(1, 3).map((card) => (
              <Link
                key={`desktop-col2-${card.id}`}
                href={card.bookId ? `/books/${card.bookId}` : '#'}
                className="hidden md:block"
              >
                <div
                  className="relative bg-[#F5E3E3] rounded-[12px] flex flex-col overflow-hidden w-full cursor-pointer"
                style={{
                  aspectRatio: '3/4',
                  paddingTop: '31.25%', // 160/512 = 31.25%
                  paddingRight: '12.5%', // 48/384 = 12.5%
                  paddingBottom: '9.375%', // 48/512 = 9.375%
                  paddingLeft: '12.5%', // 48/384 = 12.5%
                  gap: '4px',
                  opacity: 1,
                  borderRadius: '12px',
                }}
              >
                {/* Background Image - Baby with book */}
                {(card.imageDesktop || card.image) && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={card.imageDesktop || card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                      style={{ objectPosition: 'center' }}
                    />
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0 z-[1]"
                  // style={{
                  //   background: 'linear-gradient(197.76deg, rgba(249, 232, 232, 0) 33.41%, #F9E8E8 70.1%)',
                  // }}
                />
                
                {/* Book Cover Overlay */}
                {/* {card.bookImage && (
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2 z-10"
                    style={{
                      top: '9.375%', // 48/512 = 9.375%
                      width: '52.08%', // 200/384 ≈ 52.08%
                      aspectRatio: '4/3', // 200:150 = 4:3
                    }}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={card.bookImage}
                        alt="Book cover"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )} */}

                {/* Text Content */}
                <div 
                  className="absolute z-10 flex flex-col gap-[4px]"
                  style={{
                    bottom: '9.375%', // paddingBottom
                    left: '12.5%', // paddingLeft
                    right: '12.5%', // paddingRight
                  }}
                >
                  <h3
                    className="text-[#FFFFFF] font-bold text-[18px] leading-[24px] tracking-[0.15px]"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-[#FFFFFF] font-normal text-[16px] leading-[24px] tracking-[0.5px]"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    {card.description}
                    </p>
                </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Third Column - 3 cards - 贴顶部 (Desktop only) */}
          <div className="hidden md:flex flex-col gap-[24px] flex-1 self-start">
            {cards.slice(3, 6).map((card) => (
              <Link
                key={card.id}
                href={card.bookId ? `/books/${card.bookId}` : '#'}
                className="w-full"
              >
                <div
                  className="relative bg-[#F5E3E3] rounded-[12px] flex flex-col overflow-hidden w-full cursor-pointer"
                style={{
                  aspectRatio: '3/4',
                  paddingTop: '31.25%', // 160/512 = 31.25%
                  paddingRight: '12.5%', // 48/384 = 12.5%
                  paddingBottom: '9.375%', // 48/512 = 9.375%
                  paddingLeft: '12.5%', // 48/384 = 12.5%
                  gap: '4px',
                  opacity: 1,
                  borderRadius: '12px',
                }}
              >
                {/* Background Image - Baby with book */}
                {(card.imageDesktop || card.image) && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={card.imageDesktop || card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                      style={{ objectPosition: 'center' }}
                    />
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0 z-[1]"
                  // style={{
                  //   background: 'linear-gradient(197.76deg, rgba(249, 232, 232, 0) 33.41%, #F9E8E8 70.1%)',
                  // }}
                />
                
                {/* Book Cover Overlay */}
                {/* {card.bookImage && (
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2 z-10"
                    style={{
                      top: '9.375%', // 48/512 = 9.375%
                      width: '52.08%', // 200/384 ≈ 52.08%
                      aspectRatio: '4/3', // 200:150 = 4:3
                    }}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={card.bookImage}
                        alt="Book cover"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )} */}

                {/* Text Content */}
                <div 
                  className="absolute z-10 flex flex-col gap-[4px]"
                  style={{
                    bottom: '9.375%', // paddingBottom
                    left: '12.5%', // paddingLeft
                    right: '12.5%', // paddingRight
                  }}
                >
                  <h3
                    className="text-[#FFFFFF] font-bold text-[18px] leading-[24px] tracking-[0.15px]"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-[#FFFFFF] font-normal text-[16px] leading-[24px] tracking-[0.5px]"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    {card.description}
                    </p>
                </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OccasionsSection;

