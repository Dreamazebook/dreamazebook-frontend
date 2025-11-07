'use client';

import React from 'react';
import Image from 'next/image';

interface OccasionCard {
  id: string;
  title: string;
  description: string;
  image: string;
  bookImage?: string; // 书籍封面图片
}

interface OccasionsSectionProps {
  title?: string;
  description?: string;
  cards?: OccasionCard[];
}

const OccasionsSection: React.FC<OccasionsSectionProps> = ({
  title = "From birthdays to bedtime, every moment is a chance to plant the seed of self-recognition",
  description = "Discover how our books fit into every occasion-as gift, as bonding moments, and as keepsakes foe families.",
  cards = [
    {
      id: '1',
      title: 'Bedtime',
      description: 'turn every night into a moment of comfort and connection',
      image: '/character-placeholder.png',
      bookImage: '/character-placeholder.png',
    },
    {
      id: '2',
      title: 'Birthday',
      description: 'make their special day even more memorable',
      image: '/character-placeholder.png',
      bookImage: '/character-placeholder.png',
    },
    {
      id: '3',
      title: 'Gift',
      description: 'the perfect present that shows you care',
      image: '/character-placeholder.png',
      bookImage: '/character-placeholder.png',
    },
    {
      id: '4',
      title: 'Bonding',
      description: 'create lasting memories together',
      image: '/character-placeholder.png',
      bookImage: '/character-placeholder.png',
    },
    {
      id: '5',
      title: 'Keepsake',
      description: 'treasure these moments forever',
      image: '/character-placeholder.png',
      bookImage: '/character-placeholder.png',
    },
  ],
}) => {
  if (!cards || cards.length === 0) return null;

  return (
    <section 
      className="w-full bg-white hidden md:block"
      style={{
        paddingTop: '88px',
        paddingRight: '120px',
        paddingBottom: '88px',
        paddingLeft: '120px',
        gap: '48px',
        opacity: 1,
      }}
    >
      <div className="flex flex-col gap-[48px]">
        {/* Title and Description */}
        <div 
          className="flex flex-row gap-[24px] items-start"
          style={{
            minHeight: '120px',
            gap: '24px',
            opacity: 1,
          }}
        >
          <h2
            className="text-[#222222] text-[40px] flex-1"
            style={{ 
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500,
              fontSize: '40px',
              lineHeight: '40px',
            }}
          >
            {title}
          </h2>
          <p
            className="text-[#222222] text-[16px] flex-1"
            style={{ 
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
            }}
          >
            {description}
          </p>
        </div>

        {/* Cards Grid Container */}
        <div
          className="flex flex-row gap-[24px]"
          style={{
            gap: '24px',
            opacity: 1,
          }}
        >
          {/* First Column - 1 card */}
          <div className="flex flex-col gap-[24px] flex-1">
            {cards.slice(0, 1).map((card) => (
              <div
                key={card.id}
                className="relative bg-[#F5E3E3] rounded-[12px] flex flex-col overflow-hidden w-full"
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
                
                {/* Book Cover Overlay */}
                {card.bookImage && (
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
                )}

                {/* Text Content */}
                <div className="relative z-10 flex flex-col gap-[4px] mt-auto">
                  <h3
                    className="text-[#222222] font-bold text-[18px]"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-[#222222] font-normal text-[14px] leading-relaxed"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Second Column - 2 cards */}
          <div className="flex flex-col gap-[24px] flex-1">
            {cards.slice(1, 3).map((card) => (
              <div
                key={card.id}
                className="relative bg-[#F5E3E3] rounded-[12px] flex flex-col overflow-hidden w-full"
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
                
                {/* Book Cover Overlay */}
                {card.bookImage && (
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
                )}

                {/* Text Content */}
                <div className="relative z-10 flex flex-col gap-[4px] mt-auto">
                  <h3
                    className="text-[#222222] font-bold text-[18px]"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-[#222222] font-normal text-[14px] leading-relaxed"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Third Column - 3 cards */}
          <div className="flex flex-col gap-[24px] flex-1">
            {cards.slice(3, 6).map((card) => (
              <div
                key={card.id}
                className="relative bg-[#F5E3E3] rounded-[12px] flex flex-col overflow-hidden w-full"
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
                
                {/* Book Cover Overlay */}
                {card.bookImage && (
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
                )}

                {/* Text Content */}
                <div className="relative z-10 flex flex-col gap-[4px] mt-auto">
                  <h3
                    className="text-[#222222] font-bold text-[18px]"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-[#222222] font-normal text-[14px] leading-relaxed"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OccasionsSection;

