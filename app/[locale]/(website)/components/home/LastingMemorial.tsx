import React, { StrictMode } from "react";
import Image from "../common/Image";
const steps = [
  {
    number: "01",
    icon: "/home-page/lasting-memorial/01.svg",
    title: "Personalize It",
    description:
      "Add their name & photo to make the story truly theirs.",
  },
  {
    number: "02",
    icon: "/home-page/lasting-memorial/02.svg",
    title: "Place the Order & Preview",
    description:
      "In 48 hours, a handcrafted preview arrives before printing — thoughtfully checked with care.",
  },
  {
    number: "03",
    icon: "/home-page/lasting-memorial/03.svg",
    title: "Receive & Enjoy",
    description:
      "Unwrap together and watch their face light up.",
  },
];

export default function LastingMemorial() {
  const m3Styles = {
    titleMedium: {
      fontFamily: "Roboto, Helvetica",
      fontSize: "16px",
      fontWeight: 500,
      letterSpacing: "0.15000000596046448px",
      lineHeight: "24px",
    },
    bodyMedium: {
      fontFamily: "Roboto, Helvetica",
      fontSize: "14px",
      fontWeight: 400,
      letterSpacing: "0.25px",
      lineHeight: "20px",
    },
  };

  return (
    <section className="px-[24px] py-[64px] md:py-[88px]">
      <h2 className="pb-6 flex-1 font-semibold text-[#222222] text-2xl md:text-4xl text-center tracking-[0] leading-8" style={{ fontFamily: "Roboto, Helvetica" }}>
        Easy 3 Steps to Create a Lasting Memory
      </h2>

      <div className=" w-full max-w-[375px] md:max-w-[1000px] grid grid-cols-1 md:grid-cols-3 gap-12 items-start gap-12 pt-9 mx-auto">
        {steps.map((step, index) => (
          <article
            key={index}
            className="flex md:flex-col items-start gap-6 pl-6 pr-0 w-full border-l border-solid border-[#22222233]"
          >
            <Image
              className="w-12 h-11 flex-shrink-0"
              alt={`Step ${step.number} icon`}
              src={step.icon}
            />

            <div className="flex flex-col items-start gap-1 pr-3 flex-1">
              <h2 className="w-fit text-[#222222] whitespace-nowrap" style={m3Styles.titleMedium}>
                {step.title}
              </h2>

              <p className="text-[#666666]" style={m3Styles.bodyMedium}>
                {step.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};