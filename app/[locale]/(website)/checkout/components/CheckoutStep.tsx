'use client';

import React from 'react';

interface CheckoutStepProps {
  stepNumber: number;
  title: string;
  isOpen: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  canOpen?: boolean;
}

const CheckoutStep: React.FC<CheckoutStepProps> = ({
  stepNumber,
  title,
  isOpen,
  isCompleted,
  onToggle,
  children,
  canOpen = true
}) => {
  return (
    <div className="mb-6">
      <div 
        className={`flex items-center justify-between p-4 border ${isOpen ? 'border-b-0 rounded-t-lg' : 'rounded-lg'} ${isCompleted && !isOpen ? 'bg-gray-50' : 'bg-white'}`}
        onClick={() => canOpen && onToggle()}
      >
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {isCompleted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <span>{stepNumber}</span>
            )}
          </div>
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        {canOpen && (
          <button className="text-gray-500">
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}
      </div>
      {isOpen && (
        <div className="border border-t-0 rounded-b-lg p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

export default CheckoutStep;