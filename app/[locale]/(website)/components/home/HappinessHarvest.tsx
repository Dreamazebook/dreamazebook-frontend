import React from 'react';

export default function HappinessHarvest() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-8">
      {/* Header */}
      <div className="text-center mb-20">
        <h1 className="text-3xl font-medium text-gray-900">
          They Harvest happiness Here
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto flex">
        {/* Left Column - Book and Review */}
        <div className="w-1/2 flex flex-col items-center">
          {/* Book Image */}
          <div className="w-52 h-72 bg-white shadow-lg mb-12">
            <div className="w-full h-full bg-gray-100 flex flex-col p-4">
              <div className="text-xs font-bold mb-2">DAILY READING</div>
              <div className="text-lg font-bold mb-4">JOY</div>
              <div className="space-y-2 text-xs flex-1">
                <div className="h-1 bg-gray-300 w-3/4"></div>
                <div className="h-1 bg-gray-300 w-1/2"></div>
                <div className="h-1 bg-gray-300 w-5/6"></div>
              </div>
              <div className="text-xs mt-auto">By Someone Nice</div>
            </div>
          </div>

          {/* Review Section */}
          <div className="max-w-sm">
            <div className="text-base leading-relaxed text-gray-700 mb-6">
              "My mom said it was the best gift she had ever received! She never 
              thought she could appear in a book, it's amazing. She said she would 
              always treasure it, which made me also very happy."
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className="w-5 h-5 fill-yellow-400 text-yellow-400" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>

            {/* Buy Button */}
            <button className="inline-flex items-center gap-2 text-gray-700 underline">
              Buy the same
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14m-7-7l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Right Column - Navigation Dots */}
        <div className="w-1/2 flex flex-col items-center space-y-6 pt-20">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-600">DDDD</span>
          </div>
          
          <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">Where Are You!</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-600">Hi!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}