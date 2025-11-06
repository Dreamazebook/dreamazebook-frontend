"use client";

import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface FormFieldProps {
  id: string;
  label?: string;
  value?: string | boolean | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  type?: 'text' | 'email' | 'select' | 'checkbox' | 'tel' | 'textarea';
  required?: boolean;
  error?: string | undefined;
  options?: Option[];
  placeholder?: string;
  children?: React.ReactNode;
}

export default function FormField({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  required = false,
  error,
  options = [],
  placeholder,
  children,
}: FormFieldProps) {
  return (
    <div className="mb-4">
      {label && (
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      )}

      {type === 'select' ? (
        <select
          id={id}
          required={required}
          className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
          value={String(value ?? '')}
          onChange={onChange as any}
          onBlur={onBlur}
        >
          <option value="">Select</option>
          {options.map((opt,idx) => (
            <option key={opt.value+idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          required={required}
          className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
          value={String(value ?? '')}
          onChange={onChange as any}
          onBlur={onBlur}
          placeholder={placeholder}
        />
      ) : type === 'checkbox' ? (
        <div className="flex items-center">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={onChange as any}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
            {children}
          </label>
        </div>
      ) : (
        <input
          id={id}
          type={type}
          required={required}
          className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
          value={String(value ?? '')}
          onChange={onChange as any}
          onBlur={onBlur}
          placeholder={placeholder}
        />
      )}

      {error && type !== 'checkbox' && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
