import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Personalize It',
    description: 'Add your child’s name, upload a photo, and choose a few fun details—it’s quick and joyful!',
  },
  {
    number: '02',
    title: 'Preview & Confirm',
    description: 'Flip through your book and make sure everything looks just right.',
  },
  {
    number: '03',
    title: 'Receive & Enjoy',
    description: 'Your one-of-a-kind gift is on its way—get ready for smiles!',
  },
];

export default function LastingMemorial() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-center mb-8 sm:mb-12 lg:mb-16 max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        Three Steps To Create A Lasting Memorial
      </h1>
      
      {/* Steps Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 max-w-sm sm:max-w-4xl lg:max-w-6xl w-full mb-8 sm:mb-12 lg:mb-16">
        {steps.map((step) => (
          <div key={step.number} className="text-center">
            <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-thin text-gray-600 mb-4 sm:mb-6">
              {step.number}
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4">
              {step.title}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed px-2 sm:px-4 lg:px-0">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}