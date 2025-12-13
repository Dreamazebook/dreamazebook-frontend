import { HOME_DIFFERENT } from "@/constants/cdn";
import Image from "next/image";

function WhatMakesDreamazeDifferent() {
  const features = [
    {
      icon: HOME_DIFFERENT('icon_2.webp'),
      title: "Truly Looks Like Your Child",
      description: "real-photo personalization so little ones insanely recognize themselves"
    },
    {
      icon: HOME_DIFFERENT('icon_1.webp'),
      title: "Hand-Drawn, Award-Level Art",
      description: "Warm, premium illustrations crafted to be cherished for years."
    },
    {
      icon:HOME_DIFFERENT('icon_3.webp'),
      title: "Built For Connection & Bonding",
      description: "Stories that spark closeness, conversation, and imagination."
    },
    {
      icon:HOME_DIFFERENT('icon_4.webp'),
      title: "Confidence-Growing Personal Stories",
      description: "Seeing themselves as the hero nurtures recognition and self-esteem."
    }
  ];

  return (
    <div className="bg-white py-[64px] px-[24px] md:py-[88px]">
      <div className="max-w-4xl mx-auto space-y-[24px] md:space-y-[48px]">
        <h1 className="text-[24px] md:text-[40px] font-medium text-center leading-tight text-gray-900">
          What Makes Dreamaze Different
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          {features.map((feature, index) => {
            return (
              <div key={index} className="flex md:flex-col items-center gap-3 md:text-center md:bg-[#F8F8F8] p-1 md:p-8 rounded">
                <Image src={feature.icon} alt={feature.title} width={48} height={48} className="w-15 h-15 md:w-24 md:h-24 bg-gray-50 rounded md:mb-6" />
                <div>
                  <h3 className="text-[16px] md:text-[18px] font-medium text-[#222222] md:mb-3">{feature.title}</h3>
                  <p className="text-[#666666] text-[16px] leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <div className="w-px h-18 bg-[#CCCCCC]"></div>
        </div>

        <div className="flex justify-center">
          <img src={HOME_DIFFERENT('divider.webp')} alt="divider" className="w-[185px] md:w-[329px]" />
        </div>
      </div>
    </div>
  );
}

export default WhatMakesDreamazeDifferent;
