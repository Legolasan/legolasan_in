import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { UAParser } from 'ua-parser-js'
import { rateLimiters, getClientIP } from '@/lib/rateLimit'
import { getGeoFromIP } from '@/lib/geoLookup'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const { success } = rateLimiters.analytics.check(ip)

    if (!success) {
      return NextResponse.json({ success: false, error: 'Rate limited' }, { status: 429 })
    }

    const body = await request.json()
    const { pagePath, referrer, sessionId } = body

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
