import { useState, useEffect } from 'react';
import { FaArrowRight as ArrowRight } from 'react-icons/fa';

interface Slide {
  id: number;
  title: string[];
  buttonText: string;
  image: string;
  alt: string;
  backgroundColor: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: ['Every child deserves', 'to be the hero of', 'their own story.'],
    buttonText: 'view more',
    image: 'https://images.pexels.com/photos/3933245/pexels-photo-3933245.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Mother reading with child',
    backgroundColor: 'from-gray-100 to-gray-200',
  },
  {
    id: 2,
    title: ['Where every child', 'is seen, celebrated,', 'and made the hero'],
    buttonText: 'View more',
    image: 'https://images.pexels.com/photos/4009409/pexels-photo-4009409.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Children reading together',
    backgroundColor: 'from-pink-50 to-pink-100',
  },
  {
    id: 3,
    title: ['Creating magical', 'moments through', 'personalized stories'],
    buttonText: 'Discover more',
    image: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Child enjoying storytime',
    backgroundColor: 'from-blue-50 to-blue-100',
  },
];

export default function SlideShow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];

  return (
    <>
      {/* Desktop Version */}
      <section className="hidden lg:block relative w-full h-screen overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.backgroundColor} transition-colors duration-700`}>
          <div className="absolute inset-0 flex">
            {/* Left Content */}
            <div className="w-1/2 flex flex-col justify-center px-16 xl:px-24">
              <h1 className="text-6xl xl:text-7xl font-bold leading-tight">
                {slide.title.map((line, index) => (
                  <span key={index}>
                    <span className="text-blue-600 inline-block animate-fadeIn">{line}</span>
                    {index < slide.title.length - 1 && <br />}
                  </span>
                ))}
              </h1>
              <button className="mt-12 flex items-center gap-2 text-lg font-medium text-gray-800 hover:gap-4 transition-all duration-300 group">
                {slide.buttonText}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Image */}
            <div className="w-1/2 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  key={slide.id}
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover animate-slideIn"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-gray-600 w-8' : 'bg-gray-400 hover:bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Mobile Version */}
      <section className="lg:hidden relative w-full min-h-screen flex flex-col overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.backgroundColor} transition-colors duration-700`} />

        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-12">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            {slide.title.map((line, index) => (
              <span key={index}>
                <span className="text-blue-600 inline-block animate-fadeIn">{line}</span>
                {index < slide.title.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <button className="mt-8 flex items-center gap-2 text-base font-medium text-gray-800 hover:gap-4 transition-all duration-300 group">
            {slide.buttonText}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Image */}
        <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden">
          <img
            key={slide.id}
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover animate-slideIn"
          />
        </div>

        {/* Mobile Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-gray-600 w-6' : 'bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
