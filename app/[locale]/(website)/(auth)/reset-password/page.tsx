'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { API_RESET_PASSWORD } from '@/constants/api';
import { useSearchParams } from 'next/navigation';
import api from '@/utils/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      errors.push('❌ Password must be at least 8 characters.');
    }

    if (!/[A-Z]/.test(password) && !/[0-9]/.test(password)) {
      errors.push('❌ Password must include at least 1 number or 1 uppercase letter.');
    }

    if (password !== confirmPassword) {
      errors.push('❌ Passwords don\'t match.');
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
      setError('Invalid or expired reset token.');
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
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
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
              Password updated
            </h1>
            <p className="text-gray-600 mb-6">
              You can now continue to your account.
              <br />
              Redirecting…
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
        <header className="w-full flex items-center justify-center mb-6">
          <h1 className="text-xl font-semibold text-[#222222]">
            Set a new password
          </h1>
        </header>

        <p className="text-gray-600 text-center mb-6">
          You’re updating the password for this account.
        </p>

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
          <div>
            <label htmlFor="password" className="block text-[16px] font-medium text-[#222] mb-1">
              New Password<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="password"
              id="password"
              className={`w-full p-3 border rounded-md ${
                error && error.includes('Password') ? 'border-red-500' : 'border-gray-300'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-[16px] font-medium text-[#222] mb-1">
              Confirm Password<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              className={`w-full p-3 border rounded-md ${
                error && error.includes("don't match") ? 'border-red-500' : 'border-gray-300'
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1BA7FF] hover:bg-[#1689E6] text-white py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
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
