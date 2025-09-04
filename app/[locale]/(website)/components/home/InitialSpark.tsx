import React from 'react';

function InitialSpark() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-lg font-normal text-gray-900 mb-6">
            Dreamaze's Initial Spark
          </h1>
          
          <div className="max-w-lg mx-auto space-y-1 text-sm text-gray-600 leading-relaxed">
            <p>Children discover kindness, courage, and wonder in stories...</p>
            <p>But what if they were the ones living it?</p>
            <p>That's where <span className="text-white bg-blue-600 px-1.5 py-0.5 rounded font-medium">Dreamaze</span> begins</p>
            <p className="font-medium text-gray-800">We make your child the shining star of their own story.</p>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src="https://images.pexels.com/photos/1094072/pexels-photo-1094072.jpeg"
              alt="Child reading books"
              className="w-full h-48 object-cover"
            />
          </div>
          
          <div className="relative overflow-hidden rounded-lg">
            <img
              src="https://images.pexels.com/photos/1250722/pexels-photo-1250722.jpeg"
              alt="Young person reading magazine"
              className="w-full h-48 object-cover"
            />
            {/* Star overlay */}
            <div className="absolute top-3 right-3">
              <svg
                width="32"
                height="32"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M30 0L37.45 18.55L60 30L37.45 41.45L30 60L22.55 41.45L0 30L22.55 18.55L30 0Z"
                  stroke="#E5E7EB"
                  strokeWidth="1.5"
                  fill="white"
                  fillOpacity="0.95"
                />
              </svg>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-lg">
            <img
              src="https://images.pexels.com/photos/1370296/pexels-photo-1370296.jpeg"
              alt="Person reading with coffee"
              className="w-full h-48 object-cover"
            />
          </div>
        </div>

        {/* Main Headline Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            <span className="text-blue-600">Dreamaze:</span>
            <br />
            <span className="text-gray-900">
              See Yourself In Amazing Dreams
            </span>
          </h2>
          
          <div className="max-w-md mx-auto space-y-1 text-sm text-gray-600">
            <p>A whole collection to celebrate your child's milestones.</p>
            <p>Heartfelt editions for grown-ups.</p>
            <p className="text-blue-600 font-medium">More language options</p>
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="text-center">
          <div className="w-px h-12 bg-gray-300 mx-auto mb-3" />
          <div className="w-2 h-2 border border-gray-400 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}

export default InitialSpark;