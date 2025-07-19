import React from 'react';

export default function LastingMemorial() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-center mb-8 sm:mb-12 lg:mb-16 max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        Three Steps To Create A Lasting Memorial
      </h1>
      
      {/* Steps Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 max-w-sm sm:max-w-4xl lg:max-w-6xl w-full mb-8 sm:mb-12 lg:mb-16">
        {/* Step 01 */}
        <div className="text-center">
          <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-thin text-gray-600 mb-4 sm:mb-6">
            01
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4">
            Personalize It
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed px-2 sm:px-4 lg:px-0">
            Add your child&quot;s name, upload a photo, and choose a few fun details—it&quot;s quick and joyful!
          </p>
        </div>
        
        {/* Step 02 */}
        <div className="text-center">
          <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-thin text-gray-600 mb-4 sm:mb-6">
            02
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4">
            Preview & Confirm
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed px-2 sm:px-4 lg:px-0">
            Flip through your book and make sure everything looks just right.
          </p>
        </div>
        
        {/* Step 03 */}
        <div className="text-center">
          <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-thin text-gray-600 mb-4 sm:mb-6">
            03
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4">
            Receive & Enjoy
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed px-2 sm:px-4 lg:px-0">
            Your one-of-a-kind gift is on its way—get ready for smiles!
          </p>
        </div>
      </div>
      
      {/* CTA Button */}
      <button className="group flex items-center space-x-3 bg-transparent border border-white px-6 sm:px-8 lg:px-10 py-2 sm:py-3 rounded-md hover:bg-white hover:text-black transition-colors duration-300 w-full sm:w-auto max-w-xs sm:max-w-none">
        <span className="text-sm sm:text-base font-medium">Get right now</span>
        <svg 
          className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </div>
  );
}