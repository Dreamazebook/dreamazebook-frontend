// components/Sidebar.tsx
import React from 'react';

interface SidebarProps {
  currentStep: number;
}

export default function Sidebar({ currentStep }: SidebarProps) {
  const steps = ['Basic information', 'Select book content', 'Get your book!'];

  return (
    <div>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        return (
          <div key={step} className="mb-4">
            <span
              className={`mr-2 ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              ●
            </span>
            <span
              className={isActive ? 'text-blue-600 font-semibold' : 'text-gray-400'}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
