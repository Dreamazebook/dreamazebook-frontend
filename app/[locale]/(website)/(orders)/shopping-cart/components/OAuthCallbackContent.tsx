'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { OAUTH_CALLBACK } from '@/constants/api';
import useUserStore from '@/stores/userStore';
import { getStoredIpGeoInfo, fetchIpInfo, storeIpGeoInfo } from '@/utils/ipGeo';
import api from '@/utils/api';
import { ApiResponse } from '@/types/api';

export default function OAuthCallbackContent({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { setLoginUserToken } = useUserStore();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const oauthError = searchParams.get('error');

        if (oauthError) {
          console.error('OAuth error:', oauthError);
          return;
        }

        if (!code) {
          // console.error('No authorization code');
          return;
        }

        const provider = localStorage.getItem('oauthProvider') || 'google';

        // Ensure IP/country info is available (fetched in LoginModal before redirect,
        // but fetch again as fallback in case it wasn't persisted)
        let ipInfo = getStoredIpGeoInfo();
        if (!ipInfo.ip || !ipInfo.country) {
          const fresh = await fetchIpInfo();
          if (fresh) {
            storeIpGeoInfo(fresh);
            ipInfo = fresh;
          }
        }

        // Build query params with code, ip, country
        const params = new URLSearchParams({ code });
        if (ipInfo.ip) params.set('ip', ipInfo.ip);
        if (ipInfo.country) params.set('country', ipInfo.country);

        const {user, token, success} = await api.get<any>(OAUTH_CALLBACK(provider) + `?${params.toString()}`);

        if (success) {
          const redirectUrl = localStorage.getItem('redirectUrl') || '/shopping-cart';
          setLoginUserToken({token, user});
          localStorage.removeItem('redirectUrl');
          localStorage.removeItem('oauthProvider');
          if (onSuccess) {
            onSuccess();
          }
          router.push(redirectUrl);
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
      }
    };

    processOAuthCallback();
  }, []);

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
