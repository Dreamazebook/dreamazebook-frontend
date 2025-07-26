'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useUserStore from '@/stores/userStore'
import Button from '@/app/components/Button'
import Input from '@/app/components/common/Input'

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, register, login, sendResetPasswordLink } = useUserStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true);
    
    if (mode === 'forgotPassword') {
      // 调用API发送重置密码邮件
      const success = await sendResetPasswordLink(email);
      setResetSent(success);
      setLoading(false);
      if (!success) {
        console.error('Failed to send reset password email');
      }
      return;
    }
    
    // 登录或注册逻辑
    const userData = {
      email, password
    }
    if (mode === 'login') {
      const response = await login(userData);
      if (response?.success) {
        closeLoginModal();
        // 检查是否有重定向URL参数
        const redirectUrl = searchParams.get('redirect');
        if (redirectUrl) {
          router.push(redirectUrl);
        }
      }
    } else {
      const response = await register({
        name: 'User',
        email,
        password,
        password_confirmation: password
      });
      if (response?.success) {
        closeLoginModal();
        // 检查是否有重定向URL参数
        const redirectUrl = searchParams.get('redirect');
        if (redirectUrl) {
          router.push(redirectUrl);
        }
      }
    }
    setLoading(false);
  }
  
  if (!isLoginModalOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#222222]">
            {mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Forgot Password'}
          </h2>
          <button 
            onClick={closeLoginModal}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-[#222222]">
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
        </form>
      </div>
    </div>
  )
}