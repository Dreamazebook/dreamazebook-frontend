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
    description: ' Flip through sample pages to see how your story looks—then confirm with one click.',
  },
  {
    number: '03',
    title: 'Receive & Enjoy',
    description: ' Your one-of-a-kind gift is on its way. Unwrap it, read it together, and get ready for smiles that last.',
  },
];

export default function LastingMemorial() {
  return (
    <div className="bg-black text-[#FCF2F2] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      {/* Main Title */}
      <h1 className="text-3xl lg:text-5xl font-light text-center mb-8 sm:mb-12 lg:mb-16 max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
         Easy 3 Steps to Create a Lasting Memory
      </h1>
      
      {/* Steps Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 max-w-sm sm:max-w-4xl lg:max-w-6xl w-full mb-8 sm:mb-12 lg:mb-16">
        {steps.map((step) => (
          <div key={step.number} className="text-left flex gap-6 md:flex-col">
            <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-thin text-gray-600 mb-4 sm:mb-6">
              {step.number}
            </div>
            <div>
              <h2 className="text-xl font-medium mb-3">
                {step.title}
              </h2>
              <p className="text-[rgba(255, 255, 255, 0.6)] text-sm sm:text-base leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}