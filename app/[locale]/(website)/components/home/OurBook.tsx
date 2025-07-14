import React from 'react';

export default function OurBook() {
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Book</h1>
        
        {/* First row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
          {/* You're Brave in Many Ways */}
          <div className="bg-white rounded-lg p-4 sm:p-6 text-center shadow-sm">
            <div className="mb-3 sm:mb-4">
              <img 
                src="https://via.placeholder.com/200x250/4A90E2/FFFFFF?text=You%27re+Brave+in+Many+Ways" 
                alt="You're Brave in Many Ways" 
                className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
              />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">You're Brave in Many Ways</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Celebrate your child's courage — big or small</p>
            <p className="text-lg font-bold text-gray-800">$250</p>
          </div>

          {/* Goodnight to You */}
          <div className="bg-white rounded-lg p-4 sm:p-6 text-center shadow-sm">
            <div className="mb-3 sm:mb-4">
              <img 
                src="https://via.placeholder.com/200x250/5A67D8/FFFFFF?text=Good+Night+Olivia" 
                alt="Goodnight to You" 
                className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
              />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Goodnight to You</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Drift into dreams with a bedtime story that sees you</p>
            <p className="text-lg font-bold text-gray-800">$250</p>
          </div>

          {/* Your Melody */}
          <div className="bg-white rounded-lg p-4 sm:p-6 text-center shadow-sm">
            <div className="mb-3 sm:mb-4">
              <img 
                src="https://via.placeholder.com/200x250/9F7AEA/FFFFFF?text=Her+Radiant+Curse" 
                alt="Your Melody" 
                className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
              />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Your Melody</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Every name has a song, discover the music hidden in yours</p>
            <p className="text-lg font-bold text-gray-800">$250</p>
          </div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Birthday Book to You */}
          <div className="bg-white rounded-lg p-4 sm:p-6 text-center shadow-sm">
            <div className="mb-3 sm:mb-4">
              <img 
                src="https://via.placeholder.com/200x250/48BB78/FFFFFF?text=The+Wonder+You+See" 
                alt="Birthday Book to You" 
                className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
              />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Birthday Book to You</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Celebrate the special day with a heartfelt jungle surprise</p>
            <p className="text-lg font-bold text-gray-800">$250</p>
          </div>

          {/* Santa's Letter For You */}
          <div className="bg-white rounded-lg p-4 sm:p-6 text-center shadow-sm">
            <div className="mb-3 sm:mb-4">
              <img 
                src="https://via.placeholder.com/200x250/ED8936/FFFFFF?text=Hot+Chocolate+Hair" 
                alt="Santa's Letter For You" 
                className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
              />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Santa's Letter For You</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">A magical letter from Santa, just for your little one</p>
            <p className="text-lg font-bold text-gray-800">$250</p>
          </div>

          {/* New book coming soon */}
          <div className="bg-white rounded-lg p-4 sm:p-6 text-center shadow-sm">
            <div className="mb-3 sm:mb-4 flex items-center justify-center h-48 sm:h-56 lg:h-64">
              <div className="text-4xl sm:text-5xl lg:text-6xl text-gray-400">?</div>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">New book coming soon</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">New books will be online soon, please stay tuned</p>
            <p className="text-lg font-bold text-gray-800">$250</p>
          </div>
        </div>
      </div>
    </div>
  );
}