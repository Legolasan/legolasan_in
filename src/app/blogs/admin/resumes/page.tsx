'use client'

import { useEffect, useState } from 'react'
import { FaDownload, FaBuilding, FaCalendar, FaGlobe } from 'react-icons/fa'

interface ResumeDownload {
  id: string
  email: string
  domain: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

interface Stats {
  total: number
  uniqueDomains: number
  last7Days: number
  topDomains: { domain: string; count: number }[]
}

export default function ResumeDownloadsPage() {
  const [downloads, setDownloads] = useState<ResumeDownload[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/resume-downloads')
      .then((res) => res.json())
      .then((data) => {
        setDownloads(data.downloads || [])
        setStats(data.stats || null)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching downloads:', err)
        setIsLoading(false)
      })
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Resume Downloads</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Downloads</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <FaDownload className="text-primary-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Unique Companies</p>
                <p className="text-3xl font-bold text-gray-800">{stats.uniqueDomains}</p>
              </div>
              <FaBuilding className="text-accent-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Last 7 Days</p>
                <p className="text-3xl font-bold text-gray-800">{stats.last7Days}</p>
              </div>
              <FaCalendar className="text-secondary-600" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Top Domains */}
      {stats && stats.topDomains.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaGlobe className="text-primary-600" />
            Top Companies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.topDomains.map((item) => (
              <div
                key={item.domain}
                className="bg-gray-50 rounded-lg p-3 text-center"
              >
                <p className="font-semibold text-gray-800 truncate" title={item.domain}>
                  {item.domain}
                </p>
                <p className="text-sm text-gray-600">{item.count} downloads</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Downloads Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Recent Downloads</h2>
        </div>

        {downloads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No resume downloads yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {downloads.map((download) => (
                  <tr key={download.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`mailto:${download.email}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {download.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {download.domain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {formatDate(download.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                      {download.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
