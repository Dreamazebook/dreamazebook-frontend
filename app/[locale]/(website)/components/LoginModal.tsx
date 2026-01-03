'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useUserStore from '@/stores/userStore'
import Button from '@/app/components/Button'
import Input from '@/app/components/common/Input'
import { OAUTH_REDIRECT } from '@/constants/api'

export default function LoginModal() {
  const t = useTranslations('LoginModal');
  const {
    closeLoginModal,
    register,
    login,
    loginAdmin,
    sendResetPasswordLink,
    checkKickstarterStatus,
  } = useUserStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setErrorMessage('');
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

    try {
      if (mode === 'forgotPassword') {
        await handleForgotPassword(email);
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
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>{googleLoading ? t('loading') : t('google')}</span>
      </button>
      <button
        type="button"
        onClick={handleFacebookLogin}
        disabled={facebookLoading}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span>{facebookLoading ? t('loading') : t('facebook')}</span>
      </button>
    </div>
  </div>
);

const ModeToggleLinks = () => {
  if (mode === 'login' && !resetSent) {
    return (
      <div className="flex flex-col space-y-2 text-sm">
        <span>
          {t('noAccount')}{' '}
          <button 
            type="button"
            className="text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
            onClick={() => setMode('register')}
          >
            {t('createOne')}
          </button>
        </span>
        <button 
          type="button"
          className="text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline text-left"
          onClick={() => setMode('forgotPassword')}
        >
          {t('forgotPasswordQuestion')}
        </button>
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
            className="text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
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
          className="text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
          onClick={() => setMode('login')}
        >
          {t('backToLogin')}
        </button>
      </div>
    );
  }
  
  return null;
};

return (
  <main className="flex flex-col items-center justify-center bg-white p-4 w-96 gap-4" role="main">
    <header className="text-center">
      <h1 className="text-xl font-semibold text-[#222222]">
        {mode === 'login' ? t('login') : mode === 'register' ? t('register') : t('forgotPassword')}
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

        <Input
          id="email"
          label={t('email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          required
        />
        
        {mode !== 'forgotPassword' && (
          <Input
            id="password"
            label={t('password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
            required
          />
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
              className="text-[#1BA7FF] hover:text-[#1689E6] transition-colors focus:outline-none focus:underline"
              onClick={() => {
                setMode('login');
                setResetSent(false);
              }}
            >
              {t('returnToLogin')}
            </button>
          </p>
        </div>
      ) : (
        <Button 
          tl={
            mode === 'login' 
              ? t('login') 
              : mode === 'register' 
                ? t('register') 
                : t('sendResetLink')
          } 
          isLoading={loading} 
        />
      )}

      <ModeToggleLinks />

      {['login','register'].includes(mode) && <OAuthButtons />}
    </form>
  </main>
)
}