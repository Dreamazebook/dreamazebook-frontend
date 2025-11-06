import { HOME_IMAGE } from '@/constants/cdn';
import { useState, useEffect, useCallback } from 'react';
import { FaArrowRight as ArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const slides = [
  {
    id: 1,
    title: ['Where every child', 'is seen, celebrated,', 'and made the hero'],
    color: 'text-white',
    buttonText: 'View more',
    image: HOME_IMAGE('slide1.png'),
    image_desktop: HOME_IMAGE('slide1_desktop.png'),
    alt: 'Children reading together',
  },
  {
    id: 2,
    title: ['Every child deserves', 'to be the hero of', 'their own story.'],
    color: 'text-primary',
    buttonText: 'view more',
    image: HOME_IMAGE('slide2.png'),
    image_desktop: HOME_IMAGE('slide2_desktop.png'),
    alt: 'Mother reading with child',
  },
  // {
  //   id: 3,
  //   title: ['Creating magical', 'moments through', 'personalized stories'],
  //   buttonText: 'Discover more',
  //   image: HOME_IMAGE('slide3.png'),
  //   alt: 'Child enjoying storytime',
  // },
];

export default function SlideShow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <style jsx global>{`
        .slideshow-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.5s ease-in-out;
        }

        .slide.active {
          opacity: 1;
          transform: scale(1);
        }

        .slide-content {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s ease-in-out 0.3s;
        }

        .slide.active .slide-content {
          opacity: 1;
          transform: translateY(0);
        }

        .slide-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 0.5s ease-in-out;
        }

        @media (min-width: 768px) {
          .slide-bg {
            background-image: var(--desktop-bg) !important;
          }
        }
      `}</style>

      <div className="slideshow-container">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`slide ${index === currentIndex ? 'active' : ''}`}>
            <div 
              className="slide-bg"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                '--desktop-bg': `url(${slide.image_desktop})`
              } as React.CSSProperties}
            />
            
            <div className="absolute inset-0 flex z-10 w-full">
              <div className="slide-content flex flex-col justify-start md:justify-center p-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  {slide.title.map((line, i) => (
                    <span key={i}>
                      <span className={`${slide.color} inline-block`}>{line}</span>
                      {i < slide.title.length - 1 && <br />}
                    </span>
                  ))}
                </h1>
                <button className="mt-8 lg:mt-12 flex items-center gap-2 text-base lg:text-lg font-medium text-gray-800 hover:gap-4 transition-all duration-300 group">
                  {slide.buttonText}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 lg:gap-3 z-20">
          <span className="text-sm font-medium text-white bg-gray-800/70 px-2 lg:px-3 py-1 rounded-full">
            {currentIndex + 1} / {slides.length}
          </span>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full transition-all duration-300 ${
                currentIndex === index 
                  ? 'bg-white w-6 lg:w-8 h-2 lg:h-2.5' 
                  : 'bg-white/60 w-2 lg:w-2.5 h-2 lg:h-2.5 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>



      </div>
    </>
  );
};
