'use client';
import { HOME_HERO } from "@/constants/cdn";
import { BOOKS_URL } from "@/constants/links";
import { Link } from "@/i18n/routing";
import { useState, useEffect } from "react";
import Image from "../common/Image";

const slides = [
  // {
  //   id: 1,
  //   title: ["A Storybook Where", "Your Child Is the Hero"],
  //   color: "text-primary",
  //   buttonText: "Create Yours",
  //   image: HOME_HERO("hero_mobile.jpg"),
  //   image_desktop: HOME_HERO("hero.webp"),
  //   description: "Be seen. Be loved. Be celebrated",
  // },
  {
    id: 2,
    title: ["Turn Dad into", "Part of the", "Story"],
    color: "text-primary",
    buttonText: "Create Yours",
    image: HOME_HERO("father-mobile.webp"),
    image_desktop: HOME_HERO("father-pc.webp"),
    description: "The most unique hand-illustrated gift for Father's Day.",
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

        .slide-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          background-color: #f3f4f6;
          transition: transform 0.5s ease-in-out;
        }
      `}</style>

      <div className="slideshow-container max-h-[680px]" style={{ minHeight: '80vh' }}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentIndex ? "active" : ""}`}
          >
            {/* Use <img> instead of CSS background-image for faster LCP paint */}
            {/* Mobile hero */}
            <img
              src={slide.image}
              alt=""
              className="slide-bg-img md:hidden"
              fetchPriority={index === 0 ? "high" : "low"}
              decoding="async"
            />
            {/* Desktop hero */}
            <img
              src={slide.image_desktop}
              alt=""
              className="slide-bg-img hidden md:block"
              fetchPriority={index === 0 ? "high" : "low"}
              decoding="async"
            />

            <div
              className={`absolute inset-0 z-10 max-w-[1200px] mx-auto w-full slide-content flex flex-col justify-end md:justify-center w-full p-[24px] ${slide.color}`}
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
        ))}
      </div>
    </>
  );
}
