import { NextRequest, NextResponse } from 'next/server'

interface FacebookTokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
}

interface FacebookUserProfile {
  id: string
  email: string
  name: string
  picture?: {
    data: {
      height: number
      width: number
      is_silhouette: boolean
      url: string
    }
  }
  email_verified?: boolean
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorReason = searchParams.get('error_reason')
    const errorDescription = searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error(`Facebook OAuth error: ${error} - ${errorReason} - ${errorDescription}`)
      return redirectToLoginWithError('Facebook authentication failed')
    }

    if (!code) {
      return redirectToLoginWithError('No authorization code received from Facebook')
    }

    // Exchange authorization code for access token
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    const appSecret = process.env.FACEBOOK_APP_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_HOST_URL}/api/auth/facebook/callback`

    if (!appId || !appSecret) {
      console.error('Facebook OAuth credentials not configured')
      return redirectToLoginWithError('Facebook authentication not configured')
    }

    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code,
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData)
      return redirectToLoginWithError('Failed to get access token from Facebook')
    }

    const tokenData: FacebookTokenResponse = await tokenResponse.json()

    // Fetch user profile using access token
    const userProfileResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,email,name,picture&access_token=${encodeURIComponent(tokenData.access_token)}`
    )

    if (!userProfileResponse.ok) {
      console.error('Failed to fetch user profile from Facebook')
      return redirectToLoginWithError('Failed to fetch user profile')
    }

    const facebookUser: FacebookUserProfile = await userProfileResponse.json()

    // Check if email is available
    if (!facebookUser.email) {
      return redirectToLoginWithError('Please allow access to your email address')
    }

    // Prepare response - encode user data in URL for client-side handling
    const pictureUrl = facebookUser.picture?.data?.url || ''
    const userData = encodeURIComponent(
      JSON.stringify({
        facebookId: facebookUser.id,
        email: facebookUser.email,
        name: facebookUser.name,
        picture: pictureUrl,
        accessToken: tokenData.access_token,
      })
    )

    // Redirect to a client-side handler with user data
    return NextResponse.redirect(
      new URL(
        `/auth/facebook/success?userData=${userData}`,
        request.nextUrl.origin
      )
    )
  } catch (error) {
    console.error('Facebook callback error:', error)
    return redirectToLoginWithError('An error occurred during authentication')
  }
}

function redirectToLoginWithError(errorMessage: string) {
  const encodedError = encodeURIComponent(errorMessage)
  return NextResponse.redirect(
    new URL(`/?login=true&error=${encodedError}`, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  )
}
