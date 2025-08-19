/** @jsxImportSource react */
'use client';

import React from 'react';
import Image from 'next/image';
import { FaCheck } from 'react-icons/fa';

interface HairstyleSelectorProps {
  bookId: string;
  selectedHairstyle: string;
  onChange: (hairstyle: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
}

const HairstyleSelector: React.FC<HairstyleSelectorProps> = ({
  bookId,
  selectedHairstyle,
  onChange,
  onBlur,
  error,
  touched,
}) => {
  // 根据bookId动态生成发型选项
  const hairstyles = [
    { id: 'hair_1', name: '发型 1', image: `/picbooks/${bookId}/avatar/layer_hair_1.png` },
    { id: 'hair_2', name: '发型 2', image: `/picbooks/${bookId}/avatar/layer_hair_2.png` },
    { id: 'hair_3', name: '发型 3', image: `/picbooks/${bookId}/avatar/layer_hair_3.png` },
    { id: 'hair_4', name: '发型 4', image: `/picbooks/${bookId}/avatar/layer_hair_4.png` },
  ];

  const handleHairstyleSelect = (hairstyleId: string) => {
    onChange(hairstyleId);
  };

  return (
    <div>
      <div className="flex items-center justify-between" tabIndex={0} onBlur={onBlur}>
        <label className="font-medium">Hairstyle</label>
        <div className="flex gap-3">
          {hairstyles.map((hairstyle) => (
            <button
              key={hairstyle.id}
              type="button"
              className={`relative w-12 h-12 rounded-lg border-2 overflow-hidden ${
                selectedHairstyle === hairstyle.id
                  ? 'border-[#012CCE] ring-2 ring-[#012CCE]/30'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleHairstyleSelect(hairstyle.id)}
              title={hairstyle.name}
            >
              <Image
                src={hairstyle.image}
                alt={hairstyle.name}
                fill
                sizes="48px"
                className="object-cover"
                onError={(e) => {
                  // 如果图片加载失败，显示占位符
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {selectedHairstyle === hairstyle.id && (
                <div className="absolute inset-0 bg-[#012CCE]/20 flex items-center justify-center">
                  <FaCheck className="w-4 h-4 text-[#012CCE]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      {touched && error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default HairstyleSelector;
