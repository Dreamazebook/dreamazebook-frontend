'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';

const NeedHelpSection: React.FC = () => {
  const [needHelpOpen, setNeedHelpOpen] = useState(false);

  return (
    <div className="mt-6 border-t border-[#E5E5E5] pt-4">
      <button
        type="button"
        className="flex items-center justify-between w-full cursor-pointer select-none"
        onClick={() => setNeedHelpOpen((prev) => !prev)}
      >
        <span className="text-[#222222] font-medium text-base">Need help?</span>
        <svg
          className={`w-5 h-5 text-[#666666] transition-transform duration-200 ${needHelpOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {needHelpOpen && (
        <div className="mt-3 gap-2 flex">
          <button
            type="button"
            className="flex items-center gap-2 w-full text-left cursor-pointer"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).Tawk_API?.maximize) {
                (window as any).Tawk_API.maximize();
              }
            }}
          >
            <svg className="w-5 h-5 text-[#222222] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
            <div>
              <p className="text-[14px] font-medium text-[#222222] leading-tight">Chat with us</p>
              <p className="text-[12px] text-[#666666] leading-tight">Live support</p>
            </div>
          </button>
          <Link
            href="/delivery-information"
            className="flex items-center gap-2 w-full"
          >
            <svg className="w-5 h-5 text-[#222222] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <div>
              <p className="text-[14px] font-medium text-[#222222] leading-tight">Delivery information</p>
              <p className="text-[12px] text-[#666666] leading-tight">Shipping details</p>
            </div>
          </Link>
          <Link
            href="/faq"
            className="flex items-center gap-2 w-full"
          >
            <svg className="w-5 h-5 text-[#222222] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p className="text-[14px] font-medium text-[#222222] leading-tight">FAQs</p>
              <p className="text-[12px] text-[#666666] leading-tight">Common questions</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default NeedHelpSection;
