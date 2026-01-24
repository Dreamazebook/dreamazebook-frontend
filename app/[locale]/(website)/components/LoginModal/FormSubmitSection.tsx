import { memo } from 'react'
import Button from '@/app/components/Button'

interface FormSubmitSectionProps {
  mode: 'login' | 'register' | 'forgotPassword' | 'codeLogin'
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
  return (
    <>
      {errorMessage && (
        <div
          className="bg-red-50 p-3 rounded-md text-red-700 border border-red-200"
          role="alert"
          aria-live="polite"
        >
          <p>{errorMessage}</p>
        </div>
      )}

      {mode === 'forgotPassword' && resetSent ? (
        <div
          className="bg-green-50 p-3 rounded-md text-green-700 border border-green-200"
          role="status"
          aria-live="polite"
        >
          <p>{successMessage}</p>
        </div>
      ) : mode === 'codeLogin' && codeSent ? (
        <>
          <Button tl={buttonLabel} isLoading={loading} />
          <div className="text-center text-sm">
            {countdown > 0 ? (
              <span className="text-gray-500">Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={onResendCode}
                className="cursor-pointer text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
              >
                Resend code
              </button>
            )}
          </div>
        </>
      ) : (
        <Button tl={buttonLabel} isLoading={loading} />
      )}

      {children}
    </>
  )
})

FormSubmitSection.displayName = 'FormSubmitSection'
