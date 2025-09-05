import React from 'react';

const SideLineProducts = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile Version */}
      <div className="lg:hidden">

        {/* Mobile Content */}
        <div className="px-6 pb-8">
          {/* Blue accent line */}
          <div className="w-1 h-16 bg-blue-600 mb-8"></div>
          
          <h1 className="text-4xl font-bold leading-tight mb-8">
            Our first groups of leading stars
          </h1>
          
          <div className="space-y-6 text-lg text-gray-300 leading-relaxed mb-8">
            <p>
              Already, our first group of stars has stepped into the spotlight, discovering the magic of seeing themselves as the heroes of their own personalized stories.
            </p>
            <p>
              Our books unlock endless possibilities, allowing young minds to explore, dream, and create unforgettable memories.
            </p>
            <p>
              We can't wait for you to join the journey-discover the joy of becoming the lead in your own story.
            </p>
          </div>

          {/* Mobile Image */}
          <div className="relative mb-8">
            <img
              src="https://images.pexels.com/photos/3985015/pexels-photo-3985015.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Happy child with personalized book"
              className="w-full rounded-2xl"
            />
          </div>

        </div>
      </div>

      {/* Desktop Version */}
      <div className="hidden lg:block h-screen">
        {/* Top Section - Black background with content and image */}
        <div className="h-3/5 bg-black relative">
          {/* Header */}
          <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-8 z-10">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 px-4 py-2 rounded text-sm font-semibold">
                book
              </div>
              <span className="text-3xl font-bold">Dreamaze</span>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex h-full pt-24">
            {/* Left side - Text content */}
            <div className="w-1/2 flex flex-col justify-center px-16">
              {/* Blue accent line */}
              <div className="w-1 h-20 bg-blue-600 mb-8"></div>
              
              <h1 className="text-5xl font-bold leading-tight mb-8 max-w-lg">
                Our first groups of leading stars
              </h1>
              
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed max-w-lg">
                <p>
                  Already, our first group of stars has stepped into the spotlight, discovering the magic of seeing themselves as the heroes of their own personalized stories.
                </p>
                <p>
                  Our books unlock endless possibilities, allowing young minds to explore, dream, and create unforgettable memories.
                </p>
                <p>
                  We can't wait for you to join the journey-discover the joy of becoming the lead in your own story.
                </p>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="w-1/2 flex items-end justify-end pr-0">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3985015/pexels-photo-3985015.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Happy child with personalized book"
                  className="h-96 w-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SideLineProducts;