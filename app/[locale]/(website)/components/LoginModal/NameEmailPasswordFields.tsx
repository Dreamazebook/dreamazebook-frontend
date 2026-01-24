import { memo } from 'react'
import Input from '@/app/components/common/Input'
import { PasswordToggleButton } from './PasswordToggleButton'

interface NameEmailPasswordFieldsProps {
  showName?: boolean
  name?: string
  onNameChange?: (value: string) => void
  email: string
  onEmailChange: (value: string) => void
  showPassword: boolean
  password: string
  onPasswordChange: (value: string) => void
  onPasswordToggle: () => void
  namePlaceholder?: string
  emailPlaceholder: string
  passwordPlaceholder: string
  nameLabel: string
  emailLabel: string
  passwordLabel: string
}

export const NameEmailPasswordFields = memo(({
  showName = false,
  name = '',
  onNameChange,
  email,
  onEmailChange,
  showPassword,
  password,
  onPasswordChange,
  onPasswordToggle,
  namePlaceholder = '',
  emailPlaceholder,
  passwordPlaceholder,
  nameLabel,
  emailLabel,
  passwordLabel,
}: NameEmailPasswordFieldsProps) => (
  <fieldset className="space-y-4">
    {showName && onNameChange && (
      <Input
        id="name"
        label={nameLabel}
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={namePlaceholder}
        required
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
    />

    <div className="relative">
      <Input
        id="password"
        label={passwordLabel}
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        placeholder={passwordPlaceholder}
        required
      />
      <PasswordToggleButton showPassword={showPassword} onToggle={onPasswordToggle} />
    </div>
  </fieldset>
))

NameEmailPasswordFields.displayName = 'NameEmailPasswordFields'
