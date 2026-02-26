'use client'

import { useEffect, useState } from 'react'
import { FaCog, FaToggleOn, FaToggleOff, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa'

interface FeatureFlags {
  resumeAndServicesEnabled: boolean
}

export default function AdminSettingsPage() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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

  const toggleFeature = async (enabled: boolean) => {
    setIsSaving(true)
    setSaveStatus('idle')
    setStatusMessage('')

    try {
      const res = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })

      const data = await res.json()

      if (res.ok) {
        setFlags({ resumeAndServicesEnabled: enabled })
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
      setIsSaving(false)
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
          {/* Resume & Services Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  Resume & Services Features
                </h3>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  flags?.resumeAndServicesEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {flags?.resumeAndServicesEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Controls visibility of Resume download button and Services page in navigation.
                {!flags?.resumeAndServicesEnabled && ' Currently hidden from public users.'}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <strong>When enabled:</strong> Resume button + Services link visible
                <br />
                <strong>When disabled:</strong> Resume button + Services link hidden, API returns 503
              </div>
            </div>

            <div className="ml-6">
              <button
                onClick={() => toggleFeature(!flags?.resumeAndServicesEnabled)}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  isSaving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : flags?.resumeAndServicesEnabled
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                }`}
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : flags?.resumeAndServicesEnabled ? (
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
                    Toggling features requires rebuilding the Next.js app (~30-60 seconds).
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
        </div>
      </div>
    </div>
  )
}
