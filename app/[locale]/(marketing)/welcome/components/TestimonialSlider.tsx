import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft as ChevronLeft, FaChevronRight as ChevronRight} from 'react-icons/fa';

interface Testimonial {
  id: number;
  image: string;
  quote: string;
  author: string;
  title?: string;
}

interface TestimonialSliderProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  showDots?: boolean;
}

const TestimonialSlider: React.FC<TestimonialSliderProps> = ({
  autoPlay = true,
  autoPlayInterval = 4000,
  showNavigation = true,
  showDots = true,
}) => {
  // Built-in testimonials data
  const testimonials: Testimonial[] = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800',
      quote: 'It really looks like him, we love it so much.',
      author: "Ethan's Dad",
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/8613297/pexels-photo-8613297.jpeg?auto=compress&cs=tinysrgb&w=800',
      quote: 'My daughter was so excited to see herself as the main character!',
      author: "Sarah's Mom",
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/8613284/pexels-photo-8613284.jpeg?auto=compress&cs=tinysrgb&w=800',
      quote: 'The quality is amazing and the story is so engaging.',
      author: "Michael's Parents",
    },
    {
      id: 4,
      image: 'https://images.pexels.com/photos/8613086/pexels-photo-8613086.jpeg?auto=compress&cs=tinysrgb&w=800',
      quote: 'Best gift we ever bought for our kids. They read it every night!',
      author: "The Johnson Family",
    },
    {
      id: 5,
      image: 'https://images.pexels.com/photos/8613295/pexels-photo-8613295.jpeg?auto=compress&cs=tinysrgb&w=800',
      quote: 'The personalization is incredible. Our son feels like a real hero!',
      author: "Emma's Parents",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Create slides array with positions and styles
  const getSlides = () => {
    if (testimonials.length <= 1) {
      return [{ testimonial: testimonials[0], position: 'current', index: 0 }];
    }

    const slides = [];
    const prevIndex = (currentSlide - 1 + testimonials.length) % testimonials.length;
    const nextIndex = (currentSlide + 1) % testimonials.length;

    // Previous slide (left)
    slides.push({
      testimonial: testimonials[prevIndex],
      position: 'previous',
      index: prevIndex,
    });

    // Current slide (center)
    slides.push({
      testimonial: testimonials[currentSlide],
      position: 'current',
      index: currentSlide,
    });

    // Next slide (right)
    slides.push({
      testimonial: testimonials[nextIndex],
      position: 'next',
      index: nextIndex,
    });

    return slides;
  };

  // Get position styles for each slide
  const getSlideStyles = (position: string) => {
    const baseStyles = "absolute top-0 w-full h-full flex items-center justify-center transition-all duration-300";
    
    switch (position) {
      case 'previous':
        return `${baseStyles} left-0 transform -translate-x-1/3 scale-75 opacity-30 blur-sm z-10 pointer-events-none`;
      case 'current':
        return `${baseStyles} inset-0 z-20`;
      case 'next':
        return `${baseStyles} right-0 transform translate-x-1/3 scale-75 opacity-30 blur-sm z-10 pointer-events-none`;
      default:
        return baseStyles;
    }
  };

  // Render individual slide content
  const renderSlideContent = (testimonial: Testimonial, position: string) => {
    const isCurrentSlide = position === 'current';
    const imageSize = isCurrentSlide ? 'w-80 h-80 md:w-96 md:h-96' : 'w-64 h-64';
    const textSize = isCurrentSlide ? 'text-xl md:text-2xl lg:text-3xl' : 'text-lg';
    const authorSize = isCurrentSlide ? 'text-lg md:text-xl' : 'text-base';
    const containerPadding = isCurrentSlide ? 'px-8 py-12 md:px-16 md:py-16' : 'px-4';
    const maxWidth = isCurrentSlide ? 'max-w-2xl' : 'max-w-sm';

    return (
      <div className={`w-full ${maxWidth}`}>
        <div className={containerPadding}>
          {/* Image */}
          <div className="flex justify-center mb-4 md:mb-8">
            <div className="relative">
              <img
                src={testimonial.image}
                alt={`Testimonial from ${testimonial.author}`}
                className={`${imageSize} object-cover rounded-2xl shadow-xl transition-all duration-300`}
              />
              {isCurrentSlide && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
              )}
            </div>
          </div>

          {/* Quote and Author */}
          <div className="text-center">
            <blockquote className={`${textSize} font-light text-gray-800 mb-3 md:mb-6 leading-relaxed`}>
              "{testimonial.quote}"
            </blockquote>
            
            <div className="flex flex-col items-center">
              <cite className={`${authorSize} font-semibold text-gray-900 not-italic`}>
                {testimonial.author}
              </cite>
              {testimonial.title && (
                <span className="text-sm md:text-base text-gray-600 mt-1">
                  {testimonial.title}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentSlide, autoPlay, autoPlayInterval]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (touchStartX.current === 0) return;
    touchEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (!testimonials.length) return null;

  const slides = getSlides();

  return (
    <div className="relative w-full max-w-4xl py-18 mx-auto bg-white">
      {/* Header */}
      <div className="text-center mb-12 px-6">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Loved By Parents & Kids
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Real stories from family who already received their DreamazeBook
        </p>
      </div>

      {/* Slider Container */}
      <div 
        ref={sliderRef}
        className="relative overflow-visible rounded-2xl h-[600px] md:h-[700px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: 'grab' }}
      >
        {/* Render all slides using variable array */}
        {slides.map((slide, index) => (
          <div
            key={`${slide.index}-${slide.position}`}
            className={getSlideStyles(slide.position)}
          >
            {renderSlideContent(slide.testimonial, slide.position)}
          </div>
        ))}

        {/* Navigation Arrows */}
        {showNavigation && testimonials.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-30"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-30"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {showDots && testimonials.length > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-gray-800 scale-110'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* CTA Button */}
      <div className="text-center mt-12">
        <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg px-12 py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl">
          Unlock 40% Off Early
        </button>
      </div>
    </div>
  );
};

export default TestimonialSlider;