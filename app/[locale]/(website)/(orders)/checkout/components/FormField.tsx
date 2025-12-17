"use client";

import React from "react";

interface Option {
  value: string;
  label: string;
}

interface FormFieldProps {
  id: string;
  label?: string;
  value?: string | boolean | number;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onBlur?: () => void;
  type?: "text" | "email" | "select" | "checkbox" | "tel" | "textarea";
  required?: boolean;
  error?: string | undefined;
  options?: Option[];
  placeholder?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function FormField({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  required = false,
  error,
  options = [],
  placeholder,
  children,
  disabled = false,
}: FormFieldProps) {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id}
          className="block text-[16px] font-medium text-[#222] mb-1"
        >
          {label}
        </label>
      )}

      {type === "select" ? (
        <select
          id={id}
          disabled={disabled}
          required={required}
          className={`w-full p-2 border rounded transition-colors ${
            error 
              ? "border-red-500" 
              : disabled
                ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                : "border-gray-300 bg-white"
          }`}
          value={String(value ?? "")}
          onChange={onChange as any}
          onBlur={onBlur}
        >
          <option value="">Select</option>
          {options.map((opt, idx) => (
            <option key={opt.value + idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          required={required}
          disabled={disabled}
          className={`w-full p-2 border rounded transition-colors resize-none ${
            error 
              ? "border-red-500" 
              : disabled
                ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                : "border-gray-300 bg-white"
          }`}
          value={String(value ?? "")}
          onChange={onChange as any}
          onBlur={onBlur}
          placeholder={placeholder}
        />
      ) : type === "checkbox" ? (
        <div className="flex items-center">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={onChange as any}
            disabled={disabled}
            className={`h-4 w-4 border-gray-300 rounded transition-colors ${
              disabled 
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                : "text-blue-600"
            }`}
          />
          <label htmlFor={id} className={`ml-2 block ${disabled ? "text-gray-500" : ""}`}>
            {children}
          </label>
        </div>
      ) : (
        <>
          <input
            id={id}
            type={type}
            required={required}
            disabled={disabled}
            className={`w-full p-2 border rounded transition-colors ${
              error 
                ? "border-red-500" 
                : disabled
                  ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                  : "border-gray-300 bg-white"
            }`}
            value={String(value ?? "")}
            onChange={onChange as any}
            onBlur={onBlur}
            placeholder={placeholder}
          />
          {children}
        </>
      )}

      {error && type !== "checkbox" && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
