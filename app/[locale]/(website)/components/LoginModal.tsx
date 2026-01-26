'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import useUserStore from '@/stores/userStore'
import Input from '@/app/components/common/Input'
import { OAUTH_REDIRECT } from '@/constants/api'
import { useLoginState, type LoginMode } from './LoginModal/useLoginState'
import { OAuthButtons } from './LoginModal/OAuthButtons'
import { NameEmailPasswordFields } from './LoginModal/NameEmailPasswordFields'
import { CodeInputField } from './LoginModal/CodeInputField'
import { ErrorAlert, SuccessAlert } from './LoginModal/Alerts'
import { ModeToggleLinks } from './LoginModal/ModeToggleLinks'
import { ModalHeader, CloseButton } from './LoginModal/ModalHeader'
import { FormSubmitSection } from './LoginModal/FormSubmitSection'

export default function LoginModal({ showCloseButton = false, title = 'Welcome to Dreamaze' }: { showCloseButton?: boolean, title?: string }) {
  const t = useTranslations('LoginModal')
  const { state, updateState, setField, resetMessages, resetCodeFlow } = useLoginState()
  const {
    closeLoginModal,
    register,
    login,
    loginAdmin,
    sendResetPasswordLink,
    checkKickstarterStatus,
    sendLoginCode,
    verifyLoginCode,
  } = useUserStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Setup redirect on mode change
  useEffect(() => {
    resetMessages()
    const urlRedirect = searchParams.get('redirect')
    if (urlRedirect) {
      localStorage.setItem('redirectUrl', urlRedirect)
    }
  }, [state.mode, resetMessages, searchParams])

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (state.countdown > 0) {
      timer = setInterval(() => {
        setField('countdown', (prev:number) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [state.countdown, setField])

  // Auto-submit when code reaches 6 digits
  useEffect(() => {
    if (state.code.length === 6 && state.mode === 'codeLogin' && state.codeSent) {
      const submitForm = async () => {
        setField('loading', true)
        updateState({ errorMessage: '', successMessage: '' })
        await handleVerifyLoginCode(state.email, state.code)
        setField('loading', false)
      }
      submitForm()
    }
  }, [state.code, state.mode, state.codeSent])

  // Helper: Get title based on mode
  const getTitleByMode = (): string => {
    switch (state.mode) {
      case 'login':
        return t('login')
      case 'register':
        return t('register')
      case 'forgotPassword':
        return t('forgotPassword')
      case 'codeLogin':
        return title;
      default:
        return title;
    }
  }

  // Helper: Get button label based on mode
  const getButtonLabelByMode = (): string => {
    if (state.mode === 'codeLogin' && state.codeSent) return t('verifyCode')
    if (state.mode === 'codeLogin') return t('sendCode')
    if (state.mode === 'forgotPassword') return t('sendResetLink')
    if (state.mode === 'register') return t('register')
    return t('login')
  }

  // OAuth handlers
  const handlePostLoginRedirect = (defaultPath = '/') => {
    closeLoginModal()
    const urlRedirect = localStorage.getItem('redirectUrl')
    if (urlRedirect) {
      localStorage.removeItem('redirectUrl')
      router.push(urlRedirect)
    } else {
      router.push(defaultPath)
    }
  }

  const fetchOAuthRedirect = async (provider: string) => {
    try {
      const res = await fetch(OAUTH_REDIRECT(provider), { method: 'GET', credentials: 'include' })
      if (!res.ok) return null
      const json = await res.json()
      localStorage.setItem('oauthProvider', provider)
      return json.redirect_url ?? json.url ?? null
    } catch (e) {
      console.error('fetchOAuthRedirect error', e)
      return null
    }
  }

  const startOAuth = async (provider: string, loaderField: 'googleLoading' | 'facebookLoading') => {
    setField(loaderField, true)
    updateState({ errorMessage: '' })
    try {
      const url = await fetchOAuthRedirect(provider)
      if (url) {
        window.location.href = url
      } else {
        updateState({ errorMessage: t(`${provider.toLowerCase()}OAuthError`) })
      }
    } catch (err) {
      console.error(`${provider} login error:`, err)
      updateState({ errorMessage: t(`${provider.toLowerCase()}LoginError`) })
    } finally {
      setField(loaderField, false)
    }
  }

  const handleGoogleLogin = () => startOAuth('google', 'googleLoading')
  const handleFacebookLogin = () => startOAuth('facebook', 'facebookLoading')

  // Form handlers
  const handleForgotPassword = async (email: string) => {
    const success = await sendResetPasswordLink(email)
    updateState({ resetSent: success })
    if (!success) {
      updateState({ errorMessage: t('resetPasswordFailed') })
    }
  }

  const handleSendLoginCode = async (email: string) => {
    const response = await sendLoginCode(email)
    updateState({ codeSent: response.success })
    if (response.success) {
      updateState({
        successMessage: `We've sent a 6 digit code to ${email}. It expires in 10 minutes.`,
        countdown: 60,
        errorMessage: '',
      })
    } else {
      updateState({
        errorMessage: response.message || t('sendCodeFailed'),
        successMessage: '',
      })
    }
  }

  const handleVerifyLoginCode = async (email: string, code: string) => {
    const response = await verifyLoginCode(email, code)
    if (response?.success) {
      checkKickstarterStatus()
      handlePostLoginRedirect()
      return true
    } else {
      updateState({ errorMessage: t('verifyCodeFailed') })
      return false
    }
  }

  const handleLogin = async (email: string, password: string) => {
    if (email.includes('admin')) {
      const response = await loginAdmin({ email, password })
      if (response?.success) {
        closeLoginModal()
        handlePostLoginRedirect('/admin')
        return true
      }
    }

    const response = await login({ email, password })
    if (response?.success) {
      checkKickstarterStatus()
      handlePostLoginRedirect()
      return true
    } else {
      updateState({ errorMessage: t('loginFailed') })
      return false
    }
  }

  const handleRegister = async (name: string, email: string, password: string) => {
    const response = await register({
      name,
      email,
      password,
      password_confirmation: password,
    })
    if (response?.success) {
      handlePostLoginRedirect()
      return true
    } else {
      updateState({ errorMessage: t('registrationFailed') })
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setField('loading', true)
    updateState({ errorMessage: '', successMessage: '' })

    try {
      if (state.mode === 'forgotPassword') {
        await handleForgotPassword(state.email)
      } else if (state.mode === 'codeLogin' && !state.codeSent) {
        await handleSendLoginCode(state.email)
      } else if (state.mode === 'codeLogin' && state.codeSent) {
        await handleVerifyLoginCode(state.email, state.code)
      } else if (state.mode === 'login') {
        await handleLogin(state.email, state.password)
      } else if (state.mode === 'register') {
        await handleRegister(state.name, state.email, state.password)
      }
    } finally {
      setField('loading', false)
    }
  }

  const handleModeChange = (newMode: LoginMode) => {
    setField('mode', newMode)
    if (newMode === 'codeLogin') {
      setField('codeSent', false)
      setField('code', '')
    }
  }

  const renderFormContent = () => {
    if (state.mode === 'register') {
      return (
        <NameEmailPasswordFields
          showName
          name={state.name}
          onNameChange={(value) => setField('name', value)}
          email={state.email}
          onEmailChange={(value) => setField('email', value)}
          showPassword={state.showPassword}
          password={state.password}
          onPasswordChange={(value) => setField('password', value)}
          onPasswordToggle={() => setField('showPassword', !state.showPassword)}
          nameLabel={t('name')}
          emailLabel={t('email')}
          passwordLabel={t('password')}
          namePlaceholder={t('namePlaceholder')}
          emailPlaceholder={t('emailPlaceholder')}
          passwordPlaceholder={t('passwordPlaceholder')}
        />
      )
    }

    if (state.mode === 'login') {
      return (
        <NameEmailPasswordFields
          email={state.email}
          onEmailChange={(value) => setField('email', value)}
          showPassword={state.showPassword}
          password={state.password}
          onPasswordChange={(value) => setField('password', value)}
          onPasswordToggle={() => setField('showPassword', !state.showPassword)}
          emailLabel={t('email')}
          passwordLabel={t('password')}
          emailPlaceholder={t('emailPlaceholder')}
          passwordPlaceholder={t('passwordPlaceholder')}
          nameLabel={t('name')}
        />
      )
    }

    if (state.mode === 'forgotPassword') {
      return (
        <fieldset className="space-y-4">
          <Input
            id="email"
            label={t('email')}
            type="email"
            value={state.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder={t('emailPlaceholder')}
            required
          />
        </fieldset>
      )
    }

    if (state.mode === 'codeLogin' && !state.codeSent) {
      return (
        <fieldset className="space-y-4">
          <Input
            id="email"
            label={t('email')}
            type="email"
            value={state.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder={t('emailPlaceholder')}
            required
          />
        </fieldset>
      )
    }

    if (state.mode === 'codeLogin' && state.codeSent) {
      return (
        <CodeInputField
          code={state.code}
          onCodeChange={(value) => setField('code', value)}
          successMessage={state.successMessage}
        />
      )
    }

    return null
  }

  return (
    <main className="flex flex-col items-center justify-center bg-white rounded-lg p-4 w-96 gap-4 relative" role="main">
      {showCloseButton && <CloseButton onClose={closeLoginModal} />}

      <ModalHeader
        title={getTitleByMode()}
        showBackButton={state.mode === 'codeLogin' && state.codeSent}
        onBackClick={resetCodeFlow}
      />

      <form onSubmit={handleSubmit} className="space-y-4 text-[#222222] w-full" noValidate>
        {renderFormContent()}

        <FormSubmitSection
          mode={state.mode}
          loading={state.loading}
          resetSent={state.resetSent}
          codeSent={state.codeSent}
          countdown={state.countdown}
          errorMessage={state.errorMessage}
          successMessage={state.successMessage}
          buttonLabel={getButtonLabelByMode()}
          onResendCode={() => handleSendLoginCode(state.email)}
        >
          <>
            <ModeToggleLinks
              mode={state.mode}
              resetSent={state.resetSent}
              codeSent={state.codeSent}
              onModeChange={handleModeChange}
              onCodeFlowReset={resetCodeFlow}
              translations={{
                forgotPasswordQuestion: t('forgotPasswordQuestion'),
                backToLogin: t('backToLogin'),
                login: t('login'),
                haveAccount: t('haveAccount'),
                changeEmail: t('changeEmail'),
                usePasswordInstead: 'Use password instead',
              }}
            />

            {state.mode === 'login' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleModeChange('codeLogin')}
                  className="cursor-pointer text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
                >
                  <span>{t('loginWithCode')}</span>
                </button>
              </div>
            )}

            <OAuthButtons
              googleLoading={state.googleLoading}
              facebookLoading={state.facebookLoading}
              onGoogleClick={handleGoogleLogin}
              onFacebookClick={handleFacebookLogin}
              label={t('orContinueWith')}
            />
          </>
        </FormSubmitSection>
      </form>
    </main>
  )
}
