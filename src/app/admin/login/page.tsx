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

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      // User is already logged in as admin
    }
  }, [session, status])

  useEffect(() => {
    const errorParam = searchParams.get('error')

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
        default:
          setError(`Sign in error: ${errorParam}. Please try again.`)
      }
    }
  }, [searchParams])

  const handleSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setError(null)

    try {
      const callbackUrl = searchParams.get('callbackUrl') || '/admin'
      await signIn(provider, {
        callbackUrl,
        redirect: true,
      })
    } catch (error) {
      setError(
        error instanceof Error
          ? `Sign in error: ${error.message}`
          : 'An unexpected error occurred during sign in.'
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
          <p className="text-gray-600">Sign in to access the admin panel</p>
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
              href="/admin"
              className="text-sm font-medium text-green-700 hover:text-green-800 underline"
            >
              Go to Admin Dashboard
            </a>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleSignIn('google')}
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
            onClick={() => handleSignIn('github')}
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
            href="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Home
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
