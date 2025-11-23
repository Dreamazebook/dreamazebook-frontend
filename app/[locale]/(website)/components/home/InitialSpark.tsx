import { HOME_SPARKS } from '@/constants/cdn';
import React from 'react';

function InitialSpark() {
  const images = [
    {
      src: HOME_SPARKS('1.png'),
      alt: 'Child reading books',
      showStar: false,
    },
    {
      src: HOME_SPARKS('2.png'),
      alt: 'Young person reading magazine',
      showStar: true,
    },
    {
      src: HOME_SPARKS('3.png'),
      alt: 'Person reading with coffee',
      showStar: false,
    },
    {
      src: HOME_SPARKS('4.png'),
      alt: 'Child reading with parent',
      showStar: true,
    },
    {
      src: HOME_SPARKS('5.png'),
      alt: 'Child reading book outdoors',
      showStar: false,
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
            <p>When children see themselves in the story, reading becomes real bonding.</p>
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
              <div className="flex gap-4">
                {images.map((img, idx) => (
                  <div key={`first-${idx}`} className="w-96 flex-shrink-0 overflow-hidden rounded-lg relative">
                    <img src={img.src} alt={img.alt} className="w-full h-60 object-cover" />
                  </div>
                ))}
              </div>

              {/** Second mapped copy (duplicate) **/}
              <div className="flex gap-4">
                {images.map((img, idx) => (
                  <div key={`second-${idx}`} className="w-96 flex-shrink-0 overflow-hidden rounded-lg relative">
                    <img src={img.src} alt={img.alt} className="w-full h-60 object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Pause on hover overlay */}
            <div className="absolute inset-0" style={{ pointerEvents: 'none' }} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default InitialSpark;