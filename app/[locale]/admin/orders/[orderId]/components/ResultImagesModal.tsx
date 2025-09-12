'use client';

import { FC } from 'react';
import Image from 'next/image';
import { ResultImage } from '../../../../(website)/checkout/components/types';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="relative w-full h-full max-w-6xl max-h-full bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Result Images - {itemName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 h-full overflow-y-auto">
          {images.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No result images available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {images.map((image) => (
                <div key={image.page_id} className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="relative aspect-[2/1]">
                    <Image
                      src={image.result_image_url || image.result?.standard_url || '/placeholder-image.png'}
                      alt={`Page ${image.page_number}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Page {image.page_number}
                      </span>
                      {image.reused && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Reused
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Variant ID: {image.variant_id}
                    </div>
                  </div>
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