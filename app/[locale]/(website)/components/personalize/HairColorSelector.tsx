/** @jsxImportSource react */
'use client';

import React from 'react';

interface HairColorSelectorProps {
  selectedHairColor: string;
  onChange: (hairColor: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
}

const HairColorSelector: React.FC<HairColorSelectorProps> = ({
  selectedHairColor,
  onChange,
  onBlur,
  error,
  touched,
}) => {
  // 发色选项，参考page_properties.json中的hairColorFilter
  const hairColors = [
    { value: 'light', label: '浅色', color: '#FFD98D' },     // 浅棕色
    { value: 'brown', label: '棕色', color: '#FF9837' },     // 深棕色
    { value: 'dark', label: '黑色', color: '#2F1E10' },      // 黑色
  ];

  const handleHairColorSelect = (colorValue: string) => {
    onChange(colorValue);
  };

  return (
    <div>
      <div className="flex items-center justify-between" tabIndex={0} onBlur={onBlur}>
        <label className="font-medium">Hair Color</label>
        <div className="flex gap-2">
          {hairColors.map((color) => (
            <button
              key={color.value}
              type="button"
              className={`w-8 h-8 rounded-full ${selectedHairColor === color.value ? 'ring-4' : ''}`}
              style={{
                backgroundColor: color.color,
                ...(selectedHairColor === color.value
                  ? { boxShadow: `0 0 0 4px ${color.color}80` }
                  : {}),
              }}
              onClick={() => handleHairColorSelect(color.value)}
              title={color.label}
            />
          ))}
        </div>
      </div>
      {touched && error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default HairColorSelector;
