'use client'

import { useEffect, useState } from 'react'
import { FaCog, FaToggleOn, FaToggleOff, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa'

interface FeatureFlags {
  resumeDownloadEnabled: boolean
  servicesEnabled: boolean
}

type FlagKey = 'resumeDownload' | 'services'

export default function AdminSettingsPage() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [savingFlag, setSavingFlag] = useState<FlagKey | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    fetchFlags()
  }, [])

  const fetchFlags = async () => {
    try {
      const res = await fetch('/api/admin/feature-flags')
      if (res.ok) {
        const data = await res.json()
        setFlags(data)
      }
    } catch (err) {
      console.error('Error fetching flags:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFeature = async (flag: FlagKey, enabled: boolean) => {
    setSavingFlag(flag)
    setSaveStatus('idle')
    setStatusMessage('')

    try {
      const res = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag, enabled })
      })

      const data = await res.json()

      if (res.ok) {
        // Update local state
        setFlags(prev => prev ? {
          ...prev,
          [`${flag}Enabled`]: enabled
        } : null)

        setSaveStatus('success')
        setStatusMessage(data.message || 'Settings updated successfully')

        // Show rebuild message
        if (data.rebuilding) {
          setTimeout(() => {
            setStatusMessage('App is rebuilding... This may take 30-60 seconds. The page will refresh automatically.')
          }, 2000)

          // Auto-refresh after rebuild (60 seconds)
          setTimeout(() => {
            window.location.reload()
          }, 60000)
        }
      } else {
        setSaveStatus('error')
        setStatusMessage(data.error || 'Failed to update settings')
      }
    } catch (err) {
      setSaveStatus('error')
      setStatusMessage('Network error. Please try again.')
    } finally {
      setSavingFlag(null)
    }
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
      <div className="flex items-center gap-3 mb-8">
        <FaCog className="text-primary-600" size={32} />
        <h1 className="text-4xl font-bold text-gray-800">Settings</h1>
      </div>

      {/* Status Message */}
      {saveStatus !== 'idle' && statusMessage && (
        <div className={`mb-6 p-4 rounded-lg border ${
          saveStatus === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {saveStatus === 'success' ? (
              <FaCheck className="text-green-600" />
            ) : (
              <FaTimes className="text-red-600" />
            )}
            <p className="font-medium">{statusMessage}</p>
          </div>
        </div>
      )}

      {/* Feature Flags Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Feature Flags</h2>

        <div className="space-y-6">
          {/* Resume Download Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  Resume Download
                </h3>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  flags?.resumeDownloadEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {flags?.resumeDownloadEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Controls visibility of Resume download button in navigation header.
                {!flags?.resumeDownloadEnabled && ' Currently hidden from public users.'}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <strong>When enabled:</strong> Resume button visible in header
                <br />
                <strong>When disabled:</strong> Resume button hidden, API returns 503
              </div>
            </div>

            <div className="ml-6">
              <button
                onClick={() => toggleFeature('resumeDownload', !flags?.resumeDownloadEnabled)}
                disabled={savingFlag === 'resumeDownload'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  savingFlag === 'resumeDownload'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : flags?.resumeDownloadEnabled
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                }`}
              >
                {savingFlag === 'resumeDownload' ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : flags?.resumeDownloadEnabled ? (
                  <>
                    <FaToggleOn size={20} />
                    Enabled
                  </>
                ) : (
                  <>
                    <FaToggleOff size={20} />
                    Disabled
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Services Page Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  Services Page
                </h3>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  flags?.servicesEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {flags?.servicesEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Controls visibility of Services navigation link and page access.
                {!flags?.servicesEnabled && ' Currently hidden from public users.'}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <strong>When enabled:</strong> Services link visible, page accessible
                <br />
                <strong>When disabled:</strong> Services link hidden, page shows unavailable message
              </div>
            </div>

            <div className="ml-6">
              <button
                onClick={() => toggleFeature('services', !flags?.servicesEnabled)}
                disabled={savingFlag === 'services'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  savingFlag === 'services'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : flags?.servicesEnabled
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                }`}
              >
                {savingFlag === 'services' ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : flags?.servicesEnabled ? (
                  <>
                    <FaToggleOn size={20} />
                    Enabled
                  </>
                ) : (
                  <>
                    <FaToggleOff size={20} />
                    Disabled
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  About Feature Flags
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Each feature can be toggled independently. Toggling requires rebuilding the Next.js app (~30-60 seconds).
                    The app will automatically restart after the rebuild completes.
                    Historical data in admin dashboards remains accessible even when features are disabled.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Environment</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Mode:</span>
            <span className="text-gray-600">{process.env.NODE_ENV}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Next.js Version:</span>
            <span className="text-gray-600">14.2.35</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium text-gray-700">Feature Flags:</span>
            <span className="text-gray-600">2 available</span>
          </div>
        </div>
      </div>
    </div>
  )
}
