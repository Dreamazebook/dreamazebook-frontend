import React, { useState, useEffect } from 'react';
import { FaArrowRight as ArrowRight, FaChevronLeft as ChevronLeft, FaChevronRight as ChevronRight } from 'react-icons/fa';

interface Slide {
  id: number;
  title: string[];
  subtitle?: string;
  backgroundImage: string;
  bookCard: {
    title: string;
    subtitle: string;
    color: string;
  };
}

const slides: Slide[] = [
  {
    id: 1,
    title: ['Every child deserves', 'to be the hero of', 'their own story.'],
    backgroundImage: 'https://images.pexels.com/photos/4474031/pexels-photo-4474031.jpeg?auto=compress&cs=tinysrgb&w=1600',
    bookCard: {
      title: 'Adventure Tales',
      subtitle: 'For young heroes',
      color: 'from-pink-200 to-pink-300'
    }
  },
  {
    id: 2,
    title: ['Spark imagination', 'with magical stories', 'that inspire wonder.'],
    backgroundImage: 'https://images.pexels.com/photos/4473775/pexels-photo-4473775.jpeg?auto=compress&cs=tinysrgb&w=1600',
    bookCard: {
      title: 'Magic Kingdom',
      subtitle: 'Fantasy adventures',
      color: 'from-purple-200 to-purple-300'
    }
  },
  {
    id: 3,
    title: ['Build confidence', 'through stories of', 'courage and friendship.'],
    backgroundImage: 'https://images.pexels.com/photos/4473494/pexels-photo-4473494.jpeg?auto=compress&cs=tinysrgb&w=1600',
    bookCard: {
      title: 'Brave Hearts',
      subtitle: 'Stories of courage',
      color: 'from-green-200 to-green-300'
    }
  },
  {
    id: 4,
    title: ['Discover new worlds', 'where learning becomes', 'an exciting journey.'],
    backgroundImage: 'https://images.pexels.com/photos/4473622/pexels-photo-4473622.jpeg?auto=compress&cs=tinysrgb&w=1600',
    bookCard: {
      title: 'Learning Quest',
      subtitle: 'Educational fun',
      color: 'from-blue-200 to-blue-300'
    }
  }
];

const SlideShow: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="min-h-[80vh] relative overflow-hidden">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(253, 242, 248, 0.85), rgba(253, 242, 248, 0.85)), url('${slide.backgroundImage}')`
          }}
        />
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      <div className="container mx-auto px-6 py-16 lg:py-24 relative z-10">
        <div className="flex items-center min-h-[60vh]">
          {/* Left Content */}
          <div className="space-y-8 max-w-2xl">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-600 leading-tight">
                {currentSlideData.title.map((line, index) => (
                  <React.Fragment key={index}>
                    {index === 0 && line}
                    {index === 1 && (
                      <>
                        <br />
                        <span className="text-blue-700">{line}</span>
                      </>
                    )}
                    {index === 2 && (
                      <>
                        <br />
                        <span className="text-blue-800">{line}</span>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </h1>
              {currentSlideData.subtitle && (
                <p className="text-lg text-gray-600 max-w-lg">
                  {currentSlideData.subtitle}
                </p>
              )}
            </div>

            <button className="group inline-flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-all duration-300 text-lg font-medium">
              <span>view more</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Book Card */}
      <div className="absolute bottom-16 right-8 lg:right-16 bg-white rounded-xl shadow-xl p-4 transform rotate-3 hover:rotate-0 transition-all duration-500 z-10">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-16 bg-gradient-to-br ${currentSlideData.bookCard.color} rounded-md flex items-center justify-center transition-all duration-500`}>
            <span className="text-gray-700 font-bold text-xs">BOOK</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm transition-all duration-300">
              {currentSlideData.bookCard.title}
            </h3>
            <p className="text-gray-500 text-xs transition-all duration-300">
              {currentSlideData.bookCard.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-blue-600 scale-125'
                  : 'bg-white/60 hover:bg-white/80 hover:scale-110'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Slide Counter */}
      <div className="absolute top-8 right-8 bg-white/80 rounded-full px-4 py-2 text-sm font-medium text-gray-700 z-20">
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-20 h-20 bg-yellow-200/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-32 left-10 w-16 h-16 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-pink-200/20 rounded-full blur-lg animate-pulse delay-500"></div>
    </section>
  );
};

export default SlideShow;