import { HOME_SPARKS } from '@/constants/cdn';
import React from 'react';

interface MediaItem {
  src: string;
  alt: string;
  showStar: boolean;
  type: 'image' | 'video';
}

interface MediaItemProps {
  item: MediaItem;
  keyPrefix: string;
  index: number;
}

// Reusable component to render individual media items
function MediaItemComponent({ item, keyPrefix, index }: MediaItemProps) {
  return (
    <div key={`${keyPrefix}-${index}`} className="w-96 flex-shrink-0 overflow-hidden rounded relative">
      {item.type === 'video' ? (
        <video
          src={item.src}
          className="w-full h-60 object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <img src={item.src} alt={item.alt} className="w-full h-60 object-cover" />
      )}
    </div>
  );
}

// Reusable component to render media items list
function MediaItemsList({ items, keyPrefix }: { items: MediaItem[]; keyPrefix: string }) {
  return (
    <div className="flex gap-4">
      {items.map((item, idx) => (
        <MediaItemComponent
          key={`${keyPrefix}-${idx}`}
          item={item}
          keyPrefix={keyPrefix}
          index={idx}
        />
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
      alt: 'Child reading books',
      showStar: false,
      type: 'image',
    },
    {
      src: HOME_SPARKS('2.png'),
      alt: 'Young person reading magazine',
      showStar: true,
      type: 'image',
    },
    {
      src: HOME_SPARKS('3.png'),
      alt: 'Person reading with coffee',
      showStar: false,
      type: 'image',
    },
    {
      src: HOME_SPARKS('4.png'),
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
      alt: 'Child reading book outdoors',
      showStar: false,
      type: 'image',
    }
  ];

  return (
    <div className="bg-white py-12">
      {/* Local styles for marquee animation */}
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
        /* Pause animation on hover of the wrapper */
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>
      <div className="w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-normal text-gray-900 mb-6">
            The Heart Behind Dreamaze
          </h1>
          
          <div className="max-w-lg mx-auto space-y-1 text-sm text-gray-600 leading-relaxed">
            <p>When children see themselves in the story,<br/>reading becomes real bonding.</p>
          </div>
        </div>

        {/* Image Gallery - auto-scrolling marquee left-to-right */}
        <div className="overflow-hidden mb-16">
          {/* Wrapper to apply pause-on-hover */}
          <div className="relative">
            {/* Track: duplicated content for seamless loop */}
            <div
              className="flex gap-4 items-center animate-marquee"
              style={{
                animationDuration: '18s', // adjust this to change speed (lower = faster)
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
              }}
            >
              {/** First mapped copy **/}
              <MediaItemsList items={mediaItems} keyPrefix="first" />

              {/** Second mapped copy (duplicate) **/}
              <MediaItemsList items={mediaItems} keyPrefix="second" />
            </div>

            {/* Pause on hover overlay */}
            <div className="absolute inset-0" style={{ pointerEvents: 'none' }} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default TheHeartBehindDreamaze;