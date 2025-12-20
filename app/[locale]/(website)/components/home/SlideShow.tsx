import { HOME_HERO } from "@/constants/cdn";
import { BOOKS_URL } from "@/constants/links";
import { Link } from "@/i18n/routing";
import { useState, useEffect } from "react";
import Image from "../common/Image";

const slides = [
  {
    id: 1,
    title: ["A Storybook Where", "Your Child Is the Hero"],
    color: "text-primary",
    buttonText: "Create Yours",
    image: HOME_HERO("hero_mobile.png"),
    image_desktop: HOME_HERO("hero.webp"),
    description: "Be seen. Be loved. Be celebrated",
  },
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
          height: 80vh;
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

      <div className="slideshow-container max-h-[680px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentIndex ? "active" : ""}`}
          >
            <div
              className="slide-bg"
              style={
                {
                  backgroundImage: `url(${slide.image})`,
                  "--desktop-bg": `url(${slide.image_desktop})`,
                } as React.CSSProperties
              }
            />

            <div className="absolute inset-0 flex z-10 max-w-[1200px] mx-auto w-full">
              <div
                className={`slide-content flex flex-col justify-end md:justify-center w-full p-[24px] ${slide.color}`}
              >
                <h1 className="text-[36px] md:text-[64px] font-semibold md:font-bold leading-[44px] md:leading-[88px]">
                  {slide.title.map((line, i) => (
                    <span key={i}>
                      <span className={`inline-block`}>{line}</span>
                      {i < slide.title.length - 1 && <br />}
                    </span>
                  ))}
                </h1>
                <p className="text-[16px] text-[#333333] mt-[12px]">
                  {slide.description}
                </p>
                <Link
                  href={BOOKS_URL}
                  className={`mt-5 md:mt-30 w-full md:w-[160px] inline-flex justify-center md:justify-between items-center bg-[#222222] gap-2 text-[16px] text-white px-4   py-3 rounded hover:gap-4 transition-all duration-300 group`}
                >
                  {slide.buttonText}
                  <Image
                    src="/images/common/arrow-white.svg"
                    alt="Arrow"
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Indicators */}
        {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 lg:gap-3 z-20">
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
        </div> */}
      </div>
    </>
  );
}
