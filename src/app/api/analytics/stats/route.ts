import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  // Only admin can view analytics
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30')

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  try {
    // Total page views
    const totalViews = await prisma.pageView.count({
      where: {
        createdAt: { gte: startDate },
      },
    })

    // Unique sessions (visitors)
    const uniqueVisitors = await prisma.pageView.groupBy({
      by: ['sessionId'],
      where: {
        createdAt: { gte: startDate },
        sessionId: { not: null },
      },
    })

    // Top pages
    const topPages = await prisma.pageView.groupBy({
      by: ['pagePath'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: {
        pagePath: true,
      },
      orderBy: {
        _count: {
          pagePath: 'desc',
        },
      },
      take: 10,
    })

    // Views by day
    const viewsByDay = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM page_views
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `

    // Top browsers
    const topBrowsers = await prisma.pageView.groupBy({
      by: ['browser'],
      where: {
        createdAt: { gte: startDate },
        browser: { not: null },
      },
      _count: {
        browser: true,
      },
      orderBy: {
        _count: {
          browser: 'desc',
        },
      },
      take: 5,
    })

    // Top devices
    const topDevices = await prisma.pageView.groupBy({
      by: ['device'],
      where: {
        createdAt: { gte: startDate },
        device: { not: null },
      },
      _count: {
        device: true,
      },
      orderBy: {
        _count: {
          device: 'desc',
        },
      },
    })

    // Top referrers
    const topReferrers = await prisma.pageView.groupBy({
      by: ['referrer'],
      where: {
        createdAt: { gte: startDate },
        referrer: { not: null },
      },
      _count: {
        referrer: true,
      },
      orderBy: {
        _count: {
          referrer: 'desc',
        },
      },
      take: 10,
    })

    // Visitor locations (country + city)
    const visitorLocations = await prisma.pageView.groupBy({
      by: ['country', 'city'],
      where: {
        createdAt: { gte: startDate },
        country: { not: null },
      },
      _count: {
        country: true,
      },
      orderBy: {
        _count: {
          country: 'desc',
        },
      },
      take: 50,
    })

    // Top countries
    const topCountries = await prisma.pageView.groupBy({
      by: ['country'],
      where: {
        createdAt: { gte: startDate },
        country: { not: null },
      },
      _count: {
        country: true,
      },
      orderBy: {
        _count: {
          country: 'desc',
        },
      },
      take: 10,
    })

    return NextResponse.json({
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      topPages: topPages.map((p) => ({
        path: p.pagePath,
        views: p._count.pagePath,
      })),
      viewsByDay: viewsByDay.map((d) => ({
        date: d.date,
        views: Number(d.count),
      })),
      topBrowsers: topBrowsers.map((b) => ({
        browser: b.browser,
        count: b._count.browser,
      })),
      topDevices: topDevices.map((d) => ({
        device: d.device || 'desktop',
        count: d._count.device,
      })),
      topReferrers: topReferrers.map((r) => ({
        referrer: r.referrer,
        count: r._count.referrer,
      })),
      visitorLocations: visitorLocations.map((l) => ({
        country: l.country,
        city: l.city,
        count: l._count.country,
      })),
      topCountries: topCountries.map((c) => ({
        country: c.country,
        count: c._count.country,
      })),
    })
  } catch (error) {
    console.error('Analytics stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'

