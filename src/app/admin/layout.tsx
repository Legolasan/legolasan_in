'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { FaHome, FaChartBar, FaRobot, FaDownload, FaSignOutAlt, FaCog, FaBlog } from 'react-icons/fa'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // Skip authentication check on login page
    if (isLoginPage) {
      return
    }

    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated' && session?.user.role !== 'admin') {
      router.push('/')
    }
  }, [session, status, router, isLoginPage])

  // If on login page, render children directly without layout
  if (isLoginPage) {
    return <>{children}</>
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'admin') {
    return null
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center space-x-2">
              <FaCog className="text-primary-600" size={24} />
              <span className="text-xl font-bold text-gray-800">Admin Panel</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{session.user.name || session.user.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 bg-white rounded-lg shadow-lg p-6 h-fit">
            <nav className="space-y-2">
              <Link
                href="/admin"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                <FaHome />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/analytics"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/analytics')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                <FaChartBar />
                <span>Analytics</span>
              </Link>
              <Link
                href="/admin/chats"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/chats')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                <FaRobot />
                <span>Chat Logs</span>
              </Link>
              <Link
                href="/admin/resumes"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/resumes')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                <FaDownload />
                <span>Resume Downloads</span>
              </Link>

              <div className="border-t border-gray-200 my-4"></div>

              <Link
                href="/blogs/admin"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
              >
                <FaBlog />
                <span>Blog Admin</span>
              </Link>
              <Link
                href="/"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
              >
                <FaHome />
                <span>View Site</span>
              </Link>
            </nav>
          </aside>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
