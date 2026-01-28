'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { API_RESET_PASSWORD } from '@/constants/api';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';
import Button from '@/app/components/Button';
import Input from '@/app/components/common/Input';
import { ModalHeader } from '@/app/[locale]/(website)/components/LoginModal/ModalHeader';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('LoginModal');
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const validatePassword = (): boolean => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push(t('passwordMustBeAtLeast8Characters'));
    }

    if (!/[A-Z]/.test(password) && !/[0-9]/.test(password)) {
      errors.push(t('passwordMustIncludeNumberOrUppercase'));
    }

    if (password !== confirmPassword) {
      errors.push(t('passwordsDontMatch'));
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError(t('invalidResetToken'));
      return;
    }

    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(API_RESET_PASSWORD, {
        token,
        password,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('resetPasswordFailedMessage'));
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#222222] mb-2">
              {t('passwordUpdated')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('youCanNowContinueToAccount')}
              <br />
              {t('redirecting')}
            </p>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1BA7FF]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <ModalHeader
          title={t('setNewPasswordTitle')}
          description={t('setNewPasswordDescription')}
        />

        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 whitespace-pre-line"
            style={shakeError ? {
              animation: 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
            } : {}}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-[#222222] w-full" noValidate>
          <Input
            id="password"
            label={t('newPassword')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('newPasswordPlaceholder')}
            required
          />

          <Input
            id="confirmPassword"
            label={t('confirmPassword')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('confirmPasswordPlaceholder')}
            required
          />

          <Button tl={t('updatePassword')} isLoading={loading} />
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
