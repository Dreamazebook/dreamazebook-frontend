'use client';

import { FC, useState } from 'react';
import DreamzeImage from '@/app/components/DreamzeImage';

interface PagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: any[];
  bookTitle: string;
}

const PagesModal: FC<PagesModalProps> = ({ isOpen, onClose, pages, bookTitle }) => {
  const [selectedPageIds, setSelectedPageIds] = useState<number[]>([]);
  
  if (!isOpen) return null;

  const handleCheckboxChange = (pageId: number) => {
    console.log('Checkbox clicked for pageId:', pageId);
    setSelectedPageIds(prev => {
      const newSelected = [...prev];
      const index = newSelected.indexOf(pageId);
      if (index === -1) {
        newSelected.push(pageId);
      } else {
        newSelected.splice(index, 1);
      }
      console.log('Updated selectedPageIds:', newSelected);
      return newSelected;
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-xl w-full h-full overflow-hidden">
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
        <div className="p-6 overflow-y-auto max-h-full">
          {/* Book Title */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-medium text-gray-900 mb-2">{bookTitle}</h3>
          </div>

          {/* Page Thumbnails */}
          <div className="grid gap-2 mb-6">
            {pages.map((page, index) => (
              <div key={index} className="relative w-full aspect-[960/487] flex items-center group">
                <DreamzeImage
                  src={page.result_image_url || page.image_url}
                  alt={`Page ${page.page_number}`}
                  cssClass=""
                />
                <div className="absolute right-2 top-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedPageIds.includes(page.page_id)}
                    onChange={() => handleCheckboxChange(page.page_id)}
                    className="w-5 h-5 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PagesModal;