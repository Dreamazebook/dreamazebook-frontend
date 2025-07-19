import React, { useState, useEffect } from 'react';

const Slideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      id: 1,
      title: "Every child deserves to be the hero of their own story.",
      backgroundImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+CjxjaXJjbGUgY3g9IjkwMCIgY3k9IjMwMCIgcj0iMjAwIiBmaWxsPSIjZTVlN2ViIiBvcGFjaXR5PSIwLjMiLz4KPGNpcmNsZSBjeD0iMzAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNkMWQ1ZGIiIG9wYWNpdHk9IjAuMiIvPgo8L3N2Zz4K"
    },
    {
      id: 2,
      title: "Every adventure begins with a single page.",
      backgroundImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjBmOWZmIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjQwMCIgcj0iMTUwIiBmaWxsPSIjZGJlYWZlIiBvcGFjaXR5PSIwLjQiLz4KPGNpcmNsZSBjeD0iMTAwMCIgY3k9IjE1MCIgcj0iMTIwIiBmaWxsPSIjYzNkZGZkIiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+Cg=="
    },
    {
      id: 3,
      title: "Reading opens doors to infinite possibilities.",
      backgroundImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZmVmN2VkIi8+CjxjaXJjbGUgY3g9IjgwMCIgY3k9IjIwMCIgcj0iMTgwIiBmaWxsPSIjZmVkN2FhIiBvcGFjaXR5PSIwLjMiLz4KPGNpcmNsZSBjeD0iNDAwIiBjeT0iNDUwIiByPSIxMDAiIGZpbGw9IiNmYmM2YTQiIG9wYWNpdHk9IjAuMiIvPgo8L3N2Zz4K"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index:number) => {
    setCurrentSlide(index);
  };

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Slide Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${slide.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#f8f9fa'
            }}
          >
            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full max-w-7xl mx-auto px-8 md:px-16">
                <div className="max-w-2xl">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-blue-600 leading-tight mb-8">
                    {slide.title}
                  </h1>
                  <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors cursor-pointer group">
                    <span className="text-lg font-medium mr-2">view more</span>
                    <div className="w-6 h-6 transition-transform group-hover:translate-x-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 z-10"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-700">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 z-10"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-700">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide 
                ? 'bg-blue-600 scale-125' 
                : 'bg-gray-400 hover:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slideshow;