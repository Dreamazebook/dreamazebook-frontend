import { memo } from 'react'
import Input from '@/app/components/common/Input'
import PasswordField from '@/app/components/common/PasswordField'

interface NameEmailPasswordFieldsProps {
  showName?: boolean
  name?: string
  onNameChange?: (value: string) => void
  email: string
  onEmailChange: (value: string) => void
  password: string
  onPasswordChange: (value: string) => void
  showPassword?: boolean
  onPasswordToggle?: () => void
  namePlaceholder?: string
  emailPlaceholder: string
  passwordPlaceholder: string
  nameLabel: string
  emailLabel: string
  passwordLabel: string
  /** Use the unified preview-like login styles */
  unifiedUI?: boolean
  inputWrapperStyle?: React.CSSProperties
  inputWrapperClassName?: string
  inputStyle?: React.CSSProperties
  inputClassName?: string
  labelClassName?: string
  hideRequiredMark?: boolean
}

export const NameEmailPasswordFields = memo(({
  showName = false,
  name = '',
  onNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  showPassword,
  onPasswordToggle,
  namePlaceholder = '',
  emailPlaceholder,
  passwordPlaceholder,
  nameLabel,
  emailLabel,
  passwordLabel,
  unifiedUI = false,
  inputWrapperStyle,
  inputWrapperClassName,
  inputStyle,
  inputClassName,
  labelClassName,
  hideRequiredMark = false,
}: NameEmailPasswordFieldsProps) => (
  <fieldset className={unifiedUI ? 'space-y-[12px]' : 'space-y-4'}>
    {showName && onNameChange && (
      <Input
        id="name"
        label={nameLabel}
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={namePlaceholder}
        required
        wrapperStyle={inputWrapperStyle}
        wrapperClassName={inputWrapperClassName}
        inputStyle={inputStyle}
        inputClassName={inputClassName}
        labelClassName={labelClassName}
        hideRequiredMark={hideRequiredMark}
      />
    )}

    <Input
      id="email"
      label={emailLabel}
      type="email"
      value={email}
      onChange={(e) => onEmailChange(e.target.value)}
      placeholder={emailPlaceholder}
      required
      wrapperStyle={inputWrapperStyle}
      wrapperClassName={inputWrapperClassName}
      inputStyle={inputStyle}
      inputClassName={inputClassName}
      labelClassName={labelClassName}
      hideRequiredMark={hideRequiredMark}
    />

    <PasswordField
      id="password"
      label={passwordLabel}
      value={password}
      onChange={(e) => onPasswordChange(e.target.value)}
      placeholder={passwordPlaceholder}
      required
      showPassword={showPassword}
      onPasswordToggle={onPasswordToggle}
      unifiedUI={unifiedUI}
      inputWrapperStyle={inputWrapperStyle}
      inputWrapperClassName={inputWrapperClassName}
      inputStyle={inputStyle}
      inputClassName={inputClassName}
      labelClassName={labelClassName}
      hideRequiredMark={hideRequiredMark}
    />
  </fieldset>
))

NameEmailPasswordFields.displayName = 'NameEmailPasswordFields'
