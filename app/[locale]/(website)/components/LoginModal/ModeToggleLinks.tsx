import { memo } from 'react'
import { LoginMode } from './useLoginState'

interface LinkButtonProps {
  label: string
  onClick: () => void
}

const LinkButton = memo(({ label, onClick }: LinkButtonProps) => (
  <button
    type="button"
    className="cursor-pointer text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
    onClick={onClick}
  >
    {label}
  </button>
))

LinkButton.displayName = 'LinkButton'

interface ModeToggleLinksProps {
  mode: LoginMode
  resetSent: boolean
  codeSent: boolean
  onModeChange: (mode: LoginMode) => void
  onCodeFlowReset: () => void
  translations: {
    forgotPasswordQuestion: string
    backToLogin: string
    login: string
    haveAccount: string
    changeEmail: string
    usePasswordInstead: string
  }
}

export const ModeToggleLinks = memo(({
  mode,
  resetSent,
  codeSent,
  onModeChange,
  onCodeFlowReset,
  translations,
}: ModeToggleLinksProps) => {
  if (mode === 'login' && !resetSent) {
    return (
      <div className="flex flex-col space-y-2 text-sm">
        <LinkButton
          label={translations.forgotPasswordQuestion}
          onClick={() => onModeChange('forgotPassword')}
        />
      </div>
    )
  }

  if (mode === 'register') {
    return (
      <div className="text-sm">
        <span>
          {translations.haveAccount}{' '}
          <LinkButton label={translations.login} onClick={() => onModeChange('login')} />
        </span>
      </div>
    )
  }

  if (mode === 'forgotPassword' && !resetSent) {
    return (
      <div className="text-sm">
        <LinkButton label={translations.backToLogin} onClick={() => onModeChange('login')} />
      </div>
    )
  }

  if (mode === 'codeLogin' && !codeSent) {
    return (
      <div className="text-sm text-center">
        <LinkButton
          label={translations.usePasswordInstead}
          onClick={() => onModeChange('login')}
        />
      </div>
    )
  }

  if (mode === 'codeLogin' && codeSent) {
    return (
      <div className="text-sm">
        <LinkButton label={translations.changeEmail} onClick={onCodeFlowReset} />
      </div>
    )
  }

  return null
})

ModeToggleLinks.displayName = 'ModeToggleLinks'
