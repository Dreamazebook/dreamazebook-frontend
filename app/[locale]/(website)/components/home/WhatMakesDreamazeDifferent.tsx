import { HOME_DIFFERENT } from "@/constants/cdn";
import Image from "next/image";

function WhatMakesDreamazeDifferent() {
  const features = [
    {
      icon: HOME_DIFFERENT('icon_1.webp'),
      title: "Truly Looks Like Your Child",
      description: "real-photo personalization so little ones insanely recognize themselves"
    },
    {
      icon: HOME_DIFFERENT('icon_2.webp'),
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
    <div className="min-h-screen bg-white px-6 py-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl lg:text-6xl font-bold text-center mb-20 leading-tight text-gray-900">
          What Makes Dreamaze Different
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          {features.map((feature, index) => {
            return (
              <div key={index} className="flex flex-col items-center text-center bg-[#F8F8F8] p-8 rounded">
                <Image src={feature.icon} alt={feature.title} width={48} height={48} className="w-24 h-24 bg-gray-50 rounded mb-6" />
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mb-16">
          <div className="w-px h-16 bg-gray-300"></div>
        </div>

        <div className="flex justify-center">
          <img src={HOME_DIFFERENT('divider.webp')} alt="divider" className="max-[329px]" />
        </div>
      </div>
    </div>
  );
}

export default WhatMakesDreamazeDifferent;
