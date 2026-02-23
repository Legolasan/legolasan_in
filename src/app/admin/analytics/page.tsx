'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaEye, FaUsers, FaGlobe, FaChartLine, FaDesktop, FaMobile, FaTablet, FaMapMarkerAlt } from 'react-icons/fa'
import dynamic from 'next/dynamic'

// Dynamic import for the map component (avoid SSR issues)
const VisitorMap = dynamic(() => import('@/components/VisitorMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Loading map...</span>
    </div>
  ),
})

interface AnalyticsData {
  totalViews: number
  uniqueVisitors: number
  topPages: Array<{ path: string; views: number }>
  viewsByDay: Array<{ date: string; views: number }>
  topBrowsers: Array<{ browser: string; count: number }>
  topDevices: Array<{ device: string; count: number }>
  topReferrers: Array<{ referrer: string; count: number }>
  visitorLocations: Array<{ country: string; city: string | null; count: number }>
  topCountries: Array<{ country: string; count: number }>
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/analytics/stats?days=${days}`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const data = await res.json()
      setData(data)
      setError(null)
    } catch (err) {
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <FaMobile className="w-4 h-4" />
      case 'tablet':
        return <FaTablet className="w-4 h-4" />
      default:
        return <FaDesktop className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg">
        {error}
      </div>
    )
  }

  if (!data) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Analytics Dashboard</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Page Views</p>
              <h3 className="text-3xl font-bold text-gray-800">{data.totalViews.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FaEye className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Unique Visitors</p>
              <h3 className="text-3xl font-bold text-gray-800">{data.uniqueVisitors.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <FaUsers className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Views/Day</p>
              <h3 className="text-3xl font-bold text-gray-800">
                {data.viewsByDay.length > 0
                  ? Math.round(data.totalViews / data.viewsByDay.length)
                  : 0}
              </h3>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <FaChartLine className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Top Referrers</p>
              <h3 className="text-3xl font-bold text-gray-800">{data.topReferrers.length}</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaGlobe className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Visitor Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary-600" />
            Visitor Locations
          </h3>
          <span className="text-sm text-gray-500">
            {data.visitorLocations?.length || 0} locations
          </span>
        </div>
        <VisitorMap locations={data.visitorLocations || []} />
        {/* Top Countries List */}
        {data.topCountries && data.topCountries.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
            {data.topCountries.slice(0, 5).map((country, index) => (
              <div
                key={country.country}
                className="bg-gray-50 rounded-lg p-3 text-center"
              >
                <div className="text-lg font-bold text-gray-800">{country.count}</div>
                <div className="text-xs text-gray-500 truncate">{country.country}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Top Pages</h3>
          <div className="space-y-3">
            {data.topPages.map((page, index) => (
              <div key={page.path} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-gray-100 rounded text-center text-sm font-medium text-gray-600 mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 truncate max-w-[200px]">{page.path}</span>
                </div>
                <span className="font-semibold text-gray-800">{page.views}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Browsers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Browsers</h3>
          <div className="space-y-3">
            {data.topBrowsers.map((browser) => {
              const percentage = Math.round((browser.count / data.totalViews) * 100)
              return (
                <div key={browser.browser}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-700">{browser.browser}</span>
                    <span className="text-gray-500">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Devices</h3>
          <div className="flex justify-around">
            {data.topDevices.map((device) => {
              const percentage = Math.round((device.count / data.totalViews) * 100)
              return (
                <div key={device.device} className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    {getDeviceIcon(device.device)}
                  </div>
                  <div className="text-lg font-bold text-gray-800">{percentage}%</div>
                  <div className="text-sm text-gray-500 capitalize">{device.device}</div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Top Referrers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Top Referrers</h3>
          <div className="space-y-3">
            {data.topReferrers.length > 0 ? (
              data.topReferrers.map((ref, index) => (
                <div key={ref.referrer} className="flex items-center justify-between">
                  <span className="text-gray-700 truncate max-w-[250px]">
                    {ref.referrer || 'Direct'}
                  </span>
                  <span className="font-semibold text-gray-800">{ref.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No referrer data yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

