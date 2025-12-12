'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { OAUTH_CALLBACK } from '@/constants/api';
import useUserStore from '@/stores/userStore';

export default function LoginCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('loginCallback');

  const {setLoginUserToken} = useUserStore()
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processOAuthCallback = async () => {
    try {
      // Extract query parameters
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Handle OAuth errors from Google
      if (error) {
        setError(t("oauthError", {error}));
        if (errorDescription) {
          setError(prev => prev + ` - ${errorDescription}`);
        }
        setLoading(false);
        return;
      }

      // Check for authorization code
      if (!code) {
        setError(t("noAuthorizationCode"));
        setLoading(false);
        return;
      }

      // Send the code to Laravel API
      const response = await fetch(OAUTH_CALLBACK('google')+`?code=${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const responseData = await response.json();

      setLoading(false);

      // If successful, set success state and redirect after a short delay
      if (responseData.success) {
        setSuccess(true);
        const redirectUrl = localStorage.getItem('redirectUrl') || '/';
        setLoginUserToken(responseData);
        localStorage.removeItem('redirectUrl');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 2000);
      } else {
        setError(t("authenticationFailed"));
      }

    } catch (err: any) {
      console.error('OAuth callback error:', err);
      setError(err.message || t("failedToProcessCallback"));
      setLoading(false);
    }
  };

  useEffect(() => {
    processOAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">{t("title")}</h1>
          
          {loading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-lg text-gray-600">{t("processingCallback")}</p>
              <p className="text-sm text-gray-500 mt-2">{t("extractingCode")}</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-red-600 mb-4">{t("error")}</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/login')}
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                {t("backToLogin")}
              </button>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-green-600 mb-4">{t("loginSuccessful")}</h2>
              <p className="text-gray-600">{t("redirectingToDashboard")}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}