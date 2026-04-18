import { HOME_IMAGE } from '@/constants/cdn';
import React from 'react';
import { Star, ArrowRight } from '@/utils/icons';

export default function SantaLetterHero() {
  return (
    <div className="bg-[#FFFBF2]">
      <div className="max-w-7xl mx-auto">
        {/* Desktop: Two Column Layout, Mobile: Single Column */}
        <div className="flex flex-col lg:flex-row items-center lg:gap-16">
          
          {/* Left Column - Book Image */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:py-8">
            <img 
              src={HOME_IMAGE('preview_santas.png')} 
              alt="Santa's Letter Book" 
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Right Column - Content */}
          <div className="w-full text-[#222] lg:w-1/2 text-center lg:text-left px-4 py-8 sm:px-6 lg:px-8">
            {/* Trending badge - only on desktop */}
            <div className="hidden lg:block text-gray-500 text-sm mb-4">
              /Trending Now
            </div>
            
            <h1 className="text-4xl mb-6">
              Santa's letter For You
            </h1>
            
            <p className="text-lg text-left sm:text-xl mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Ho ho ho! This year, Santa has a letter just for your little one.
              Personalize it now, and show your child that he knows their
              name, their good deeds, and even their Christmas wishes.
              Make the Christmas miracle feel real—and full of fun!
            </p>
            
            {/* Star Rating */}
            <div className="flex justify-center lg:justify-start gap-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 sm:w-8 sm:h-8 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            
            {/* CTA Button */}
            <button className="group inline-flex items-center gap-3 text-gray-900 text-base sm:text-lg font-normal transition-all duration-300">
              Create the Letter Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}