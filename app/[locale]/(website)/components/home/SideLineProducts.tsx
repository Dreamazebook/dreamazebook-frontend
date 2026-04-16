import { ArrowRight, ChevronLeft, ChevronRight } from '@/utils/icons';
import React from "react";

const navigationDots = [
  { active: false },
  { active: true },
  { active: false },
  { active: false },
];

const testimonialData = {
  image: "/image.svg",
  quote:
    "Already, our first families have stepped into Dreamaze stories—watching their children light up as they see themselves as the hero.",
  author: "Mirabelle's father",
  date: "09/04/2024",
};

export default function SideLineProducts() {
  return (
    <div className="flex flex-col w-full max-w-[375px] lg:max-w-6xl items-center gap-6 lg:gap-12 px-3 lg:px-8 py-16 lg:py-24 bg-white mx-auto">
      <h1 className="w-full lg:w-auto font-roboto font-semibold text-black text-2xl lg:text-4xl text-center leading-8 lg:leading-12">
        Our Fisrt Groups of Leading Stars
      </h1>

      <div className="inline-flex flex-col lg:flex-row items-center gap-6 lg:gap-12 flex-[0_0_auto]">
        <nav
          className="hidden lg:inline-flex flex-col items-start justify-center gap-6 flex-[0_0_auto]"
          aria-label="Carousel navigation"
        >
          {navigationDots.map((dot, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded cursor-pointer transition-opacity hover:opacity-80 ${
                dot.active ? "bg-[#012cce]" : "bg-neutral-200"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={dot.active ? "true" : "false"}
            />
          ))}
        </nav>

        <div className="inline-flex lg:flex-row flex-col items-center justify-center gap-3 flex-[0_0_auto]">
          <div className="w-[280px] lg:w-[400px] bg-[#f8f8f8] rounded-lg border-0 shadow-none flex flex-col items-center gap-9 pt-9 pb-6 px-3 lg:px-6 lg:gap-12">
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex flex-col items-center w-full">
                <figure className="flex flex-col w-[132px] lg:w-[180px] h-[120px] lg:h-[160px] items-center justify-center gap-[10.91px] m-0">
                  <img
                    className="w-[64.55px] lg:w-[90px] h-[82.73px] lg:h-[110px] object-cover"
                    alt="Dreamaze story book"
                    src="/image.svg"
                  />

                  <div className="relative w-[53.18px] lg:w-[70px] h-[7.27px] lg:h-[10px]">
                    <div className="absolute top-px -left-3.5 w-[78px] h-1.5 bg-black/[0.04] rounded-[38.86px/2.95px] blur-[2.27px]" />
                    <div className="absolute top-[3px] left-3 w-7 h-[3px] bg-black/[0.02] rounded-[14.09px/1.36px] blur-[1.59px]" />
                  </div>
                </figure>

                <blockquote className="flex flex-col items-center w-full">
                  <p className="w-full mt-[-1.00px] font-roboto font-normal text-[#222222] text-4xl lg:text-5xl leading-9 lg:leading-12">
                    <span className="tracking-[0] leading-[44px] lg:leading-[60px]">
                      &quot;
                    </span>
                    <span className="font-medium text-sm lg:text-base tracking-[0.04px] leading-5 lg:leading-7">
                      {testimonialData.quote}
                    </span>
                  </p>
                </blockquote>
              </div>

              <div className="inline-flex items-center gap-3 px-2 py-1 flex-[0_0_auto] rounded-[36px]">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#d9d9d9] rounded-2xl flex-[0_0_auto]" />

                <div className="inline-flex flex-col items-start justify-center flex-[0_0_auto]">
                  <div className="w-fit mt-[-1.00px] font-roboto font-medium text-[#222222] text-sm lg:text-base tracking-[0.25px] leading-5 whitespace-nowrap">
                    {testimonialData.author}
                  </div>

                  <time className="w-fit font-medium text-[#666666] text-xs lg:text-sm tracking-[0.4px] leading-4 lg:leading-5 whitespace-nowrap">
                    {testimonialData.date}
                  </time>
                </div>
              </div>
            </div>

            <button className="inline-flex items-center justify-center gap-2.5 flex-[0_0_auto] rounded-lg h-auto p-0 bg-transparent hover:bg-transparent border-none cursor-pointer">
              <span className="w-fit mt-[-1.00px] font-medium text-[#222222] text-base lg:text-lg tracking-[0.5px] leading-6 whitespace-nowrap">
                Buy the same
              </span>

              <ArrowRight className="w-[17.5px] lg:w-5 h-[17.5px] lg:h-5 -mr-0.75" />
            </button>
          </div>

          <div className="w-[280px] lg:w-[400px] h-4 rounded bg-gradient-to-b from-[#f8f8f8] to-[#f8f8f800]" />
        </div>

        <nav
          className="inline-flex lg:hidden flex-row items-center justify-center gap-4 flex-[0_0_auto]"
          aria-label="Carousel navigation"
        >
          {navigationDots.map((dot, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded cursor-pointer transition-opacity hover:opacity-80 ${
                dot.active ? "bg-[#012cce]" : "bg-neutral-200"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={dot.active ? "true" : "false"}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};
