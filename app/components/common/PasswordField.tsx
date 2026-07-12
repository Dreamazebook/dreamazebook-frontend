'use client';

import React, { useState } from 'react';
import Input from './Input';
import { PasswordToggleButton } from './PasswordToggleButton';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showPassword?: boolean;
  onPasswordToggle?: () => void;
  unifiedUI?: boolean
  inputWrapperStyle?: React.CSSProperties
  inputWrapperClassName?: string
  inputStyle?: React.CSSProperties
  inputClassName?: string
  labelClassName?: string
  hideRequiredMark?: boolean
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  showPassword: externalShowPassword,
  onPasswordToggle: externalOnToggle,
  unifiedUI = false,
  inputWrapperStyle,
  inputWrapperClassName,
  inputStyle,
  inputClassName,
  labelClassName,
  hideRequiredMark = false,
}) => {
  const [internalShowPassword, setInternalShowPassword] = useState(false);

  const showPassword = externalShowPassword !== undefined ? externalShowPassword : internalShowPassword;
  const onToggle = externalOnToggle || (() => setInternalShowPassword(!internalShowPassword));

  return (
    <div className="relative">
      <Input
        id={id}
        label={label}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange as any}
        placeholder={placeholder}
        required={required}
        error={error}
        wrapperStyle={inputWrapperStyle}
        wrapperClassName={inputWrapperClassName}
        inputStyle={inputStyle}
        inputClassName={inputClassName}
        labelClassName={labelClassName}
        hideRequiredMark={hideRequiredMark}
      />
      <PasswordToggleButton
        showPassword={showPassword}
        onToggle={onToggle}
        className={
          unifiedUI
            ? 'absolute right-4 top-[32px] cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none'
            : undefined
        }
      />
    </div>
  );
};

export default PasswordField;