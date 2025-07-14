import React from 'react';

export default function InitialSpark() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="text-center py-12 px-4">
        <h1 className="text-3xl font-bold text-black mb-12">
          Dreamaze's Initial Spark
        </h1>
        
        <div className="max-w-md mx-auto space-y-1 text-sm text-gray-800">
          <p>Children discover kindness, courage, and wonder in stories...</p>
          <p>But what if they were the ones living it?</p>
          <p>
            That's where <span className="bg-blue-600 text-white px-1 rounded">Dreamaze</span> begins
          </p>
          <p>
            We make your child the <span className="bg-yellow-300 text-black px-1 rounded">shining star</span> of their own story.
          </p>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="flex justify-center items-end gap-3 px-4 mb-16">
        {/* Left image - stacked books */}
        <div className="w-32 h-48 bg-amber-800 rounded-lg overflow-hidden shadow-md">
          <div className="w-full h-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center">
            <div className="text-4xl">📚</div>
          </div>
        </div>

        {/* Center image - woman reading magazine */}
        <div className="w-40 h-56 bg-pink-100 rounded-lg overflow-hidden shadow-md relative">
          <div className="w-full h-full bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
            <div className="text-5xl">👩‍🦱</div>
          </div>
          {/* White circular badge */}
          <div className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
            <div className="w-5 h-5 bg-pink-200 rounded-full"></div>
          </div>
        </div>

        {/* Right image - person with coffee and book */}
        <div className="w-32 h-48 bg-amber-100 rounded-lg overflow-hidden shadow-md relative">
          <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-200 flex items-center justify-center">
            <div className="text-4xl">☕</div>
          </div>
          {/* Text overlay */}
          <div className="absolute top-2 left-2 right-2 text-xs text-gray-700 font-medium">
            <div className="bg-white/90 rounded px-2 py-1 text-center">
              year has<br/>taught me<br/>so far...
            </div>
          </div>
        </div>
      </div>

      {/* Main CTA Section */}
      <div className="text-center px-4 pb-16">
        <h2 className="text-4xl font-bold text-blue-600 mb-8 leading-tight max-w-4xl mx-auto">
          Dreamaze: See Yourself In Amazing Dreams
        </h2>
        
        <div className="max-w-sm mx-auto space-y-1 text-sm text-gray-700 mb-12">
          <p>A whole collection to celebrate your child's milestones.</p>
          <p>Heartfelt editions for grown-ups.</p>
          <p>More language options</p>
        </div>

        {/* Vertical line */}
        <div className="w-px h-12 bg-gray-300 mx-auto mb-4"></div>

        {/* Info circle */}
        <div className="w-8 h-8 border border-gray-400 rounded-full flex items-center justify-center text-gray-500 text-sm font-normal mx-auto">
          i
        </div>
      </div>
    </div>
  );
}