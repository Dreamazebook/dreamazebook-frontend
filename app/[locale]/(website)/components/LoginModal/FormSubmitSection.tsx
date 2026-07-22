import { memo, type CSSProperties } from 'react'
import Button from '@/app/components/Button'

interface BaseSubmitProps {
  loading: boolean
  errorMessage: string
  children?: React.ReactNode
  buttonClassName?: string
  buttonStyle?: CSSProperties
}

interface LoginSubmitProps extends BaseSubmitProps {
  buttonLabel: string
}

interface RegisterSubmitProps extends BaseSubmitProps {
  buttonLabel: string
}

interface ForgotPasswordSubmitProps extends BaseSubmitProps {
  resetSent: boolean
  successMessage?: string
  buttonLabel: string
}

interface CodeLoginSubmitProps extends BaseSubmitProps {
  codeSent: boolean
  countdown: number
  verifyButtonLabel: string
  sendButtonLabel: string
  onResendCode: () => void
  resendLabel: string
  resendCountdownLabel: string
  deliveryHint: string
  children?: React.ReactNode
}

// Login Mode Submit Section
export const LoginSubmitSection = memo(({ loading, errorMessage, buttonLabel, buttonClassName, buttonStyle, children }: LoginSubmitProps) => {
  return (
    <>
      <Button tl={buttonLabel} isLoading={loading} className={buttonClassName} style={buttonStyle} />
      {children}
    </>
  )
})
LoginSubmitSection.displayName = 'LoginSubmitSection'

// Register Mode Submit Section
export const RegisterSubmitSection = memo(({ loading, errorMessage, buttonLabel, buttonClassName, buttonStyle, children }: RegisterSubmitProps) => {
  return (
    <>
      <Button tl={buttonLabel} isLoading={loading} className={buttonClassName} style={buttonStyle} />
      {children}
    </>
  )
})
RegisterSubmitSection.displayName = 'RegisterSubmitSection'

// Forgot Password Mode Submit Section
export const ForgotPasswordSubmitSection = memo(({ 
  loading, 
  errorMessage, 
  resetSent, 
  successMessage, 
  buttonLabel,
  buttonClassName,
  buttonStyle,
  children 
}: ForgotPasswordSubmitProps) => {
  return (
    <>
      {resetSent ? (
        <SuccessAlert message={successMessage} />
      ) : (
        <Button tl={buttonLabel} isLoading={loading} className={buttonClassName} style={buttonStyle} />
      )}
      {children}
    </>
  )
})
ForgotPasswordSubmitSection.displayName = 'ForgotPasswordSubmitSection'

// Code Login Mode Submit Section
export const CodeLoginSubmitSection = memo(({
  loading,
  errorMessage,
  codeSent,
  countdown,
  verifyButtonLabel,
  sendButtonLabel,
  onResendCode,
  resendLabel,
  resendCountdownLabel,
  deliveryHint,
  buttonClassName,
  buttonStyle,
  children,
}: CodeLoginSubmitProps) => {
  return (
    <>
      {codeSent ? (
        <>
          <Button tl={verifyButtonLabel} isLoading={loading} className={buttonClassName} style={buttonStyle} />
          <div className="text-center text-sm">
            {countdown > 0 ? (
              <button
                type="button"
                disabled
                className="text-gray-500 disabled:cursor-not-allowed"
              >
                {resendCountdownLabel.replace('{seconds}', String(countdown))}
              </button>
            ) : (
              <button
                type="button"
                onClick={onResendCode}
                disabled={loading}
                className="cursor-pointer text-[#1BA7FF] transition-colors hover:text-[#1689E6] focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Sending...' : resendLabel}
              </button>
            )}
          </div>
          <p className="text-center text-[13px] leading-[18px] text-[#666666]">
            {deliveryHint}
          </p>
        </>
      ) : (
        <Button tl={sendButtonLabel} isLoading={loading} className={buttonClassName} style={buttonStyle} />
      )}
      {children}
    </>
  )
})
CodeLoginSubmitSection.displayName = 'CodeLoginSubmitSection'

// Success Alert Component
const SuccessAlert = memo(({ message }: { message?: string }) => {
  if (!message) return null
  return (
    <div
      className="bg-green-50 p-3 rounded-md text-green-700 border border-green-200"
      role="status"
      aria-live="polite"
    >
      <p>{message}</p>
    </div>
  )
})
SuccessAlert.displayName = 'SuccessAlert'

// Legacy component for backward compatibility (optional, can be removed)
interface FormSubmitSectionProps {
  mode: 'login' | 'register' | 'forgotPassword' | 'codeLogin' | 'verifyCode'
  loading: boolean
  resetSent: boolean
  codeSent: boolean
  countdown: number
  errorMessage: string
  successMessage?: string
  buttonLabel: string
  onResendCode: () => void
  children?: React.ReactNode
}

export const FormSubmitSection = memo(({
  mode,
  loading,
  resetSent,
  codeSent,
  countdown,
  errorMessage,
  successMessage,
  buttonLabel,
  onResendCode,
  children,
}: FormSubmitSectionProps) => {
  switch (mode) {
    case 'login':
      return <LoginSubmitSection loading={loading} errorMessage={errorMessage} buttonLabel={buttonLabel}>{children}</LoginSubmitSection>
    case 'register':
      return <RegisterSubmitSection loading={loading} errorMessage={errorMessage} buttonLabel={buttonLabel}>{children}</RegisterSubmitSection>
    case 'forgotPassword':
      return (
        <ForgotPasswordSubmitSection
          loading={loading}
          errorMessage={errorMessage}
          resetSent={resetSent}
          successMessage={successMessage}
          buttonLabel={buttonLabel}
        >
          {children}
        </ForgotPasswordSubmitSection>
      )
    case 'codeLogin':
      return (
        <CodeLoginSubmitSection
          loading={loading}
          errorMessage={errorMessage}
          codeSent={false}
          countdown={0}
          verifyButtonLabel=""
          sendButtonLabel={buttonLabel}
          onResendCode={onResendCode}
          resendLabel="Resend"
          resendCountdownLabel="Resend in {seconds}s"
          deliveryHint=""
        >
          {children}
        </CodeLoginSubmitSection>
      )
    case 'verifyCode':
      return (
        <CodeLoginSubmitSection
          loading={loading}
          errorMessage={errorMessage}
          codeSent={true}
          countdown={countdown}
          verifyButtonLabel={buttonLabel}
          sendButtonLabel=""
          onResendCode={onResendCode}
          resendLabel="Resend"
          resendCountdownLabel="Resend in {seconds}s"
          deliveryHint=""
        >
          {children}
        </CodeLoginSubmitSection>
      )
    default:
      return null
  }
})

FormSubmitSection.displayName = 'FormSubmitSection'
