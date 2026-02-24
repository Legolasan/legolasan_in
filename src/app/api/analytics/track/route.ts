import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { UAParser } from 'ua-parser-js'
import { rateLimiters, getClientIP } from '@/lib/rateLimit'
import { getGeoFromIP } from '@/lib/geoLookup'

// Sanitize UTM parameter - only allow alphanumeric, underscore, hyphen
const sanitizeUTM = (value: unknown, maxLength: number): string | null => {
  if (typeof value !== 'string' || !value) return null
  // Allow common UTM characters: alphanumeric, underscore, hyphen, period
  const sanitized = value.replace(/[^a-zA-Z0-9_\-\.]/g, '').substring(0, maxLength)
  return sanitized || null
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const { success } = rateLimiters.analytics.check(ip)

    if (!success) {
      return NextResponse.json({ success: false, error: 'Rate limited' }, { status: 429 })
    }

    const body = await request.json()
    const { pagePath, referrer, sessionId, utmSource, utmMedium, utmCampaign, utmContent } = body

    // Input validation
    if (typeof pagePath !== 'string' || pagePath.length > 500) {
      return NextResponse.json({ success: false })
    }

    // Get user agent info
    const userAgent = request.headers.get('user-agent') || ''
    const parser = new UAParser(userAgent)
    const result = parser.getResult()

    // Get geo data from IP (non-blocking)
    const geoData = await getGeoFromIP(ip)

    await prisma.pageView.create({
      data: {
        pagePath: pagePath.substring(0, 500) || '/',
        referrer: typeof referrer === 'string' ? referrer.substring(0, 500) : null,
        userAgent: userAgent.substring(0, 1000),
        device: result.device.type || 'desktop',
        browser: result.browser.name || 'unknown',
        os: result.os.name || 'unknown',
        sessionId: typeof sessionId === 'string' ? sessionId.substring(0, 100) : null,
        country: geoData.country?.substring(0, 100) || null,
        city: geoData.city?.substring(0, 100) || null,
        // UTM tracking fields
        utmSource: sanitizeUTM(utmSource, 100),
        utmMedium: sanitizeUTM(utmMedium, 100),
        utmCampaign: sanitizeUTM(utmCampaign, 200),
        utmContent: sanitizeUTM(utmContent, 200),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Don't log detailed errors in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Analytics tracking error:', error)
    }
    // Don't fail the request - analytics shouldn't block the user
    return NextResponse.json({ success: false })
  }
}

// Prevent static generation
export const dynamic = 'force-dynamic'
