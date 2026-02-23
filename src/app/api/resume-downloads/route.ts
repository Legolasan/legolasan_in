import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const downloads = await prisma.resumeDownload.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Get stats
    const totalDownloads = await prisma.resumeDownload.count()

    // Get unique domains count
    const uniqueDomains = await prisma.resumeDownload.groupBy({
      by: ['domain'],
    })

    // Get downloads by domain (top 10)
    const downloadsByDomain = await prisma.resumeDownload.groupBy({
      by: ['domain'],
      _count: { domain: true },
      orderBy: { _count: { domain: 'desc' } },
      take: 10,
    })

    // Get downloads in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentDownloads = await prisma.resumeDownload.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    })

    return NextResponse.json({
      downloads,
      stats: {
        total: totalDownloads,
        uniqueDomains: uniqueDomains.length,
        last7Days: recentDownloads,
        topDomains: downloadsByDomain.map(d => ({
          domain: d.domain,
          count: d._count.domain,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching resume downloads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resume downloads' },
      { status: 500 }
    )
  }
}
