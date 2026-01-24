'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useUserStore from '@/stores/userStore'
import Button from '@/app/components/Button'
import Input from '@/app/components/common/Input'
import { OAUTH_REDIRECT } from '@/constants/api'

export default function LoginModal({ showCloseButton = false }: { showCloseButton?: boolean }) {
  const t = useTranslations('LoginModal');
  const {
    openLoginModal,
    closeLoginModal,
    register,
    login,
    loginAdmin,
    sendResetPasswordLink,
    checkKickstarterStatus,
    sendLoginCode,
    verifyLoginCode,
  } = useUserStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [mode, setMode] = useState('codeLogin');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    const urlRedirect = searchParams.get('redirect');
    
    // Save URL redirect to localStorage if it exists
    if (urlRedirect) {
      localStorage.setItem('redirectUrl', urlRedirect);
    }
  },[mode]);

  const fetchOAuthRedirect = async (provider: string) => {
    try {
      const res = await fetch(OAUTH_REDIRECT(provider), { method: 'GET', credentials: 'include' });
      if (!res.ok) return null;
      const json = await res.json();
      localStorage.setItem('oauthProvider',provider);
      return json.redirect_url ?? json.url ?? null;
    } catch (e) {
      console.error('fetchOAuthRedirect error', e);
      return null;
    }
  };

  const startOAuth = async (provider: string, setLoading: (v: boolean) => void) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const url = await fetchOAuthRedirect(provider);
      if (url) {
        return window.location.href = url;
      } else {
        setErrorMessage(t(`${provider.toLowerCase()}OAuthError`));
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setErrorMessage(t(`${provider.toLowerCase()}LoginError`));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => startOAuth('google', setGoogleLoading);

  const handleFacebookLogin = () => startOAuth('facebook', setFacebookLoading);

  const handlePostLoginRedirect = (defaultPath = '/') => {    
    closeLoginModal();
    const urlRedirect = localStorage.getItem('redirectUrl');
    if (urlRedirect) {
      // Remove the redirect URL from localStorage before redirecting
      localStorage.removeItem('redirectUrl');
      router.push(urlRedirect);
    } else {
      router.push(defaultPath);
    }
  };

  const handleForgotPassword = async (email: string) => {
    const success = await sendResetPasswordLink(email);
    setResetSent(success);
    if (!success) {
      setErrorMessage(t('resetPasswordFailed'));
    }
  };

  const handleSendLoginCode = async (email: string) => {
    const response = await sendLoginCode(email);
    setCodeSent(response.success);
    if (response.success) {
      setSuccessMessage(`We've sent a 6 digit code to ${email}. It expires in 10 minutes.`);
      setCountdown(60);
      setErrorMessage('');
    } else {
      setErrorMessage(response.message || t('sendCodeFailed'));
      setSuccessMessage('');
    }
  };

  const handleVerifyLoginCode = async (email: string, code: string) => {
    const response = await verifyLoginCode(email, code);
    if (response?.success) {
      checkKickstarterStatus();
      handlePostLoginRedirect();
      return true;
    } else {
      setErrorMessage(t('verifyCodeFailed'));
      return false;
    }
  };

  // Auto-submit when code reaches 6 digits
  useEffect(() => {
    if (code.length === 6 && mode === 'codeLogin' && codeSent) {
      const submitForm = async () => {
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        await handleVerifyLoginCode(email, code);
        setLoading(false);
      };
      submitForm();
    }
  }, [code]);

  const handleLogin = async (email: string, password: string) => {
    if (email.includes('admin')) {
      const response = await loginAdmin({ email, password });
      if (response?.success) {
        closeLoginModal();
        handlePostLoginRedirect('/admin')
        return true;
      }
    }

    const response = await login({ email, password });
    if (response?.success) {
      checkKickstarterStatus();
      handlePostLoginRedirect();
      return true;
    } else {
      setErrorMessage(t('loginFailed'));
      return false;
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const response = await register({
      name,
      email,
      password,
      password_confirmation: password,
    });
    if (response?.success) {
      handlePostLoginRedirect();
      return true;
    } else {
      setErrorMessage(t('registrationFailed'));
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (mode === 'forgotPassword') {
        await handleForgotPassword(email);
      } else if (mode === 'codeLogin' && !codeSent) {
        await handleSendLoginCode(email);
      } else if (mode === 'codeLogin' && codeSent) {
        await handleVerifyLoginCode(email, code);
      } else if (mode === 'login') {
        await handleLogin(email, password);
      } else if (mode === 'register') {
        await handleRegister(name, email, password);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const OAuthButtons = () => (
  <div className="pt-2 border-t border-gray-200">
    <p className="text-sm text-gray-600 text-center mb-3">{t('orContinueWith')}</p>
    <div className="flex items-center justify-center gap-[24px]">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="cursor-pointer hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        <svg className="w-[24px] h-[24px]" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </button>
      <button
        type="button"
        onClick={handleFacebookLogin}
        disabled={facebookLoading}
        className="cursor-pointer hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        <svg className="w-[24px] h-[24px]" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </button>
    </div>
  </div>
);

const CodeLoginButton = () => {
  if (mode === 'login') {
    return (
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setMode('codeLogin');
            setCodeSent(false);
            setCode('');
            setErrorMessage('');
          }}
          className="cursor-pointer text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
        >
          <span>{t('loginWithCode')}</span>
        </button>
      </div>
    );
  }
  return null;
};

const ModeToggleLinks = () => {
  if (mode === 'login' && !resetSent) {
    return (
      <div className="flex flex-col space-y-2 text-sm">
        <button
          type="button"
          className="cursor-pointer text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
          onClick={() => setMode('forgotPassword')}
        >
          {t('forgotPasswordQuestion')}
        </button>
        {/* <span>
          {t('noAccount')}{' '}
          <button
            type="button"
            className="cursor-pointer text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
            onClick={() => setMode('register')}
          >
            {t('createOne')}
          </button>
        </span> */}
      </div>
    );
  }
  
  if (mode === 'register') {
    return (
      <div className="text-sm">
        <span>
          {t('haveAccount')}{' '}
          <button 
            type="button"
            className="cursor-pointer text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
            onClick={() => setMode('login')}
          >
            {t('login')}
          </button>
        </span>
      </div>
    );
  }
  
  if (mode === 'forgotPassword' && !resetSent) {
    return (
      <div className="text-sm">
        <button 
          type="button"
          className="cursor-pointer text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
          onClick={() => setMode('login')}
        >
          {t('backToLogin')}
        </button>
      </div>
    );
  }

  if (mode === 'codeLogin' && !codeSent) {
    return (
      <div className="text-sm text-center">
        <button
          type="button"
          className="cursor-pointer text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
          onClick={() => setMode('login')}
        >
          Use password instead
        </button>
      </div>
    );
  }

  if (mode === 'codeLogin' && codeSent) {
    return (
      <div className="text-sm">
        <button
          type="button"
          className="cursor-pointer text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
          onClick={() => {
            setCodeSent(false);
            setCode('');
            setSuccessMessage('');
            setErrorMessage('');
            setCountdown(0);
          }}
        >
          {t('changeEmail')}
        </button>
      </div>
    );
  }
  
  return null;
};

return (
  <main className="flex flex-col items-center justify-center bg-white rounded-lg p-4 w-96 gap-4 relative" role="main">
    {showCloseButton && (
      <button
        type="button"
        onClick={closeLoginModal}
        className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors focus:outline-none z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
    <header className="w-full flex items-center justify-center relative">
      {mode === 'codeLogin' && codeSent && (
        <button
          type="button"
          onClick={() => {
            setCodeSent(false);
            setCode('');
            setSuccessMessage('');
            setErrorMessage('');
            setCountdown(0);
          }}
          className="absolute left-0 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors focus:outline-none"
          title={t('backToLogin')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h1 className="text-[28px] text-[#000]">
        {mode === 'login' ? t('login') : mode === 'register' ? t('register') : mode === 'forgotPassword' ? t('forgotPassword') : 'Welcome to Dreamaze'}
      </h1>
    </header>

    <form onSubmit={handleSubmit} className="space-y-4 text-[#222222] w-full" noValidate>
      <fieldset className="space-y-4">
        {mode === 'register' && (
          <Input
            id="name"
            label={t('name')}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('namePlaceholder')}
            required
          />
        )}

        {(!codeSent || mode !== 'codeLogin') && (
          <Input
            id="email"
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
            required
          />
        )}
        
        {mode !== 'forgotPassword' && mode !== 'codeLogin' && (
          <div className="relative">
            <Input
              id="password"
              label={t('password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[40px] cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        )}

        {mode === 'codeLogin' && codeSent && (
          <div>
            {successMessage && (
              <div
                className="p-3 text-center"
                role="status"
                aria-live="polite"
              >
                <p>{successMessage}</p>
              </div>
            )}

            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el && index === 0) {
                      (el as HTMLInputElement).addEventListener('paste', (e) => {
                        e.preventDefault();
                        const pastedData = e.clipboardData?.getData('text') || '';
                        const digits = pastedData.replace(/\D/g, '').slice(0, 6);
                        if (digits.length > 0) {
                          setCode(digits.padEnd(6, ''));
                          const inputs = document.querySelectorAll('.code-input');
                          const nextFocusIndex = Math.min(digits.length, 5);
                          (inputs[nextFocusIndex] as HTMLInputElement)?.focus();
                        }
                      });
                    }
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[index] || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && !/^\d$/.test(value)) return;
                    const newCode = code.split('');
                    newCode[index] = value;
                    setCode(newCode.join(''));
                    if (value && index < 5) {
                      (document.querySelectorAll('.code-input')[index + 1] as HTMLInputElement)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !code[index] && index > 0) {
                      (document.querySelectorAll('.code-input')[index - 1] as HTMLInputElement)?.focus();
                    }
                  }}
                  className="code-input w-12 h-12 text-center text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1BA7FF] focus:border-[#1BA7FF] outline-none"
                  required
                />
              ))}
            </div>
          </div>
        )}
      </fieldset>

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
          <p>{t('resetPasswordSent')}</p>
          <p className="mt-2">
            <button 
              type="button"
              className="cursor-pointer text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
              onClick={() => {
                setMode('login');
                setResetSent(false);
              }}
            >
              {t('returnToLogin')}
            </button>
          </p>
        </div>
      ) : mode === 'codeLogin' && codeSent ? (
        <>
          <Button
            tl={t('verifyCode')}
            isLoading={loading}
          />
          <div className="text-center text-sm">
            {countdown > 0 ? (
              <span className="text-gray-500">Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={() => handleSendLoginCode(email)}
                className="cursor-pointer text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
              >
                Resend code
              </button>
            )}
          </div>
        </>
      ) : (
        <Button 
          tl={
            mode === 'login' 
              ? t('login') 
              : mode === 'register' 
                ? t('register') 
                : mode === 'forgotPassword'
                  ? t('sendResetLink')
                  : t('sendCode')
          } 
          isLoading={loading} 
        />
      )}

      <ModeToggleLinks />

      {mode === 'login' && <CodeLoginButton />}
      <OAuthButtons />
    </form>
  </main>
)
}