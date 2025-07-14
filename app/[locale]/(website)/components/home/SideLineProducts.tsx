import React from 'react';

export default function SideLineProducts() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-black text-white relative">
        <div className="container mx-auto px-6 py-16">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Logo */}
              <div className="flex items-center mb-8">
                <div className="bg-blue-600 px-3 py-1 rounded text-white text-sm font-medium mr-2">
                  book
                </div>
                <h1 className="text-4xl font-bold">Dreamaze</h1>
              </div>
              
              {/* Main Content */}
              <div className="max-w-lg">
                <h2 className="text-2xl font-semibold mb-6">
                  Our first group of leading stars
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Already, our first group of stars has stepped into the spotlight, discovering 
                  the magic of seeing themselves as the heroes of their own personalized 
                  stories.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  Our books unlock children's imaginations, allowing young minds to explore, 
                  dream, and create personalized memories.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  Witness the excitement on their faces as they flip through the pages, 
                  becoming the star of their own adventure.
                </p>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600">Child with book image</span>
                </div>
                {/* Book mockup */}
                <div className="absolute bottom-4 left-4 w-32 h-40 bg-blue-500 rounded shadow-lg flex flex-col items-center justify-center text-white">
                  <div className="text-sm font-medium">Good Night</div>
                  <div className="text-sm">Maria</div>
                  <div className="w-12 h-12 bg-yellow-400 rounded-full mt-2 flex items-center justify-center">
                    <span className="text-blue-500 text-xs">★</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Section */}
      <div className="bg-white rounded-t-3xl -mt-8 relative z-10">
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold text-center mb-12">
            Side-line Range Of Products
          </h2>
          
          <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Left Column - Two items stacked */}
            <div className="space-y-6">
              {/* Wear Their Masterpiece */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium mb-2">Wear Their Masterpiece</h3>
                <p className="text-sm text-gray-600 mb-4">View more →</p>
                <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-xs">Necklace image</span>
                </div>
              </div>
              
              {/* Tiny You Charm */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium mb-2">Tiny You Charm</h3>
                <p className="text-sm text-gray-600 mb-4">View more →</p>
                <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-xs">Charm images</span>
                </div>
              </div>
            </div>
            
            {/* Center Column - Gift-Ready Box (full height) */}
            <div className="bg-blue-600 text-white rounded-lg p-6">
              <h3 className="font-medium mb-2">Gift-Ready Box</h3>
              <p className="text-sm text-blue-200 mb-6">
                A timeless set, beautifully wrapped for gifting.
              </p>
              <div className="flex-1 bg-blue-500 rounded flex items-center justify-center" style={{height: '280px'}}>
                <div className="w-12 h-12 border-2 border-white rounded flex items-center justify-center">
                  <span className="text-white text-lg">▷</span>
                </div>
              </div>
            </div>
            
            {/* Right Column - Mini Me Stickers */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium mb-2">Mini Me Stickers</h3>
              <p className="text-sm text-gray-600 mb-4">View more →</p>
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500 text-xs">Sticker image</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}