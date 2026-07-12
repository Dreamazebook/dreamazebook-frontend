'use client';

import React, { type CSSProperties } from 'react';

interface Option {
  value: string;
  label: string;
}

interface InputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
  options?: Option[];
  placeholder?: string;
  required?: boolean;
  hideRequiredMark?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
  inputStyle?: CSSProperties;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  options,
  placeholder,
  required = false,
  hideRequiredMark = false,
  className = '',
  inputClassName = '',
  labelClassName = '',
  wrapperClassName = '',
  wrapperStyle,
  inputStyle,
}) => {
  const inputBorderClass = error ? 'border-red-500' : inputClassName ? '' : 'border-gray-300';
  const inputPaddingClass = inputClassName ? '' : 'p-2';
  const inputStyles = `w-full border rounded-md ${inputPaddingClass} ${inputBorderClass} ${inputClassName}`.trim();
  const labelStyles = labelClassName || 'text-[16px] font-medium text-[#222] mb-1';
  const containerClassName = wrapperClassName || className;

  return (
    <div className={containerClassName} style={wrapperStyle}>
      <label htmlFor={id} className={`block ${labelStyles}`}>
        {label}{required && !hideRequiredMark && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          id={id}
          className={`w-full p-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'} ${inputClassName}`}
          value={value}
          onChange={onChange}
          required={required}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          className={inputStyles}
          style={inputStyle}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
      
      {error && <p className="text-sm text-[#CF0F02]">{error}</p>}
    </div>
  );
};

export default Input;