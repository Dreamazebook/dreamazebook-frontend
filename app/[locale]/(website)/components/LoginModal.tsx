'use client'

import { useState } from 'react'
import useUserStore from '@/stores/userStore'

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, register } = useUserStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically make an API call to authenticate
    register({
      name: 'User',
      email: email,
      password,
      password_confirmation: password
    })
    // closeLoginModal()
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder='Enter your password'
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#222222] text-white py-2 rounded-md"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  )
}