'use client';

import { FC } from 'react';
import DreamzeImage from '@/app/components/DreamzeImage';

interface PagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: any[];
  bookTitle: string;
}

const PagesModal: FC<PagesModalProps> = ({ isOpen, onClose, pages, bookTitle }) => {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-medium text-gray-900">{bookTitle}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 border rounded-md cursor-pointer">
              重申生成
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 cursor-pointer">
              审核通过
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Book Title */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-medium text-gray-900 mb-2">{bookTitle}</h3>
          </div>

          {/* Page Thumbnails */}
          <div className="grid gap-2 mb-6">
            {pages.map((page, index) => (
              <div key={index} className="relative w-full aspect-[960/487]">
              <DreamzeImage
                src={page.result_image_url || page.image_url}
                alt={`Page ${page.page_number}`}
                cssClass=""
              />
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PagesModal;