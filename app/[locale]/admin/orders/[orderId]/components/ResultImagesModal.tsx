'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import { ResultImage } from '@/types/order';
import { useOrderDetail } from '../context/OrderDetailContext';

interface ResultImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ResultImage[];
  itemName: string;
}

const ResultImagesModal: FC<ResultImagesModalProps> = ({
  isOpen,
  onClose,
  images,
  itemName,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'full'>('grid');
  const [selectedPageCodes, setSelectedPageCodes] = useState<string[]>([]);
  const { handleManualConfirm } = useOrderDetail();
  
  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await handleManualConfirm(images[0]?.item_id?.toString());
    } finally {
      setIsConfirming(false);
    }
  };

  const handleImageSelect = (pageCode: string) => {
    setSelectedPageCodes(prev => 
      prev.includes(pageCode) 
        ? prev.filter(code => code !== pageCode)
        : [...prev, pageCode]
    );
  };

  const handleSelectAll = () => {
    if (selectedPageCodes.length === images.length) {
      setSelectedPageCodes([]);
    } else {
      setSelectedPageCodes(images.map(img => img.page_code));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="relative w-full h-full max-w-6xl max-h-full bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Result Images - {itemName}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {selectedPageCodes.length === images.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedPageCodes.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedPageCodes.length} selected
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'full' : 'grid')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              title={`Switch to ${viewMode === 'grid' ? 'full' : 'grid'} view`}
            >
              {viewMode === 'grid' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isConfirming ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Confirming...</span>
                </>
              ) : (
                <span>Confirm</span>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 h-full overflow-y-auto">
          {images.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No result images available</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'space-y-3' : 'space-y-4'}>
              {images.map((image, index) => (
                <div 
                  key={index} 
                  className={`
                    rounded-lg overflow-hidden relative
                    ${viewMode === 'grid' 
                      ? 'bg-white border border-gray-200 p-4' 
                      : 'bg-white border border-gray-200'
                    }
                    ${selectedPageCodes.includes(image.page_code) ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  {viewMode === 'grid' ? (
                    /* Grid Mode: One line layout with all info */
                    <div className="flex items-center space-x-4">
                      {/* Selection Checkbox */}
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedPageCodes.includes(image.page_code)}
                          onChange={() => handleImageSelect(image.page_code)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        />
                      </div>
                      
                      {/* Page Code */}
                      <div className="flex-shrink-0 w-30">
                        <span className="text-sm font-medium text-gray-900">
                          Page: {image.page_code}
                        </span>
                      </div>
                      
                      {/* Base Image */}
                      <div className="flex-shrink-0 w-100">
                        <div className="relative aspect-[2/1]">
                          <Image
                            src={image.base_image_path || '/placeholder-image.png'}
                            alt={`Base Page ${image.page_code}`}
                            fill
                            className="object-cover rounded"
                            unoptimized
                          />
                        </div>
                      </div>
                      
                      {/* Final Image */}
                      <div className="flex-shrink-0 w-100">
                        <div className="relative aspect-[2/1]">
                          <Image
                            src={image.final_image_url || '/placeholder-image.png'}
                            alt={`Final Page ${image.page_code}`}
                            fill
                            className="object-cover rounded"
                            unoptimized
                          />
                        </div>
                      </div>
                      
                      {/* Index */}
                      <div className="flex-shrink-0 text-xs text-gray-500">
                        #{index + 1}
                      </div>
                    </div>
                  ) : (
                    /* Full Mode: Original layout */
                    <>
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedPageCodes.includes(image.page_code)}
                          onChange={() => handleImageSelect(image.page_code)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        />
                      </div>
                      <div 
                        className="relative w-full"
                        style={{ paddingBottom: '56.25%' }}
                      >
                        <Image
                          src={image.final_image_url || '/placeholder-image.png'}
                          alt={`Page ${image.page_code}`}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            Page: {image.page_code}
                          </span>
                          {viewMode === 'full' && (
                            <span className="text-xs text-gray-500">
                              Image {index + 1} of {images.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultImagesModal;