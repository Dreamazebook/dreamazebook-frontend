'use client'

import { useEffect, useState } from 'react'
import { Link, useRouter, usePathname } from '@/i18n/routing'
import { toRouterPath } from '@/utils/localePath'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import useUserStore from '@/stores/userStore'
import Input from '@/app/components/common/Input'
import { OAUTH_REDIRECT } from '@/constants/api'
import { fetchIpInfo, storeIpGeoInfo } from '@/utils/ipGeo'
import { useLoginState, type LoginMode } from './LoginModal/useLoginState'
import { NameEmailPasswordFields } from './LoginModal/NameEmailPasswordFields'
import { CodeInputField } from './LoginModal/CodeInputField'
import { ModalHeader, CloseButton } from './LoginModal/ModalHeader'
import { FormSubmitSections } from './LoginModal/FormSubmitSections'
import { GoogleIcon } from './LoginModal/OAuthButtons'
import { ErrorAlert } from './LoginModal/Alerts'
import { Gift, Mail, Sparkles, Zap } from 'lucide-react'
import api from '@/utils/api'
import { ApiResponse } from '@/types/api'
import { readGuestSessionId, writeGuestSessionId } from '@/utils/api'

export default function LoginModal({
  showCloseButton = false,
  title = 'Welcome to Dreamaze',
  description = 'Sign in to access your account',
  footerNote,
  sendCodeButtonLabel,
  useRedirect = true,
  layout = 'modal',
}: {
  showCloseButton?: boolean
  useRedirect?: boolean
  title?: string
  description?: string
  footerNote?: string
  sendCodeButtonLabel?: string
  /** Mobile preview unlock uses antd bottom Drawer; desktop stays centered modal */
  layout?: 'modal' | 'bottomSheet'
}) {
  const t = useTranslations('LoginModal')
  const tPreview = useTranslations('Preview')
  const { state, updateState, setField, resetMessages, resetCodeFlow } = useLoginState()
  const {
    closeLoginModal,
    loginModalOptions,
    setLoginModalOptions,
    register,
    login,
    setLoginUserToken,
    sendResetPasswordLink,
    checkKickstarterStatus,
    sendLoginCode,
    verifyLoginCode,
  } = useUserStore()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isPreviewUnlock = loginModalOptions?.loginSource === 'preview_unlock'
  const isBottomSheet = layout === 'bottomSheet'
  const [showMobileUnlockLanding, setShowMobileUnlockLanding] = useState(true)
  // Unify ALL login UIs to match the preview unlock design.
  const unifiedUI = true
  const previewTitle = loginModalOptions?.title ?? tPreview('unlockFullBookTitle')
  const showNotCreatorPrompt = Boolean(
    isPreviewUnlock && loginModalOptions?.showNotCreatorPrompt && loginModalOptions?.personalizeHref,
  )
  const previewFooterNote = showNotCreatorPrompt
    ? undefined
    : (loginModalOptions?.footerNote ?? tPreview('unlockFullBookFooter'))
  const previewSendCodeLabel = loginModalOptions?.sendCodeButtonLabel ?? tPreview('continueWithEmailCode')
  const previewFieldWidth = isBottomSheet ? '100%' : 312
  const previewButtonStyle: React.CSSProperties = {
    width: previewFieldWidth,
    height: 36,
    paddingTop: 8,
    paddingRight: 12,
    paddingBottom: 8,
    paddingLeft: 12,
    boxSizing: 'border-box',
  }
  const previewButtonClassName =
    'gap-[10px] rounded-[4px] bg-[#222222] text-[14px] leading-[20px] tracking-[0.25px] font-normal text-white opacity-100'
  const previewEmailWrapperStyle: React.CSSProperties = {
    width: previewFieldWidth,
    boxSizing: 'border-box',
  }
  const previewEmailWrapperClassName = 'flex flex-col gap-[4px] opacity-100'
  const previewEmailInputStyle: React.CSSProperties = {
    width: previewFieldWidth,
    height: 36,
    paddingTop: 8,
    paddingRight: 16,
    paddingBottom: 8,
    paddingLeft: 16,
    boxSizing: 'border-box',
  }
  const previewEmailInputClassName =
    'shrink-0 rounded-[4px] border border-[#222222] opacity-100 text-[14px] leading-[20px] tracking-[0.25px] text-[#222]'
  const previewEmailLabelClassName = 'shrink-0 text-[14px] leading-[20px] tracking-[0.25px] text-[#222]'

  const getSuccessMessage = (): string => {
    if (state.mode === 'forgotPassword' && state.resetSent) {
      return t('resetPasswordSent')
    }
    return state.successMessage || ''
  }

  // Setup redirect on mode change
  useEffect(() => {
    resetMessages()
    const urlRedirect = searchParams.get('redirect')
    if (urlRedirect) {
      localStorage.setItem('redirectUrl', toRouterPath(urlRedirect))
    }
  }, [state.mode, resetMessages, searchParams])

  // Set login_source for redirect-based flows (login page, abandoned cart/preview emails)
  useEffect(() => {
    if (useRedirect && !loginModalOptions?.loginSource) {
      setLoginModalOptions({ loginSource: 'account_entry' })
    }
  }, [useRedirect, loginModalOptions?.loginSource, setLoginModalOptions])

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
    if (state.code.length === 6 && state.mode === 'verifyCode') {
      const submitForm = async () => {
        setField('loading', true)
        updateState({ errorMessage: '', successMessage: '' })
        await handleVerifyLoginCode(state.email, state.code)
        setField('loading', false)
      }
      submitForm()
    }
  }, [state.code, state.mode])

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
      case 'verifyCode':
        return isPreviewUnlock ? previewTitle : title;
      default:
        return title;
    }
  }

  const getDescriptionByMode = (): React.ReactNode => {
    switch (state.mode) {
      case 'login':
        return '';
      case 'register':
        return '';
      case 'forgotPassword':
        return "We'll email you a link to create a new password.";
      case 'codeLogin':
        if (isPreviewUnlock) {
          return (
            <>
              {tPreview('unlockFullBookDescriptionPrefix')}{' '}
              <strong className="font-semibold text-[#666666]">{tPreview('unlockFullBookDescriptionHighlight')}</strong>
            </>
          )
        }
        return description;
      case 'verifyCode':
        return `Enter the 6-digit code sent to ${state.email}`;
      default:
        return 'description';
    }
  }

  const headerDescription = getDescriptionByMode()
  const usePreviewHeaderLayout = Boolean(unifiedUI && headerDescription)
  const usePreviewMinHeight = isPreviewUnlock && state.mode === 'codeLogin'
  const needsFormScroll = state.mode === 'register'

  const previewModalStyle: React.CSSProperties = {
    width: isBottomSheet ? '100%' : 360,
    ...(usePreviewMinHeight && !isBottomSheet ? { minHeight: 416 } : {}),
    height: 'auto',
    boxSizing: 'border-box',
  }

  // Helper: Get button label based on mode
  const getButtonLabelByMode = (): string => {
    if (state.mode === 'verifyCode') return t('verifyCode')
    if (state.mode === 'codeLogin') {
      if (isPreviewUnlock) return previewSendCodeLabel
      return sendCodeButtonLabel || t('sendCode')
    }
    if (state.mode === 'forgotPassword') return t('sendResetLink')
    if (state.mode === 'register') return t('register')
    return t('login')
  }

  const runLoginSuccessCallback = () => {
    const callback = loginModalOptions?.onSuccess
    callback?.()
  }

  // OAuth handlers
  const handlePostLoginRedirect = (defaultPath = '/shopping-cart') => {
    if (!useRedirect) {
      runLoginSuccessCallback()
      closeLoginModal()
      return
    }
    const urlRedirect = localStorage.getItem('redirectUrl')
    if (urlRedirect) {
      localStorage.removeItem('redirectUrl')
      router.push(toRouterPath(urlRedirect))
    } else {
      router.push(defaultPath)
    }
  }

  const fetchOAuthRedirect = async (provider: string) => {
    try {
      const {url,success} = await api.get<any>(OAUTH_REDIRECT(provider))
      if (!success || !url) return null
      localStorage.setItem('oauthProvider', provider)
      return url;
    } catch (e) {
      console.error('fetchOAuthRedirect error', e)
      return null
    }
  }

  const startOAuth = async (provider: string, loaderField: 'googleLoading' | 'facebookLoading') => {
    setField(loaderField, true)
    updateState({ errorMessage: '' })
    try {
      // Fetch and persist IP/country before redirecting to OAuth provider,
      // so OAuthCallbackContent can pick them up from localStorage
      const ipInfo = await fetchIpInfo()
      if (ipInfo) {
        storeIpGeoInfo(ipInfo)
      }
      const url = await fetchOAuthRedirect(provider)
      if (url) {
        // Modal flows (e.g. preview unlock) keep the user on the current page after OAuth.
        // Persist in both storages: callback may clear localStorage.redirectUrl on a
        // re-run (Strict Mode / unstable onSuccess) and otherwise fall back to /shopping-cart.
        if (!useRedirect) {
          const query = searchParams.toString()
          const returnPath = query ? `${pathname}?${query}` : pathname
          localStorage.setItem('redirectUrl', returnPath)
          sessionStorage.setItem('oauthReturnUrl', returnPath)
          // Preview unlock (and any modal OAuth from /preview) must refetch full batch after return.
          if (
            loginModalOptions?.loginSource === 'preview_unlock' ||
            pathname.includes('/preview')
          ) {
            sessionStorage.setItem('previewPostLoginSync', '1')
          }
        }
        return window.location.href = url
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

  const handleGoogleCredentialLogin = async (credential: string) => {
    setField('googleLoading', true)
    updateState({ errorMessage: '' })
    try {
      const ipInfo = await fetchIpInfo()
      if (ipInfo) {
        storeIpGeoInfo(ipInfo)
      }

      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }

      const guestSessionId = readGuestSessionId()
      if (guestSessionId) {
        headers['X-Guest-Session-Id'] = guestSessionId
      }

      const response = await api.post<{success: boolean, message: string, user: any, token: string}>('/auth/google/credential', { credential }, { headers })

      const responseGuestSessionId = (response as any)?.headers?.['x-guest-session-id'] ||
        (response as any)?.headers?.['X-Guest-Session-Id']
      if (responseGuestSessionId) {
        writeGuestSessionId(responseGuestSessionId)
      }

      if (response.success) {
        setLoginUserToken({user: response.user, token: response.token});
        checkKickstarterStatus()
        handlePostLoginRedirect()
      } else {
        updateState({ errorMessage: response.message || t('googleLoginError') })
      }
    } catch (err) {
      console.error('Google login error:', err)
      updateState({ errorMessage: t('googleLoginError') })
    } finally {
      setField('googleLoading', false)
    }
  }
  const handleFacebookLogin = () => startOAuth('facebook', 'facebookLoading')

  // Form handlers
  const handleForgotPassword = async (email: string) => {
    const success = await sendResetPasswordLink(email)
    updateState({ resetSent: success })
    if (!success) {
      updateState({ errorMessage: t('resetPasswordFailed') })
    }
  }

  const getEmailValidationError = (email: string): string | null => {
    const trimmed = email.trim()
    if (!trimmed) return t('emailRequired')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return t('invalidEmail')
    return null
  }

  const handleSendLoginCode = async (email: string) => {
    const validationError = getEmailValidationError(email)
    if (validationError) {
      updateState({
        errorMessage: validationError,
        successMessage: '',
      })
      return
    }

    const trimmedEmail = email.trim()
    const response = await sendLoginCode(trimmedEmail)
    if (response.success) {
      updateState({
        mode: 'verifyCode',
        successMessage: `We've sent a 6 digit code to ${trimmedEmail}. It expires in 10 minutes.`,
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
    } else {
      updateState({ errorMessage: t('verifyCodeFailed') })
    }
  }

  const handleLogin = async (email: string, password: string) => {
    const ipInfo = await fetchIpInfo()
    if (ipInfo) {
      storeIpGeoInfo(ipInfo)
    }
    const response = await login({
      email,
      password,
      ...(ipInfo ? { ip: ipInfo.ip, country: ipInfo.country } : {}),
    })
    if (response?.success) {
      checkKickstarterStatus()
      handlePostLoginRedirect()
    } else {
      updateState({ errorMessage: t('loginFailed') })
    }
  }

  const handleRegister = async (name: string, email: string, password: string) => {
    const ipInfo = await fetchIpInfo()
    if (ipInfo) {
      storeIpGeoInfo(ipInfo)
    }
    const response = await register({
      name,
      email,
      password,
      password_confirmation: password,
      ...(ipInfo ? { ip: ipInfo.ip, country: ipInfo.country } : {}),
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
      } else if (state.mode === 'codeLogin') {
        await handleSendLoginCode(state.email)
      } else if (state.mode === 'verifyCode') {
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
      setField('code', '')
      setField('successMessage', '')
      setField('errorMessage', '')
      setField('countdown', 0)
    }
  }

  const renderFormContent = () => {
    if (state.mode === 'register') {
      return (
        <>
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
          unifiedUI={unifiedUI}
          inputWrapperStyle={unifiedUI ? previewEmailWrapperStyle : undefined}
          inputWrapperClassName={unifiedUI ? previewEmailWrapperClassName : undefined}
          inputStyle={unifiedUI ? previewEmailInputStyle : undefined}
          inputClassName={unifiedUI ? previewEmailInputClassName : undefined}
          labelClassName={unifiedUI ? previewEmailLabelClassName : undefined}
          hideRequiredMark={unifiedUI}
        />
          <ErrorAlert message={state.errorMessage} />
        </>
      )
    }

    if (state.mode === 'login') {
      return (
        <>
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
          unifiedUI={unifiedUI}
          inputWrapperStyle={unifiedUI ? previewEmailWrapperStyle : undefined}
          inputWrapperClassName={unifiedUI ? previewEmailWrapperClassName : undefined}
          inputStyle={unifiedUI ? previewEmailInputStyle : undefined}
          inputClassName={unifiedUI ? previewEmailInputClassName : undefined}
          labelClassName={unifiedUI ? previewEmailLabelClassName : undefined}
          hideRequiredMark={unifiedUI}
        />
          <ErrorAlert message={state.errorMessage} />
        </>
      )
    }

    if (state.mode === 'forgotPassword') {
      return (
        <fieldset className={unifiedUI ? 'space-y-[12px]' : 'space-y-4'}>
          <Input
            id="email"
            label={t('email')}
            type="email"
            value={state.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder={t('emailPlaceholder')}
            required
            hideRequiredMark={unifiedUI}
            wrapperStyle={unifiedUI ? previewEmailWrapperStyle : undefined}
            wrapperClassName={unifiedUI ? previewEmailWrapperClassName : undefined}
            inputStyle={unifiedUI ? previewEmailInputStyle : undefined}
            inputClassName={unifiedUI ? previewEmailInputClassName : undefined}
            labelClassName={unifiedUI ? previewEmailLabelClassName : undefined}
            error={state.errorMessage}
          />
        </fieldset>
      )
    }

    if (state.mode === 'codeLogin') {
      return (
        <fieldset className={unifiedUI ? 'space-y-[12px]' : isPreviewUnlock ? 'space-y-[12px]' : 'space-y-4'}>
          <Input
            id="email"
            label={t('email')}
            type="email"
            value={state.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder={t('emailPlaceholder')}
            required
            hideRequiredMark={unifiedUI || isPreviewUnlock}
            wrapperStyle={unifiedUI || isPreviewUnlock ? previewEmailWrapperStyle : undefined}
            wrapperClassName={unifiedUI || isPreviewUnlock ? previewEmailWrapperClassName : undefined}
            inputStyle={unifiedUI || isPreviewUnlock ? previewEmailInputStyle : undefined}
            inputClassName={unifiedUI || isPreviewUnlock ? previewEmailInputClassName : undefined}
            labelClassName={unifiedUI || isPreviewUnlock ? previewEmailLabelClassName : undefined}
            error={state.errorMessage}
          />
        </fieldset>
      )
    }

    if (state.mode === 'verifyCode') {
      return (
        <CodeInputField
          code={state.code}
          onCodeChange={(value) => setField('code', value)}
          successMessage={state.successMessage}
          errorMessage={state.errorMessage}
        />
      )
    }

    return null
  }

  const previewOAuthFooter = showNotCreatorPrompt ? (
    <p className="text-center text-[14px] leading-[20px] tracking-[0.25px] text-[#999999]">
      {tPreview('notCreatorQuestion')}{' '}
      <Link
        href={loginModalOptions!.personalizeHref!}
        onClick={closeLoginModal}
        className="font-medium text-[#222222] underline underline-offset-2"
      >
        {tPreview('createYourOwnBook')}
      </Link>
    </p>
  ) : null

  if (isBottomSheet && isPreviewUnlock && state.mode === 'codeLogin' && showMobileUnlockLanding) {
    return (
      <main
        className="relative flex w-full shrink-0 flex-col rounded-t-[16px] bg-white px-3 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 text-[#20202A]"
        role="main"
      >
        <div className="flex w-full justify-center pb-3" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-[#D9D9D9]" />
        </div>

        <div className="mb-4 flex items-center justify-center gap-3">
          <Sparkles className="h-6 w-6 shrink-0 text-[#FFD45A]" strokeWidth={2} aria-hidden="true" />
          <h1 className="text-center text-[22px] font-semibold leading-7">
            {tPreview('continueReadingTitle')}
          </h1>
        </div>

        <div className="flex flex-col gap-[10px]">
          <button
            type="button"
            onClick={() => startOAuth('google', 'googleLoading')}
            disabled={state.googleLoading}
            className="flex h-[50px] w-full items-center justify-center gap-3 rounded-[10px] bg-[#171717] text-[15px] font-normal text-white transition-opacity disabled:opacity-60"
          >
            <GoogleIcon />
            {tPreview('continueWithGoogle')}
          </button>
          <button
            type="button"
            onClick={() => setShowMobileUnlockLanding(false)}
            className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#D2D2D7] bg-white text-[15px] font-normal text-[#20202A]"
          >
            <Mail className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
            {tPreview('continueWithEmail')}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_1px_1fr] items-center gap-5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F7FF]">
              <Zap className="h-5 w-5 text-[#4768E9]" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold leading-4">{tPreview('quickAccess')}</p>
              <p className="text-[12px] leading-[14px] text-[#666666]">{tPreview('noPasswordRequired')}</p>
            </div>
          </div>
          <span className="h-10 bg-[#E8E8EC]" aria-hidden="true" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F7FF]">
              <Gift className="h-5 w-5 text-[#4768E9]" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold leading-4">{tPreview('welcomeOffer')}</p>
              <p className="text-[12px] leading-[14px] text-[#666666]">{tPreview('welcomeOfferCheckout')}</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main
      className={`relative flex shrink-0 flex-col bg-white ${
        isBottomSheet
          ? 'w-full gap-[12px] rounded-t-[16px] px-[24px] pb-[calc(24px+env(safe-area-inset-bottom))] pt-[12px]'
          : unifiedUI
            ? 'gap-[12px] rounded-[12px] p-[24px]'
            : isPreviewUnlock
              ? 'gap-[12px] rounded-[12px] p-[24px]'
              : 'w-96 items-center justify-center gap-4 rounded-lg p-4'
      }`}
      style={unifiedUI || isPreviewUnlock || isBottomSheet ? previewModalStyle : undefined}
      role="main"
    >
      {isBottomSheet && (
        <div className="flex w-full justify-center pb-[4px]" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-[#D9D9D9]" />
        </div>
      )}
      {showCloseButton && !isBottomSheet && (
        <div className="flex w-full justify-end">
          <CloseButton onClose={closeLoginModal} iconSize={12} />
        </div>
      )}

      <ModalHeader
        title={getTitleByMode()}
        description={headerDescription}
        variant={usePreviewHeaderLayout ? 'previewUnlock' : unifiedUI ? 'compact' : 'default'}
        compact={unifiedUI}
        fluid={isBottomSheet}
      />

      <form
        onSubmit={handleSubmit}
        className={`min-w-0 w-full text-[#222222] ${
          unifiedUI || isPreviewUnlock
            ? needsFormScroll
              ? 'flex max-h-[280px] min-h-0 flex-col space-y-[12px] overflow-y-auto'
              : 'space-y-[12px]'
            : 'space-y-4'
        }`}
        noValidate
      >
        {renderFormContent()}

        <FormSubmitSections
          mode={state.mode}
          loading={state.loading}
          errorMessage={state.errorMessage}
          resetSent={state.resetSent}
          successMessage={getSuccessMessage()}
          countdown={state.countdown}
          buttonLabel={getButtonLabelByMode()}
          onModeChange={handleModeChange}
          onResetCodeFlow={() => {
            resetCodeFlow()
            setField('resetSent', false)
          }}
          onSendLoginCode={handleSendLoginCode}
          googleLoading={state.googleLoading}
          facebookLoading={state.facebookLoading}
          onGoogleLogin={handleGoogleCredentialLogin}
          onFacebookLogin={handleFacebookLogin}
          onGoogleCredential={handleGoogleCredentialLogin}
          translations={{
            forgotPasswordQuestion: t('forgotPasswordQuestion'),
            loginWithCode: t('loginWithCode'),
            haveAccount: t('haveAccount'),
            login: t('login'),
            backToLogin: t('backToLogin'),
            returnToLogin: t('returnToLogin'),
            usePasswordInstead: 'Use password instead',
            changeEmail: t('changeEmail'),
            orContinueWith: t('orContinueWith'),
          }}
          email={state.email}
          unifiedUI={unifiedUI || isPreviewUnlock}
          buttonClassName={unifiedUI || isPreviewUnlock ? previewButtonClassName : undefined}
          buttonStyle={unifiedUI || isPreviewUnlock ? previewButtonStyle : undefined}
          fluid={isBottomSheet}
          oauthFooter={previewOAuthFooter}
          hidePasswordLogin={isPreviewUnlock}
        />
        {(isPreviewUnlock ? previewFooterNote : footerNote) && state.mode === 'codeLogin' && (
          <p className="text-center text-[14px] leading-[20px] tracking-[0.25px] font-normal text-[#999999]">
            {isPreviewUnlock ? previewFooterNote : footerNote}
          </p>
        )}
      </form>
    </main>
  )
}
