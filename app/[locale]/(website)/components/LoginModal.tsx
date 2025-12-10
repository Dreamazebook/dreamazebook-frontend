'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import useUserStore from '@/stores/userStore'
import Button from '@/app/components/Button'
import Input from '@/app/components/common/Input'

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, register, login, loginAdmin, sendResetPasswordLink, postLoginRedirect, setPostLoginRedirect, checkKickstarterStatus, loginWithGoogle } = useUserStore()
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
  },[mode]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage('');
    try {
      // Get Google OAuth URL
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setErrorMessage('Google authentication not configured');
        setGoogleLoading(false);
        return;
      }

      const redirectUri = `${window.location.origin}/api/auth/google/callback`;
      const scope = ['openid', 'email', 'profile'];
      const responseType = 'code';
      const accessType = 'offline';

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        scope: scope.join(' '),
        access_type: accessType,
        prompt: 'consent',
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } catch (error) {
      console.error('Google login error:', error);
      setErrorMessage('Failed to initiate Google login');
      setGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setFacebookLoading(true);
    setErrorMessage('');
    try {
      // Get Facebook OAuth URL
      const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      if (!appId) {
        setErrorMessage('Facebook authentication not configured');
        setFacebookLoading(false);
        return;
      }

      const redirectUri = `${window.location.origin}/api/auth/facebook/callback`;
      const scope = ['email', 'public_profile'];
      const responseType = 'code';

      const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: redirectUri,
        response_type: responseType,
        scope: scope.join(','),
        display: 'popup',
      });

      window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
    } catch (error) {
      console.error('Facebook login error:', error);
      setErrorMessage('Failed to initiate Facebook login');
      setFacebookLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true);
    setErrorMessage('');
    
    if (mode === 'forgotPassword') {
      // 调用API发送重置密码邮件
      const success = await sendResetPasswordLink(email);
      setResetSent(success);
      setLoading(false);
      if (!success) {
        setErrorMessage('Failed to send reset password email. Please try again.');
      }
      return;
    }
    
    // 登录或注册逻辑
    const userData = {
      email, password
    }
    if (mode === 'login') {
      //Todo: admin login
      if (email.includes('admin')) {
        const response = await loginAdmin(userData);
        if (response?.success) {
          closeLoginModal();
          setLoading(false);
          router.push('/admin');
          return;
        }
      }
      const response = await login(userData);
      if (response?.success) {
        // 登录成功后检查Kickstarter套餐
        checkKickstarterStatus();
        const redirectUrl = searchParams.get('redirect') || postLoginRedirect;
        closeLoginModal();
        setPostLoginRedirect(null);
        setLoading(false);
        if (redirectUrl) {
          return router.push(redirectUrl);
        } else {
          return router.push('/');
        }
      } else {
        setErrorMessage('Login failed. Please check your email and password.');
        setLoading(false);
      }
    } else {
      const response = await register({
        name,
        email,
        password,
        password_confirmation: password
      });
      if (response?.success) {
        const redirectUrl = searchParams.get('redirect') || postLoginRedirect;
        closeLoginModal();
        setPostLoginRedirect(null);
        setLoading(false);
        if (redirectUrl) {
          router.push(redirectUrl);
        }
        return router.push('/');
      } else {
        setErrorMessage('Registration failed. Please try again.');
        setLoading(false);
      }
    }
    setLoading(false);
  }
  
  return (
    <div className="flex flex-col items-center justify-center bg-white p-4 w-96 gap-4">
        <h2 className="text-xl font-semibold text-[#222222]">
          {mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Forgot Password'}
        </h2>
        {/* <button 
          onClick={closeLoginModal}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          ✕
        </button> */}
      
      <form onSubmit={handleSubmit} className="space-y-4 text-[#222222] w-full">
        {(mode === 'register') && 
        <Input
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />}

        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
        />
        
        {mode !== 'forgotPassword' && (
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        )}
        
        {errorMessage && (
          <div className="bg-red-50 p-3 rounded-md text-red-700">
            <p>{errorMessage}</p>
          </div>
        )}
        {mode === 'forgotPassword' && resetSent ? (
          <div className="bg-green-50 p-3 rounded-md text-green-700">
            <p>Password reset link has been sent to your email address.</p>
            <p className="mt-2">
              <span 
                className="text-[#1BA7FF] cursor-pointer" 
                onClick={() => {
                  setMode('login');
                  setResetSent(false);
                }}
              >
                Return to login
              </span>
            </p>
          </div>
        ) : (
          <Button 
            tl={
              mode === 'login' 
                ? 'Login' 
                : mode === 'register' 
                  ? 'Register' 
                  : 'Send Reset Link'
            } 
            isLoading={loading} 
          />
        )}

        {mode === 'login' && !resetSent && (
          <div className="flex flex-col space-y-2">
            <a>No account? <span className='text-[#1BA7FF] cursor-pointer' onClick={() => setMode('register')}>Create one</span></a>
            <a><span className='text-[#1BA7FF] cursor-pointer' onClick={() => setMode('forgotPassword')}>Forgot password?</span></a>
          </div>
        )}
        
        {mode === 'register' && (
          <a>Have an account? <span className='text-[#1BA7FF] cursor-pointer' onClick={() => setMode('login')}>Login</span></a>
        )}
        
        {mode === 'forgotPassword' && !resetSent && (
          <a><span className='text-[#1BA7FF] cursor-pointer' onClick={() => setMode('login')}>Back to login</span></a>
        )}

        {mode === 'login' && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">Or continue with</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {googleLoading ? 'Loading...' : 'Google'}
              </button>
              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={facebookLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {facebookLoading ? 'Loading...' : 'Facebook'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}