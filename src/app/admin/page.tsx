'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaChartBar, FaRobot, FaDownload, FaEye, FaUsers, FaBlog } from 'react-icons/fa'

interface DashboardStats {
  totalPageViews: number
  totalChatSessions: number
  totalResumeDownloads: number
  recentVisitors: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPageViews: 0,
    totalChatSessions: 0,
    totalResumeDownloads: 0,
    recentVisitors: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch analytics stats
        const analyticsRes = await fetch('/api/analytics/stats?days=30')
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json()
          setStats((prev) => ({
            ...prev,
            totalPageViews: analyticsData.totalViews || 0,
            recentVisitors: analyticsData.uniqueVisitors || 0,
          }))
        }

        // Fetch chat sessions count
        const chatsRes = await fetch('/api/chats')
        if (chatsRes.ok) {
          const chatsData = await chatsRes.json()
          setStats((prev) => ({
            ...prev,
            totalChatSessions: chatsData.length || 0,
          }))
        }

        // Fetch resume downloads count
        const resumesRes = await fetch('/api/resume-downloads')
        if (resumesRes.ok) {
          const resumesData = await resumesRes.json()
          setStats((prev) => ({
            ...prev,
            totalResumeDownloads: resumesData.length || 0,
          }))
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Page Views (30d)</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalPageViews.toLocaleString()}</p>
            </div>
            <FaEye className="text-primary-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Unique Visitors (30d)</p>
              <p className="text-3xl font-bold text-gray-800">{stats.recentVisitors.toLocaleString()}</p>
            </div>
            <FaUsers className="text-accent-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Chat Sessions</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalChatSessions}</p>
            </div>
            <FaRobot className="text-green-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Resume Downloads</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalResumeDownloads}</p>
            </div>
            <FaDownload className="text-blue-600" size={40} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/analytics"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
          >
            <FaChartBar className="text-primary-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Analytics</h3>
            <p className="text-sm text-gray-600">View site traffic and insights</p>
          </Link>
          <Link
            href="/admin/chats"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
          >
            <FaRobot className="text-primary-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Chat Logs</h3>
            <p className="text-sm text-gray-600">View AI chatbot conversations</p>
          </Link>
          <Link
            href="/admin/resumes"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
          >
            <FaDownload className="text-primary-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Resume Downloads</h3>
            <p className="text-sm text-gray-600">Track resume requests</p>
          </Link>
          <Link
            href="/blogs/admin"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
          >
            <FaBlog className="text-primary-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Blog Admin</h3>
            <p className="text-sm text-gray-600">Manage blog posts and comments</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
