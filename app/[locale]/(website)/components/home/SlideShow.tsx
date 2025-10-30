import { useState, useEffect } from 'react';
import { FaArrowRight as ArrowRight } from 'react-icons/fa';

interface Slide {
  id: number;
  title: string[];
  buttonText: string;
  image: string;
  alt: string;
}

const slides: Slide[] = [
  {
    id: 2,
    title: ['Where every child', 'is seen, celebrated,', 'and made the hero'],
    buttonText: 'View more',
    image: '/home-page/slideshows/slide1.png',
    alt: 'Children reading together',
  },
  {
    id: 1,
    title: ['Every child deserves', 'to be the hero of', 'their own story.'],
    buttonText: 'view more',
    image: '/home-page/slideshows/slide2.png',
    alt: 'Mother reading with child',
  },
  {
    id: 3,
    title: ['Creating magical', 'moments through', 'personalized stories'],
    buttonText: 'Discover more',
    image: '/home-page/slideshows/slide3.png',
    alt: 'Child enjoying storytime',
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
        {/* Background image layer */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.image})` }}
        />

        {/* Content (above background and tint) */}
        <div className="absolute inset-0 flex z-10 w-full">
          {/* Left Content */}
          <div className="flex flex-col justify-center px-16 xl:px-24">
            <h1 className="text-6xl xl:text-7xl font-bold leading-tight">
              {slide.title.map((line, index) => (
                <span key={index}>
                  <span className="text-blue-600 inline-block">{line}</span>
                  {index < slide.title.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <button className="mt-12 flex items-center gap-2 text-lg font-medium text-gray-800 hover:gap-4 transition-all duration-300 group">
              {slide.buttonText}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
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
        {/* Background image layer */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.image})` }}
        />

        <div className="relative z-10 flex-1 flex flex-col justify-start px-6 py-12 animate-fadeIn bg-gradient-to-b from-purple-100 to-transparent">
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

        {/* Hidden img for accessibility */}
        <img src={slide.image} alt={slide.alt} className="sr-only" />

        {/* Mobile Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
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
