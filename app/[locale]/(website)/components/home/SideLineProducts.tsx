import { useState, useEffect } from 'react';
import { FaArrowRight as ArrowRight } from 'react-icons/fa';

interface Slide {
  id: number;
  image: string;
  quote: string;
  author: string;
  date?: string;
  rating?: number;
  altNames?: string[];
}

const slides: Slide[] = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/6942023/pexels-photo-6942023.jpeg?auto=compress&cs=tinysrgb&w=600',
    quote: 'Already, our first families have stepped into Dreamaze stories—watching their children light up as they see themselves as the hero.',
    author: "Mirabelle's father",
    date: '09/04/2024',
  }
];

export default function SideLineProducts() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="w-full bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-16 lg:mb-20 text-gray-900 px-4">
          Our First Groups of Leading Stars
        </h1>

        {/* Mobile Layout */}
        <div className="max-w-md mx-auto">
          <div className="bg-[#F8F8F8] rounded-sm p-8 pb-12">
            {/* Image Section */}
            <div className="relative bg-white rounded-xl p-6 mb-10 flex items-center justify-center">
              <img
                src={currentSlideData.image}
                alt="Testimonial"
                className="w-48 h-auto object-contain transition-opacity duration-500"
              />
            </div>

            {/* Quote */}
            <div className="mb-8 relative">
              <span className="absolute -top-2 -left-1 text-6xl text-[#222] font-serif">“</span>
              <p className="text-base text-gray-900 leading-relaxed pl-6">
                {currentSlideData.quote}
              </p>
            </div>

            {/* Author Info */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-gray-900">
                  {currentSlideData.author}
                </p>
                {currentSlideData.date && (
                  <p className="text-gray-500 text-sm">{currentSlideData.date}</p>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <button className="w-full text-[#222] font-medium py-3.5 px-6 rounded-full transition-all duration-200 flex items-center justify-center gap-2">
              Buy the same
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Dots */}
          {/* <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-blue-600'
                    : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div> */}
        </div>

      </div>
    </div>
  );
}
