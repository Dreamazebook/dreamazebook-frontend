import { memo, useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            ux_mode?: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (element: HTMLElement, options: {
            type: string
            theme: string
            size: string
          }) => void
          prompt: () => void
        }
      }
    }
  }
}

interface OAuthButtonsProps {
  googleLoading: boolean
  facebookLoading: boolean
  onGoogleClick?: (...args: any[]) => any
  onFacebookClick: () => void
  label: string
  variant?: 'default' | 'labeled'
  /** Full-width layout for mobile bottom sheet */
  fluid?: boolean
  /** Called with the Google credential (ID token) for popup login flow */
  onGoogleCredential?: (credential: string) => void
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

/** Renders a Google Identity Services popup button using the standard GIS UI */
const GooglePopupButton = memo(({
  disabled,
  onCredential,
  variant,
}: {
  disabled: boolean
  onCredential: (credential: string) => any
  variant: 'default' | 'labeled'
}) => {
  const buttonRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  const initGis = useCallback(() => {
    if (initialized.current || !buttonRef.current || !GOOGLE_CLIENT_ID) return
    initialized.current = true

    window.google?.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      ux_mode: 'popup',
      callback: (response: { credential: string }) => {
        onCredential(response.credential)
      },
    })

    window.google?.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
    })
  }, [onCredential])

  useEffect(() => {
    // GIS script may already be loaded
    if (window.google?.accounts) {
      initGis()
    } else {
      // Poll for GIS availability (script loads async)
      const interval = setInterval(() => {
        if (window.google?.accounts) {
          clearInterval(interval)
          initGis()
        }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [initGis])

  // If GOOGLE_CLIENT_ID is not set, fall back to a regular icon button
  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled={disabled}
        className="flex h-full flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#E0E0E0] bg-white px-4 text-sm font-normal text-[#222222] transition-colors hover:bg-gray-50 disabled:opacity-50"
        aria-label="Login with Google"
      >
        <GoogleIcon />
        {variant === 'labeled' && 'Google'}
      </button>
    )
  }

  if (variant === 'labeled') {
    return (
      <div
        ref={buttonRef}
        className="flex h-full flex-1 items-center justify-center"
        style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
      />
    )
  }

  return (
    <div
      ref={buttonRef}
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
    />
  )
})

GooglePopupButton.displayName = 'GooglePopupButton'

export const OAuthButtons = memo(({
  googleLoading,
  facebookLoading,
  onGoogleClick,
  onFacebookClick,
  label,
  variant = 'default',
  fluid = false,
  onGoogleCredential,
}: OAuthButtonsProps) => {
  if (variant === 'labeled') {
    return (
      <div>
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-[#E0E0E0]" />
          <span className="mx-4 shrink-0 text-sm text-[#999999]">{label}</span>
          <div className="flex-grow border-t border-[#E0E0E0]" />
        </div>
        <div
          className="mt-[12px] flex gap-[8px] opacity-80"
          style={{ width: fluid ? '100%' : 312, height: 40, boxSizing: 'border-box' }}
        >
          {/* <button
            type="button"
            onClick={onFacebookClick}
            disabled={facebookLoading}
            className="flex h-full flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#E0E0E0] bg-white px-4 text-sm font-normal text-[#222222] transition-colors hover:bg-gray-50 disabled:opacity-50"
            aria-label="Login with Facebook"
          >
            <FacebookIcon />
            Facebook
          </button> */}
          <GooglePopupButton
            disabled={googleLoading}
            onCredential={onGoogleCredential ?? (() => {})}
            variant="labeled"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="pt-2 border-t border-gray-200">
      <p className="text-sm text-gray-600 text-center mb-3">{label}</p>
      <div className="flex items-center justify-center gap-[24px]">
        <GooglePopupButton
          disabled={googleLoading}
          onCredential={onGoogleCredential ?? (() => {})}
          variant="default"
        />
        {/* <button
          type="button"
          onClick={onFacebookClick}
          disabled={facebookLoading}
          className="cursor-pointer hover:bg-gray-50 disabled:opacity-50 transition-colors"
          aria-label="Login with Facebook"
        >
          <FacebookIcon />
        </button> */}
      </div>
    </div>
  )
})

OAuthButtons.displayName = 'OAuthButtons'
