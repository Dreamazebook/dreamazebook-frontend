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
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=600',
    quote: 'My mom said it was the best gift she had ever received! She never thought she could appear in a book, it\'s amazing. She said she would always treasure it, which made me also very happy .',
    author: 'Where Are You!',
    rating: 5,
    altNames: ['DDDD', 'LILI'],
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg?auto=compress&cs=tinysrgb&w=600',
    quote: 'The personalized storybook brought tears to my eyes. Seeing my daughter as the main character in her own adventure was absolutely magical.',
    author: "Emma's mom",
    date: '09/15/2024',
  },
];

export default function SideLineProducts() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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
    <div className="w-full min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-16 lg:mb-20 text-gray-900 px-4">
          Our First Groups of Leading Stars
        </h1>

        {/* Mobile Layout */}
        <div className="lg:hidden max-w-md mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8 pb-12">
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
              <span className="absolute -top-2 -left-1 text-6xl text-gray-300 font-serif">"</span>
              <p className="text-base text-gray-900 leading-relaxed pl-6">
                {currentSlideData.quote}
              </p>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3 mb-8">
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
          <div className="flex justify-center gap-2 mt-8">
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
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="relative bg-gray-50 rounded-3xl">
            <div className="grid grid-cols-[1fr_auto] gap-16 p-16">
              {/* Left Column - Content */}
              <div className="flex flex-col justify-center max-w-2xl">
                {/* Quote */}
                <div className="mb-12 relative">
                  <span className="absolute -top-4 -left-2 text-7xl text-gray-300 font-serif">"</span>
                  <p className="text-xl text-gray-900 leading-relaxed pl-8">
                    {currentSlideData.quote}
                  </p>
                </div>

                {/* Rating */}
                {currentSlideData.rating && (
                  <div className="flex gap-2 mb-12">
                    {[...Array(currentSlideData.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-7 h-7 text-yellow-400 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                <button className="text-[#222] font-medium py-3.5 px-8 rounded-full transition-all duration-200 flex items-center gap-2 w-fit text-lg">
                  Buy the same
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Right Column - Image & Author */}
              <div className="flex flex-col items-center justify-center gap-10 min-w-[400px]">
                {/* Alternative Names */}
                {currentSlideData.altNames && (
                  <div className="flex gap-12 self-start pl-8">
                    {currentSlideData.altNames.map((name, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gray-300 rounded-full"></div>
                        <span className="text-gray-600 font-medium">{name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Main Image */}
                <div className="relative bg-white rounded-2xl p-8">
                  <img
                    src={currentSlideData.image}
                    alt="Testimonial"
                    className="w-72 h-auto object-contain transition-opacity duration-500"
                  />
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {currentSlideData.author}
                    </p>
                    {currentSlideData.date && (
                      <p className="text-gray-500 text-sm">{currentSlideData.date}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2.5 mt-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-10 bg-blue-600'
                    : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
