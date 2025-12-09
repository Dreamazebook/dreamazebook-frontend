'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useUserStore from '@/stores/userStore'

export default function GoogleSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithGoogleToken, closeLoginModal, checkKickstarterStatus, postLoginRedirect, setPostLoginRedirect } = useUserStore()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processGoogleLogin = async () => {
      try {
        const userDataParam = searchParams.get('userData')
        const errorParam = searchParams.get('error')

        if (errorParam) {
          setError(decodeURIComponent(errorParam))
          setIsProcessing(false)
          return
        }

        if (!userDataParam) {
          setError('No user data received')
          setIsProcessing(false)
          return
        }

        const userData = JSON.parse(decodeURIComponent(userDataParam))

        // Call the backend to authenticate with Google token
        const response = await loginWithGoogleToken(userData)

        if (response?.success) {
          checkKickstarterStatus()
          closeLoginModal()
          setIsProcessing(false)

          const redirectUrl = postLoginRedirect
          setPostLoginRedirect(null)

          if (redirectUrl) {
            router.push(redirectUrl)
          } else {
            router.push('/')
          }
        } else {
          setError('Google login failed. Please try again.')
          setIsProcessing(false)
        }
      } catch (err) {
        console.error('Error processing Google login:', err)
        setError('An error occurred during authentication')
        setIsProcessing(false)
      }
    }

    processGoogleLogin()
  }, [searchParams, loginWithGoogleToken, closeLoginModal, checkKickstarterStatus, postLoginRedirect, setPostLoginRedirect, router])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Signing you in...</h1>
          <p className="text-gray-600">Please wait while we complete your authentication.</p>
        </div>
      </div>
    </div>
  )
}
