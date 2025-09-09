import React, { useState } from 'react';
import { FaStar as Star, FaArrowRight as ArrowRight, FaChevronCircleLeft as ChevronLeft, FaChevronCircleRight as ChevronRight } from 'react-icons/fa';

interface StorySpread {
  id: number;
  leftImage: string;
  rightImage: string;
  leftText: string;
  rightText: string;
}

const storyData: StorySpread[] = [
  {
    id: 1,
    leftImage: "https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg?auto=compress&cs=tinysrgb&w=600",
    rightImage: "https://images.pexels.com/photos/1098982/pexels-photo-1098982.jpeg?auto=compress&cs=tinysrgb&w=600",
    leftText: "So high and free.",
    rightText: "spreads his wings. What will he see?"
  },
  {
    id: 2,
    leftImage: "https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=600",
    rightImage: "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=600",
    leftText: "Dreaming now.",
    rightText: "He starts to glow."
  },
  {
    id: 3,
    leftImage: "https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=600",
    rightImage: "https://images.pexels.com/photos/1252814/pexels-photo-1252814.jpeg?auto=compress&cs=tinysrgb&w=600",
    leftText: "Through starlit skies,",
    rightText: "Good Night Knox"
  }
];

export default function PicBooksShow() {
  const [currentSpread, setCurrentSpread] = useState(0);

  const nextSpread = () => {
    setCurrentSpread((prev) => (prev + 1) % storyData.length);
  };

  const prevSpread = () => {
    setCurrentSpread((prev) => (prev - 1 + storyData.length) % storyData.length);
  };

  const currentData = storyData[currentSpread];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Story Book - Desktop */}
        <div className="hidden md:block mb-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="flex">
              {/* Left Page */}
              <div className="w-1/2 relative">
                <div className="aspect-[4/3] relative">
                  <img
                    src={currentData.leftImage}
                    alt="Story page"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-white text-lg font-medium drop-shadow-md">
                      {currentData.leftText}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right Page */}
              <div className="w-1/2 relative border-l border-gray-200">
                <div className="aspect-[4/3] relative">
                  <img
                    src={currentData.rightImage}
                    alt="Story page"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 right-4">
                    <p className="text-white text-lg font-medium drop-shadow-md text-right">
                      {currentData.rightText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Story Pages */}
        <div className="md:hidden space-y-4 mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="aspect-[4/3] relative">
              <img
                src={currentData.leftImage}
                alt="Story page"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4">
                <p className="text-white text-lg font-medium drop-shadow-md">
                  {currentData.leftText}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="aspect-[4/3] relative">
              <img
                src={currentData.rightImage}
                alt="Story page"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4">
                <p className="text-white text-lg font-medium drop-shadow-md text-right">
                  {currentData.rightText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center space-x-4 mb-8">
          <button
            onClick={prevSpread}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex space-x-2">
            {storyData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSpread(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentSpread ? 'bg-gray-800' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextSpread}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bedtime story
          </h1>
          
          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed mb-6">
            Already, our first group of stars has stepped into the spotlight, discovering the magic of seeing themselves as the heroes of their own personalized stories.
          </p>

          {/* Star Rating */}
          <div className="flex justify-center items-center space-x-1 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-6 h-6 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>

          {/* Personalize Button */}
          <div className="flex justify-center mb-8">
            <button className="bg-gray-900 hover:bg-gray-800 text-white font-medium text-lg px-8 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2">
              <span>Personalize</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Pagination */}
          <div className="text-gray-500 text-sm">
            {currentSpread + 1} / {storyData.length}
          </div>
        </div>
      </div>
    </div>
  );
}