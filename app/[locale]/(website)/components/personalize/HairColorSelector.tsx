/** @jsxImportSource react */
'use client';

import React from 'react';

interface HairColorSelectorProps {
  selectedHairColor: string;
  onChange: (hairColor: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  // Optional: backend-driven values, e.g. ["blone", "dark"].
  // UI remains the same; values are mapped to internal palette keys: light | brown | dark
  hairColorValues?: string[];
}

const HairColorSelector: React.FC<HairColorSelectorProps> = ({
  selectedHairColor,
  onChange,
  onBlur,
  error,
  touched,
  hairColorValues,
}) => {
  // Map backend values to internal palette keys used by UI
  const mapBackendToInternal = (val: string) => {
    const s = (val || '').toLowerCase();
    if (s === 'blone' || s === 'blonde' || s === 'light' || s === 'fair' || s === 'light_brown') return 'light';
    if (s === 'brown' || s === 'dark_brown') return 'brown';
    if (s === 'dark' || s === 'black') return 'dark';
    return 'light';
  };

  // Internal palette with fixed UI colors
  const palette: Record<string, string> = {
    light: '#FFD98D',
    brown: '#FF9837',
    dark: '#2F1E10',
  };

  // Build hair colors either from provided backend-driven values or defaults
  const hairColors = (hairColorValues && hairColorValues.length > 0)
    ? Array.from(new Set(hairColorValues.map(mapBackendToInternal)))
        .map((value) => ({ value, color: palette[value] }))
    : [
        { value: 'light', color: palette.light },
        { value: 'brown', color: palette.brown },
        { value: 'dark', color: palette.dark },
      ];

  const handleHairColorSelect = (colorValue: string) => {
    onChange(colorValue);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2 md:gap-0" tabIndex={0} onBlur={onBlur}>
        <label className="font-medium">Hair Color</label>
        <div className="flex gap-6">
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
