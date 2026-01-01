'use client';

import React from 'react';
import Image from 'next/image';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface WhyFamiliesChooseSectionProps {
  title?: string;
  features?: FeatureItem[];
}

const BASE_ICON_URL = 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/why-families-choose';

const WhyFamiliesChooseSection: React.FC<WhyFamiliesChooseSectionProps> = ({
  title = 'Why Families Choose Dreamaze',
  features = [
    {
      id: '1',
      title: 'Hand-drawn illustrations',
      description: 'Heartfelt stories, never low-quality AI scenes',
      icon: `${BASE_ICON_URL}/illustrations.webp`,
    },
    {
      id: '2',
      title: 'Real photo personalization',
      description: 'Instant recognition, deeper connection',
      icon: `${BASE_ICON_URL}/photo.webp`,
    },
    {
      id: '3',
      title: 'Supports self-recognition',
      description: 'Reading their own story builds identity & confidence',
      icon: `${BASE_ICON_URL}/self-recognition.webp`,
    },
    {
      id: '4',
      title: 'Keepsake quality',
      description: 'Premium, non-toxic paper for little hands',
      icon: `${BASE_ICON_URL}/keepsake.webp`,
    },
  ],
}) => {
  if (!features || features.length === 0) return null;

  return (
    <section className="w-full flex flex-col items-center py-[64px] px-[18px] gap-[24px] md:h-[440px] md:py-[88px] md:gap-[48px]">
      {/* 标题和4个标签的容器 */}
      <div className="flex flex-col items-center gap-[24px] md:gap-[48px] w-full">
        {/* 主标题 */}
        <h2 className="text-center text-[#333333] font-semibold text-[24px] leading-[32px] md:text-[40px] md:leading-[64px] md:font-medium">
          {title}
        </h2>

        {/* 4个标签的总div */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-[48px] md:h-[152px] w-full px-8 md:px-0 md:max-w-[968px]">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-row items-center gap-[12px] md:gap-[16px] md:max-w-[460px]"
            >
              {/* 左侧：图标 */}
              {feature.icon ? (
                <div className="w-[36px] h-[36px] md:w-[64px] md:h-[64px] flex-shrink-0 self-center rounded-[4px] overflow-hidden">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized={true}
                  />
                </div>
              ) : (
                <div className="w-[40px] h-[40px] bg-[#E0E0E0] self-center flex-shrink-0 rounded-[4px]" />
              )}

              {/* 右侧：标题和描述文本 */}
              <div className="flex flex-col md:gap-1 flex-1">
                <h3 className="text-[#222222] font-medium text-[16px] leading-[24px] tracking-[0.15px] md:text-[18px] md:tracking-[0.5px]">
                  {feature.title}
                </h3>
                <p className="text-[#222222] font-normal text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px]">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyFamiliesChooseSection;

