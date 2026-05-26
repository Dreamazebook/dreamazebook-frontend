'use client';

import React from 'react';

type DadPersonalizeSidebarProps = {
  currentStep: number;
  aboutParentLabel?: string;
};

export default function DadPersonalizeSidebar({
  currentStep,
  aboutParentLabel = 'About Dad',
}: DadPersonalizeSidebarProps) {
  const isBasicInfoActive = currentStep === 1 || currentStep === 2;
  const isGetBookActive = currentStep === 3;

  return (
    <nav aria-label="Personalize progress" className="w-[200px] text-[14px] leading-[24px] tracking-[0.25px]">
      <div className="flex gap-3">
        <div className="flex flex-col items-center shrink-0 w-[10px] self-stretch">
          <div className="h-[20px] flex items-center">
            <div
              className={`w-[10px] h-[10px] rounded-full ${isBasicInfoActive ? 'bg-[#012CCE]' : 'bg-[#CCCCCC]'}`}
            />
          </div>
          <div className="w-px flex-1 bg-[#CCCCCC] my-4 min-h-[40px]" />
          <div className="h-[20px] flex items-center">
            <div
              className={`w-[10px] h-[10px] rounded-full ${isGetBookActive ? 'bg-[#012CCE]' : 'bg-[#CCCCCC]'}`}
            />
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <p className={`m-0 h-[20px] flex items-center font-semibold ${isBasicInfoActive ? 'text-[#222222]' : 'text-[#CCCCCC]'}`}>
            Basic information
          </p>
          <div className="mt-3 mb-3 flex flex-col gap-2">
            <span className={currentStep === 1 ? 'text-[#012CCE]' : 'text-[#CCCCCC]'}>About Your Child</span>
            <span className={currentStep === 2 ? 'text-[#012CCE]' : 'text-[#CCCCCC]'}>{aboutParentLabel}</span>
          </div>
          <p className={`m-0 h-[20px] flex items-center font-semibold mt-auto ${isGetBookActive ? 'text-[#222222]' : 'text-[#CCCCCC]'}`}>
            Preview Your Book
          </p>
        </div>
      </div>
    </nav>
  );
}
