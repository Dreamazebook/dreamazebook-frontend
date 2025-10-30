import { HOME_IMAGE } from '@/constants/cdn';
import React from 'react';
import { FaStar as Star, FaArrowRight as ArrowRight } from 'react-icons/fa';

export default function SantaLetterHero() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        {/* Desktop: Two Column Layout, Mobile: Single Column */}
        <div className="flex flex-col lg:flex-row items-center lg:gap-16">
          
          {/* Left Column - Book Image */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:py-8">
            {/* Mobile: Simple image placeholder */}
            <div className="lg:hidden w-full">
              <img 
                src={HOME_IMAGE('preview_santas.png')} 
                alt="Santa's Letter Book" 
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Desktop: Full book display */}
            <div className="hidden lg:flex lg:flex-col lg:items-center w-full px-4 sm:px-6 lg:px-8">
              {/* Main Book Cover */}
              <div className="relative mb-8 lg:mb-12">
                <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300 w-72 h-80 sm:w-80 sm:h-96 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                  {/* Snow pattern background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white to-transparent"></div>
                  </div>
                  
                  {/* Snow trees decoration */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                      <polygon points="30,100 40,60 20,60" fill="white" />
                      <polygon points="40,100 50,50 30,50" fill="white" />
                      <polygon points="170,100 180,60 160,60" fill="white" />
                      <polygon points="180,100 190,50 170,50" fill="white" />
                    </svg>
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-3xl sm:text-4xl font-serif text-blue-900 text-center mb-4 relative z-10">
                    Santa's Letter<br/>For James
                  </h2>
                  
                  {/* Character illustration placeholder */}
                  <div className="relative z-10 mt-4">
                    <div className="flex items-end justify-center gap-2">
                      {/* Mailbox */}
                      <div className="w-12 h-16 bg-red-600 rounded-t-lg relative">
                        <div className="w-10 h-2 bg-red-700 absolute top-2 left-1"></div>
                        <div className="w-8 h-8 bg-white rounded absolute bottom-2 left-2 flex items-center justify-center text-xs">📬</div>
                      </div>
                      
                      {/* Child character */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-amber-300 rounded-full mb-1"></div>
                        <div className="w-20 h-24 bg-yellow-500 rounded-lg"></div>
                        <div className="flex gap-1 mt-1">
                          <div className="w-3 h-8 bg-blue-800 rounded"></div>
                          <div className="w-3 h-8 bg-blue-800 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Brand badge */}
                  <div className="absolute bottom-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    Bookiola
                  </div>
                </div>
              </div>
              
              {/* Sample Pages Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-xl">
                {/* Row 1 */}
                <div className="bg-white rounded shadow-md h-20 sm:h-24 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 p-2 text-xs flex items-center justify-center">
                    🎅📝
                  </div>
                </div>
                <div className="bg-white rounded shadow-md h-20 sm:h-24 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 p-2 text-xs flex items-center justify-center">
                    🎁🎄
                  </div>
                </div>
                <div className="bg-white rounded shadow-md h-20 sm:h-24 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 p-2 text-xs flex items-center justify-center">
                    📚✨
                  </div>
                </div>
                
                {/* Row 2 */}
                <div className="bg-white rounded shadow-md h-20 sm:h-24 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 p-2 text-xs flex items-center justify-center">
                    🍪🥛
                  </div>
                </div>
                <div className="bg-white rounded shadow-md h-20 sm:h-24 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-cyan-200 p-2 text-xs flex items-center justify-center">
                    🌙✈️
                  </div>
                </div>
                <div className="bg-white rounded shadow-md h-20 sm:h-24 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-200 p-2 text-xs flex items-center justify-center">
                    🦌🌟
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left px-4 py-8 sm:px-6 lg:px-8">
            {/* Trending badge - only on desktop */}
            <div className="hidden lg:block text-gray-500 text-sm mb-4">
              /Trending Now
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Santa's letter For You
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
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