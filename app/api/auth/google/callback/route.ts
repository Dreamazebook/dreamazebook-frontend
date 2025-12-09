import { NextRequest, NextResponse } from 'next/server'

interface TokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope: string
  token_type: string
  id_token: string
}

interface GoogleUserProfile {
  id: string
  email: string
  name: string
  picture: string
  email_verified: boolean
  locale?: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Unknown error'
      console.error(`Google OAuth error: ${error} - ${errorDescription}`)
      return redirectToLoginWithError('Google authentication failed')
    }

    if (!code) {
      return redirectToLoginWithError('No authorization code received from Google')
    }

    // Exchange authorization code for access token
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_HOST_URL}/api/auth/google/callback`

    if (!clientId || !clientSecret) {
      console.error('Google OAuth credentials not configured')
      return redirectToLoginWithError('Google authentication not configured')
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    })


    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData)
      return redirectToLoginWithError('Failed to get access token from Google')
    }

    const tokenData: TokenResponse = await tokenResponse.json()

    // Fetch user profile using access token
    const userProfileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userProfileResponse.ok) {
      console.error('Failed to fetch user profile from Google')
      return redirectToLoginWithError('Failed to fetch user profile')
    }

    const googleUser: GoogleUserProfile = await userProfileResponse.json()

    // Prepare response - encode user data in URL for client-side handling
    const userData = encodeURIComponent(
      JSON.stringify({
        googleId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        emailVerified: googleUser.email_verified,
        idToken: tokenData.id_token,
        accessToken: tokenData.access_token,
      })
    )

    // Redirect to a client-side handler with user data
    return NextResponse.redirect(
      new URL(
        `/auth/google/success?userData=${userData}`,
        process.env.NEXT_PUBLIC_HOST_URL
      )
    )
  } catch (error) {
    console.error('Google callback error:', error)
    return redirectToLoginWithError('An error occurred during authentication')
  }
}

function redirectToLoginWithError(errorMessage: string) {
  const encodedError = encodeURIComponent(errorMessage)
  return NextResponse.redirect(
    new URL(`/?login=true&error=${encodedError}`, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  )
}
