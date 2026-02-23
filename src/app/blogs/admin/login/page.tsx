'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect to shared admin login
export default function BlogAdminLoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/login?callbackUrl=/blogs/admin')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  )
}
