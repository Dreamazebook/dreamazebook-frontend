import { memo, type CSSProperties, type ReactNode } from 'react'
import { LoginLinks, RegisterLinks, ForgotPasswordLinks, CodeLoginEmailLinks, CodeLoginCodeLinks } from './ModeToggleLinks'
import { LoginSubmitSection, RegisterSubmitSection, ForgotPasswordSubmitSection, CodeLoginSubmitSection } from './FormSubmitSection'
import { OAuthButtons } from './OAuthButtons'
import type { LoginMode } from './useLoginState'

interface FormSubmitSectionsProps {
  mode: LoginMode
  loading: boolean
  errorMessage: string
  resetSent: boolean
  successMessage: string
  countdown: number
  buttonLabel: string
  onModeChange: (newMode: LoginMode) => void
  onResetCodeFlow: () => void
  onSendLoginCode: (email: string) => void
  googleLoading: boolean
  facebookLoading: boolean
  onGoogleLogin: ((...args: any[]) => any) | (() => void)
  onFacebookLogin: () => void
  onGoogleCredential?: (credential: string) => any
  translations: {
    forgotPasswordQuestion: string
    loginWithCode: string
    haveAccount: string
    login: string
    backToLogin: string
    returnToLogin: string
    usePasswordInstead: string
    changeEmail: string
    orContinueWith: string
  }
  email: string
  /** Use the unified preview-like login styles */
  unifiedUI?: boolean
  buttonClassName?: string
  buttonStyle?: CSSProperties
  /** Full-width OAuth row for mobile bottom sheet */
  fluid?: boolean
  /** 渲染在 OAuth 按钮下方（如 preview 非创建者引导） */
  oauthFooter?: ReactNode
  /** 隐藏验证码登录中的密码登录入口 */
  hidePasswordLogin?: boolean
}

export const FormSubmitSections = memo(({
  mode,
  loading,
  errorMessage,
  resetSent,
  successMessage,
  countdown,
  buttonLabel,
  onModeChange,
  onResetCodeFlow,
  onSendLoginCode,
  googleLoading,
  facebookLoading,
  onGoogleLogin,
  onFacebookLogin,
  onGoogleCredential,
  translations,
  email,
  unifiedUI = false,
  buttonClassName,
  buttonStyle,
  fluid = false,
  oauthFooter,
  hidePasswordLogin = false,
}: FormSubmitSectionsProps) => {
  const oauthVariant = unifiedUI ? ('labeled' as const) : ('default' as const)
  return (
    <>
      {/* Login Mode */}
      {mode === 'login' && (
        <LoginSubmitSection
          loading={loading}
          errorMessage={errorMessage}
          buttonLabel={buttonLabel}
          buttonClassName={buttonClassName}
          buttonStyle={buttonStyle}
        >
          <div className="flex flex-col gap-2">
            <LoginLinks
              onForgotPassword={() => onModeChange('forgotPassword')}
              onCodeLogin={() => onModeChange('codeLogin')}
              translations={{
                forgotPasswordQuestion: translations.forgotPasswordQuestion,
                loginWithCode: translations.loginWithCode,
              }}
            />
            <OAuthButtons
              googleLoading={googleLoading}
              facebookLoading={facebookLoading}
              onGoogleClick={onGoogleLogin}
              onFacebookClick={onFacebookLogin}
              onGoogleCredential={onGoogleCredential}
              label={translations.orContinueWith}
              variant={oauthVariant}
              fluid={fluid}
            />
          </div>
        </LoginSubmitSection>
      )}

      {/* Register Mode */}
      {mode === 'register' && (
        <RegisterSubmitSection
          loading={loading}
          errorMessage={errorMessage}
          buttonLabel={buttonLabel}
          buttonClassName={buttonClassName}
          buttonStyle={buttonStyle}
        >
          <RegisterLinks
            onLogin={() => onModeChange('login')}
            translations={{
              haveAccount: translations.haveAccount,
              login: translations.login,
            }}
          />
          <OAuthButtons
            googleLoading={googleLoading}
            facebookLoading={facebookLoading}
            onGoogleClick={onGoogleLogin}
            onFacebookClick={onFacebookLogin}
            onGoogleCredential={onGoogleCredential}
            label={translations.orContinueWith}
            variant={oauthVariant}
            fluid={fluid}
          />
        </RegisterSubmitSection>
      )}

      {/* Forgot Password Mode */}
      {mode === 'forgotPassword' && (
        <ForgotPasswordSubmitSection
          loading={loading}
          errorMessage={errorMessage}
          resetSent={resetSent}
          successMessage={successMessage}
          buttonLabel={buttonLabel}
          buttonClassName={buttonClassName}
          buttonStyle={buttonStyle}
        >
          <ForgotPasswordLinks
            onLogin={() => onModeChange('codeLogin')}
            translations={{
              loginWithCode: translations.loginWithCode,
            }}
          />
          <OAuthButtons
            googleLoading={googleLoading}
            facebookLoading={facebookLoading}
            onGoogleClick={onGoogleLogin}
            onFacebookClick={onFacebookLogin}
            onGoogleCredential={onGoogleCredential}
            label={translations.orContinueWith}
            variant={oauthVariant}
            fluid={fluid}
          />
        </ForgotPasswordSubmitSection>
      )}

      {/* Code Login Mode - Email Input */}
      {mode === 'codeLogin' && (
        <CodeLoginSubmitSection
          loading={loading}
          errorMessage={errorMessage}
          codeSent={false}
          countdown={0}
          verifyButtonLabel=""
          sendButtonLabel={buttonLabel}
          onResendCode={() => onSendLoginCode(email)}
          buttonClassName={buttonClassName}
          buttonStyle={buttonStyle}
        >
          {!hidePasswordLogin && (
            <CodeLoginEmailLinks
              onLogin={() => onModeChange('login')}
              translations={{
                usePasswordInstead: translations.usePasswordInstead,
              }}
            />
          )}
          <OAuthButtons
            googleLoading={googleLoading}
            facebookLoading={facebookLoading}
            onGoogleClick={onGoogleLogin}
            onFacebookClick={onFacebookLogin}
            onGoogleCredential={onGoogleCredential}
            label={translations.orContinueWith}
            variant={oauthVariant}
            fluid={fluid}
          />
          {oauthFooter}
        </CodeLoginSubmitSection>
      )}

      {/* Verify Code Mode - Code Input */}
      {mode === 'verifyCode' && (
        <CodeLoginSubmitSection
          loading={loading}
          errorMessage={errorMessage}
          codeSent={true}
          countdown={countdown}
          verifyButtonLabel={buttonLabel}
          sendButtonLabel=""
          onResendCode={() => onSendLoginCode(email)}
          buttonClassName={buttonClassName}
          buttonStyle={buttonStyle}
        >
          <CodeLoginCodeLinks
            onChangeEmail={onResetCodeFlow}
            translations={{
              changeEmail: translations.changeEmail,
            }}
          />
        </CodeLoginSubmitSection>
      )}
    </>
  )
})

FormSubmitSections.displayName = 'FormSubmitSections'
