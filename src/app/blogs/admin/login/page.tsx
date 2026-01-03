'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { FaGoogle, FaGithub } from 'react-icons/fa'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug: Log session status on mount and changes
  useEffect(() => {
    console.log('[DEBUG] LoginForm mounted/updated:', { status, hasSession: !!session, userRole: session?.user?.role })
  }, [session, status])

  // Don't auto-redirect - let user manually navigate or let middleware handle it
  // This prevents redirect loops
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      console.log('[DEBUG] User is authenticated as admin - showing message instead of auto-redirecting')
      // Don't redirect automatically to prevent loops
      // User can click a button or navigate manually
    }
  }, [session, status])

  useEffect(() => {
    const errorParam = searchParams.get('error')
    console.log('[DEBUG] Error parameter in URL:', errorParam)
    
    if (errorParam) {
      switch (errorParam) {
        case 'OAuthAccountNotLinked':
          setError('This account is already linked to a different authentication method. Please use the same method you used to create your account.')
          break
        case 'Configuration':
          setError('There is a problem with the server configuration. Please contact support.')
          break
        case 'AccessDenied':
          setError('Access denied. You do not have permission to sign in.')
          break
        case 'Verification':
          setError('The verification token has expired or has already been used.')
          break
        case 'OAuthSignin':
          setError('Error in constructing an authorization URL.')
          break
        case 'OAuthCallback':
          setError('Error in handling the response from an OAuth provider.')
          break
        case 'OAuthCreateAccount':
          setError('Could not create OAuth account in the database.')
          break
        case 'EmailCreateAccount':
          setError('Could not create email account in the database.')
          break
        case 'Callback':
          setError('Error in the OAuth callback handler route.')
          break
        case 'OAuthAccountNotLinked':
          setError('Email on the account is already linked, but not with this OAuth account.')
          break
        case 'EmailSignin':
          setError('Sending the e-mail with the sign in token failed.')
          break
        case 'CredentialsSignin':
          setError('The authorize callback returned null in the Credentials provider.')
          break
        case 'SessionRequired':
          setError('The content of this page requires you to be signed in at all times.')
          break
        default:
          setError(`Sign in error: ${errorParam}. Please try again or contact support if the problem persists.`)
      }
    }
  }, [searchParams])

  const handleSignIn = async (provider: 'google' | 'github') => {
    console.log(`[DEBUG] handleSignIn called with provider: ${provider}`)
    setIsLoading(true)
    setError(null)
    
    try {
      // Use NextAuth's signIn function with redirect: true
      // This will handle the OAuth flow properly
      console.log(`[DEBUG] Calling signIn for ${provider}...`)
      const result = await signIn(provider, {
        callbackUrl: '/blogs/admin',
        redirect: true, // Let NextAuth handle the redirect
      })
      
      console.log(`[DEBUG] signIn result:`, result)
      
      // If redirect: true, signIn should redirect automatically
      // If it returns, check for errors
      if (result?.error) {
        console.error(`[ERROR] Sign in returned error:`, result.error)
        setError(`Sign in failed: ${result.error}`)
        setIsLoading(false)
      } else if (result?.ok === false) {
        console.error(`[ERROR] Sign in failed:`, result)
        setError('Sign in failed. Please try again.')
        setIsLoading(false)
      }
      // If redirect: true worked, we won't reach here as the page will redirect
    } catch (error) {
      console.error('[ERROR] Sign in exception:', error)
      console.error('[ERROR] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error,
      })
      setError(
        error instanceof Error 
          ? `Sign in error: ${error.message}` 
          : 'An unexpected error occurred during sign in. Please check the console for details.'
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Admin Login
          </h1>
          <p className="text-gray-600">Sign in to manage your blog</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {status === 'authenticated' && session?.user?.role === 'admin' && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600 mb-2">You are already signed in as admin.</p>
            <a
              href="/blogs/admin"
              className="text-sm font-medium text-green-700 hover:text-green-800 underline"
            >
              Go to Admin Dashboard →
            </a>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={(e) => {
              e.preventDefault()
              console.log('[DEBUG] Google button clicked')
              handleSignIn('google')
            }}
            disabled={isLoading}
            type="button"
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            ) : (
              <FaGoogle className="text-red-500" size={20} />
            )}
            <span className="font-semibold text-gray-700">
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault()
              console.log('[DEBUG] GitHub button clicked')
              handleSignIn('github')
            }}
            disabled={isLoading}
            type="button"
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-800 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
            ) : (
              <FaGithub size={20} />
            )}
            <span className="font-semibold text-gray-700">
              {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
            </span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/blogs"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Blog
          </a>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

