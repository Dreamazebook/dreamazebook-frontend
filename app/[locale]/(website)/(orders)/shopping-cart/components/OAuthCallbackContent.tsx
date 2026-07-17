'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { toRouterPath } from '@/utils/localePath';
import { getOAuthCodeSessionKey, normalizeOAuthUserResponse } from '@/utils/oauth';
import { OAUTH_CALLBACK } from '@/constants/api';
import useUserStore from '@/stores/userStore';
import { getStoredIpGeoInfo, fetchIpInfo, storeIpGeoInfo } from '@/utils/ipGeo';
import api from '@/utils/api';
import type { ApiResponse, UserResponse } from '@/types/api';

export default function OAuthCallbackContent({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inFlightRef = useRef(false);

  const { setLoginUserToken } = useUserStore();

  useEffect(() => {
    const processOAuthCallback = async () => {
      const code = searchParams.get('code');
      const oauthError = searchParams.get('error');

      const finishRedirect = () => {
        const rawRedirect = localStorage.getItem('redirectUrl') || '/shopping-cart';
        const redirectUrl = toRouterPath(rawRedirect);
        localStorage.removeItem('redirectUrl');
        localStorage.removeItem('oauthProvider');
        router.replace(redirectUrl);
      };

      if (oauthError) {
        console.error('OAuth error:', oauthError);
        finishRedirect();
        return;
      }

      if (!code) return;

      const codeSessionKey = getOAuthCodeSessionKey(code);
      if (sessionStorage.getItem(codeSessionKey) === '1') {
        finishRedirect();
        return;
      }

      if (inFlightRef.current) return;
      inFlightRef.current = true;

      try {
        const provider = localStorage.getItem('oauthProvider') || 'google';

        let ipInfo = getStoredIpGeoInfo();
        if (!ipInfo.ip || !ipInfo.country) {
          const fresh = await fetchIpInfo();
          if (fresh) {
            storeIpGeoInfo(fresh);
            ipInfo = fresh;
          }
        }

        const params = new URLSearchParams({ code });
        if (ipInfo.ip) params.set('ip', ipInfo.ip);
        if (ipInfo.country) params.set('country', ipInfo.country);

        const response = await api.get<ApiResponse<UserResponse>>(
          OAUTH_CALLBACK(provider) + `?${params.toString()}`,
        );

        const userResponse = normalizeOAuthUserResponse(response);
        if (userResponse?.token) {
          sessionStorage.setItem(codeSessionKey, '1');
          setLoginUserToken(userResponse);
          if (onSuccess) {
            onSuccess();
          }
          finishRedirect();
          return;
        }

        console.error('OAuth callback: unexpected response shape', response);
        finishRedirect();
      } catch (err: unknown) {
        console.error('OAuth callback error:', err);
        finishRedirect();
      } finally {
        inFlightRef.current = false;
      }
    };

    void processOAuthCallback();
  }, [searchParams, router, setLoginUserToken, onSuccess]);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex gap-4 p-4 border-b border-gray-200">
                  <div className="w-24 h-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded p-6 shadow-sm space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
