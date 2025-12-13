import React from 'react';
import { Link } from '@/i18n/routing';
import { BOOKS_URL } from '@/constants/links';
import DreamzeImage from '@/app/components/DreamzeImage';
import { BookSection } from './booksConfig';

interface GiftPackagesSectionProps {
  section: BookSection;
}

const GiftPackagesSection: React.FC<GiftPackagesSectionProps> = ({ 
  section,
}) => {
  const packages = section.giftPackages || [];
  const bannerImage = section.bannerImage;
  const bannerTitle = section.bannerTitle || 'Ready-to-Gift Packages';
  const bannerDescription = section.bannerDescription || [
    'Handpicked bundles with books + keepsakes - beautifully wrapped for effortless gifting.',
    'Create your own perfect gift set'
  ];
  const waveImage = section.waveImage;
  return (
    <div className={`bg-[#FFF7F9] ${section.className || ''}`}>
      {/* Banner Section */}
      {bannerImage && (
        <div
          className="relative h-[256px] md:h-[381px] bg-cover bg-center flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: `url(${bannerImage})`,
            backgroundPosition: 'center 40%'
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
          
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto -mt-4 md:-mt-12">
            <h1 className="text-4xl md:text-[40px] md:leading-[60px] font-medium mb-6">
              {bannerTitle}
            </h1>
            {bannerDescription.map((desc, index) => (
              <p 
                key={index} 
                className={`text-base md:text-[18px] leading-[28px] ${index === 0 ? '' : ''} leading-relaxed`}
              >
                {desc}
              </p>
            ))}
          </div>

          {waveImage && (
            <img 
              src={waveImage} 
              className="absolute lg:-bottom-15 md:-bottom-10 -bottom-5 md:-left-5 left-0 scale-105 right-0 w-full h-auto" 
              alt="" 
            />
          )}
        </div>
      )}

      {/* Packages Grid */}
      <div className="mx-auto px-4 py-12 md:pt-0 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-[48px] mx-auto max-w-[900px] justify-items-center">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className="flex flex-col items-center text-center md:w-[280px] md:h-[306px]"
              style={{
                opacity: 1,
                transform: 'rotate(0deg)',
              }}
            >
              {/* Package Image */}
              <div 
                className="relative mb-6 md:mb-8 mx-auto"
                style={{
                  width: '160px',
                  height: '130px',
                  opacity: 1,
                  transform: 'rotate(0deg)',
                }}
              >
                <DreamzeImage src={pkg.image} alt={pkg.title} />
              </div>

              {/* Package Info */}
              <div className="space-y-2 mb-6 md:mb-8">
                <h2 className="text-[18px] font-medium text-[#222222]">
                  {pkg.title}
                </h2>

                <p className="text-[14px] text-[#22222299] max-w-xs mx-auto leading-relaxed">
                  {pkg.description}
                </p>

                <p className="text-[14px] text-[#22222299]">
                  save <span className="font-semibold text-[#012CCE]">{pkg.discount}</span> + {pkg.extras}
                </p>
              </div>

              {/* CTA Button */}
              <Link 
                href={BOOKS_URL} 
                className="inline-flex cursor-pointer items-center gap-2 text-[#222222] hover:text-primary transition-colors group text-[16px]"
              >
                <span>Choose Books</span>
                <span className="transform group-hover:translate-x-1 transition-transform flex items-center">→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GiftPackagesSection;