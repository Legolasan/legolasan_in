'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Generate a unique session ID
const getSessionId = () => {
  if (typeof window === 'undefined') return null

  let sessionId = sessionStorage.getItem('analytics_session')
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('analytics_session', sessionId)
  }
  return sessionId
}

// UTM parameter keys we track
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const

interface UTMParams {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
}

// Get UTM params from URL or sessionStorage (first-touch attribution)
const getUTMParams = (searchParams: URLSearchParams): UTMParams => {
  if (typeof window === 'undefined') {
    return { utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null }
  }

  // Check if URL has any UTM params
  const hasUrlUtm = UTM_KEYS.some(key => searchParams.has(key))

  if (hasUrlUtm) {
    // Capture from URL and store in sessionStorage (first-touch)
    const utmData: UTMParams = {
      utmSource: searchParams.get('utm_source'),
      utmMedium: searchParams.get('utm_medium'),
      utmCampaign: searchParams.get('utm_campaign'),
      utmContent: searchParams.get('utm_content'),
    }

    // Store for subsequent page views in this session
    sessionStorage.setItem('utm_params', JSON.stringify(utmData))
    return utmData
  }

  // No UTM in URL - check sessionStorage for previously captured params
  const stored = sessionStorage.getItem('utm_params')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return { utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null }
    }
  }

  return { utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null }
}

// Inner component that uses useSearchParams
function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/blogs/admin') || pathname.startsWith('/admin')) return

    const trackPageView = async () => {
      try {
        const utmParams = getUTMParams(searchParams)

        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pagePath: pathname,
            referrer: document.referrer || null,
            sessionId: getSessionId(),
            ...utmParams,
          }),
        })
      } catch (error) {
        // Silently fail - analytics shouldn't affect UX
        console.debug('Analytics tracking failed:', error)
      }
    }

    trackPageView()
  }, [pathname, searchParams])

  return null
}

// Main component wrapped in Suspense to handle useSearchParams
export default function Analytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTracker />
    </Suspense>
  )
}
