'use client'

import { useState } from 'react'
import useUserStore from '@/stores/userStore'
import Button from '@/app/components/Button'

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, register, login } = useUserStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true);
    // Here you would typically make an API call to authenticate
    const userData = {
      email, password
    }
    if (mode == 'login') {
      login(userData);
    } else {
      register({
        name: 'User',
        email,
        password,
        password_confirmation: password
      })
    }
    setLoading(false);
    closeLoginModal()
  }
  
  if (!isLoginModalOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-w-full">
        <div className="flex justify-end items-center mb-4">
          <button 
            onClick={closeLoginModal}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-[#222222]">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-black rounded-md"
              placeholder='Enter your email address'
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-black rounded-md"
              placeholder='Enter your password'
              required
            />
          </div>
          
          <Button tl={mode == 'login' ? 'Login' : 'Register'} isLoading={loading} />

          {mode=='login'?
          <a>No account? <span className='text-[#1BA7FF] cursor-pointer' onClick={()=>setMode('register')}>Create one</span></a>
          :
          <a>Have an account? <span className='text-[#1BA7FF] cursor-pointer' onClick={()=>setMode('login')}>Login</span></a>
          }
        </form>
      </div>
    </div>
  )
}