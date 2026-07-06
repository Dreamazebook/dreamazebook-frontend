'use client';
import { HOME_SPARKS } from '@/constants/cdn';
import React from 'react';
import Image from '../common/Image';

interface MediaItem {
  src: string;
  mobileSrc?: string;
  alt: string;
  showStar: boolean;
  type: 'image' | 'video';
}

function MediaItemComponent({ item }: { item: MediaItem }) {
  return (
    <div className="w-[240px] h-[180px] md:w-[480px] md:h-[360px] flex-shrink-0 overflow-hidden rounded relative">
      {item.type === 'video' ? (
        <video
          src={item.src}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
        />
      ) : (
        <>
          {/* Mobile image: visible on small screens */}
          {item.mobileSrc && (
            <Image
              src={item.mobileSrc}
              alt={item.alt}
              className="w-full h-full object-cover md:hidden"
            />
          )}
          {/* Desktop image: visible on md+ */}
          <Image
            src={item.src}
            alt={item.alt}
            className={`w-full h-full object-cover ${item.mobileSrc ? 'hidden md:block' : ''}`}
          />
        </>
      )}
    </div>
  );
}

function MediaItemsList({ items }: { items: MediaItem[] }) {
  return (
    <div className="flex gap-[16px] md:gap-[24px]">
      {items.map((item, idx) => (
        <MediaItemComponent key={idx} item={item} />
      ))}
    </div>
  );
}

function TheHeartBehindDreamaze() {
  const mediaItems: MediaItem[] = [
    {
      src: HOME_SPARKS('video_1.mp4'),
      alt: 'Child reading books video',
      showStar: false,
      type: 'video',
    },
    {
      src: HOME_SPARKS('1.png'),
      mobileSrc: HOME_SPARKS('1-mobile.jpg'),
      alt: 'Child reading books',
      showStar: false,
      type: 'image',
    },
    {
      src: HOME_SPARKS('2.png'),
      mobileSrc: HOME_SPARKS('2-mobile.jpg'),
      alt: 'Young person reading magazine',
      showStar: true,
      type: 'image',
    },
    {
      src: HOME_SPARKS('3.png'),
      mobileSrc: HOME_SPARKS('3-mobile.jpg'),
      alt: 'Person reading with coffee',
      showStar: false,
      type: 'image',
    },
    {
      src: HOME_SPARKS('4.png'),
      mobileSrc: HOME_SPARKS('4-mobile.jpg'),
      alt: 'Child reading with parent',
      showStar: true,
      type: 'image',
    },
    {
      src: HOME_SPARKS('video_2.mp4'),
      alt: 'Family reading together video',
      showStar: false,
      type: 'video',
    },
    {
      src: HOME_SPARKS('5.png'),
      mobileSrc: HOME_SPARKS('5-mobile.jpg'),
      alt: 'Child reading book outdoors',
      showStar: false,
      type: 'image',
    }
  ];

  return (
    <div className="bg-white mt-[64px] md:mt-[88px] md:mb-[88px] space-y-[24px] text-center">
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          white-space: nowrap;
          will-change: transform;
          animation-name: marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>

      <h1 className="text-[24px] md:text-[40px] font-semibold">
        The Heart Behind Dreamaze
      </h1>
      
      <p className="text-[14px] md:text-[16px] text-[#222222] leading-relaxed px-[24px]">
        When children see themselves in the story, reading becomes real bonding.
      </p>

      <div className="overflow-hidden relative">
        <div
          className="flex gap-4 items-center animate-marquee"
          style={{
            animationDuration: '38s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        >
          <MediaItemsList items={mediaItems} />
          <MediaItemsList items={mediaItems} />
        </div>
      </div>
    </div>
  );
}

export default TheHeartBehindDreamaze;
