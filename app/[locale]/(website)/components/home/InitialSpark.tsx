import React from 'react';

function InitialSpark() {
  const images = [
    {
      src: 'https://images.pexels.com/photos/1094072/pexels-photo-1094072.jpeg',
      alt: 'Child reading books',
      showStar: false,
    },
    {
      src: 'https://images.pexels.com/photos/1250722/pexels-photo-1250722.jpeg',
      alt: 'Young person reading magazine',
      showStar: true,
    },
    {
      src: 'https://images.pexels.com/photos/1370296/pexels-photo-1370296.jpeg',
      alt: 'Person reading with coffee',
      showStar: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white py-12">
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
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-lg font-normal text-gray-900 mb-6">
            Dreamaze's Initial Spark
          </h1>
          
          <div className="max-w-lg mx-auto space-y-1 text-sm text-gray-600 leading-relaxed">
            <p>Children discover kindness, courage, and wonder in stories...</p>
            <p>But what if they were the ones living it?</p>
            <p>That's where <span className="text-white bg-blue-600 px-1.5 py-0.5 rounded font-medium">Dreamaze</span> begins</p>
            <p className="font-medium text-gray-800">We make your child the shining star of their own story.</p>
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
                  <div key={`first-${idx}`} className="w-64 flex-shrink-0 overflow-hidden rounded-lg relative">
                    <img src={img.src} alt={img.alt} className="w-full h-40 object-cover" />
                    {img.showStar && (
                      <div className="absolute top-2 right-2">
                        <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M30 0L37.45 18.55L60 30L37.45 41.45L30 60L22.55 41.45L0 30L22.55 18.55L30 0Z" stroke="#E5E7EB" strokeWidth="1.5" fill="white" fillOpacity="0.95" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/** Second mapped copy (duplicate) **/}
              <div className="flex gap-4">
                {images.map((img, idx) => (
                  <div key={`second-${idx}`} className="w-64 flex-shrink-0 overflow-hidden rounded-lg relative">
                    <img src={img.src} alt={img.alt} className="w-full h-40 object-cover" />
                    {img.showStar && (
                      <div className="absolute top-2 right-2">
                        <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M30 0L37.45 18.55L60 30L37.45 41.45L30 60L22.55 41.45L0 30L22.55 18.55L30 0Z" stroke="#E5E7EB" strokeWidth="1.5" fill="white" fillOpacity="0.95" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pause on hover overlay */}
            <div className="absolute inset-0" style={{ pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Main Headline Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            <span className="text-blue-600">Dreamaze:</span>
            <br />
            <span className="text-gray-900">
              See Yourself In Amazing Dreams
            </span>
          </h2>
          
          <div className="max-w-md mx-auto space-y-1 text-sm text-gray-600">
            <p>A whole collection to celebrate your child's milestones.</p>
            <p>Heartfelt editions for grown-ups.</p>
            <p className="text-blue-600 font-medium">More language options</p>
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="text-center">
          <div className="w-px h-12 bg-gray-300 mx-auto mb-3" />
          <div className="w-2 h-2 border border-gray-400 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}

export default InitialSpark;