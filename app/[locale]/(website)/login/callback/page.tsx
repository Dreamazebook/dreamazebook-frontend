'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { OAUTH_CALLBACK } from '@/constants/api';

export default function LoginCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('loginCallback');
  
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Extract query parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
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

        console.log('Received Google OAuth code:', code.substring(0, 10) + '...');
        console.log('State parameter:', state);

        // Prepare data to send to Laravel API
        const callbackData = {
          code: code,
          state: state || null
        };

        console.log('Sending to Laravel API:', {
          url: OAUTH_CALLBACK('google'),
          data: callbackData
        });

        // Send the code to Laravel API
        const response = await fetch(OAUTH_CALLBACK('google'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(callbackData)
        });

        const responseData = await response.json();

        console.log('Laravel API Response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });

        setResponse({
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });

        setLoading(false);

        // If successful, redirect after a short delay
        if (responseData.success) {
          setTimeout(() => {
            const redirectUrl = state ? decodeURIComponent(state) : '/dashboard';
            router.push(redirectUrl);
          }, 3000);
        }

      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || t("failedToProcessCallback"));
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  const formatResponse = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
          ) : (
            <div>
              {response?.data?.success ? (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <div>
                      <h3 className="font-semibold text-green-800">{t("authenticationSuccessful")}</h3>
                      <p className="text-green-600 text-sm">{t("redirectingToDashboard")}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <div>
                      <h3 className="font-semibold text-yellow-800">{t("authenticationCompleted")}</h3>
                      <p className="text-yellow-600 text-sm">{t("checkResponseBelow")}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* URL Parameters */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t("urlQueryParameters")}</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="space-y-2 text-sm">
                      <div><strong>{t("code")}</strong> {searchParams.get('code') ? searchParams.get('code')?.substring(0, 20) + '...' : t("none")}</div>
                      <div><strong>{t("state")}</strong> {searchParams.get('state') || t("none")}</div>
                      <div><strong>{t("error")}</strong> {searchParams.get('error') || t("none")}</div>
                      <div><strong>{t("errorDescription")}</strong> {searchParams.get('error_description') || t("none")}</div>
                    </div>
                  </div>
                </div>

                {/* API Response */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">{t("laravelApiResponse")}</h3>
                    <button
                      onClick={() => copyToClipboard(formatResponse(response))}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Copy Response
                    </button>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {formatResponse(response)}
                    </pre>
                  </div>
                </div>

                {/* Debug Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t("debugInformation")}</h3>
                  <div className="bg-gray-50 p-4 rounded-md text-sm">
                    <div className="space-y-2">
                      <div><strong>{t("httpStatus")}</strong> {response?.status} {response?.statusText}</div>
                      <div><strong>{t("responseTime")}</strong> {new Date().toLocaleString()}</div>
                      <div><strong>{t("callbackUrl")}</strong> {OAUTH_CALLBACK('google')}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-center pt-6">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    {t("backToLogin")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}