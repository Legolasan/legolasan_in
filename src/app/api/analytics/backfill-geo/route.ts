import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getGeoFromIP } from '@/lib/geoLookup'

// Backfill geo data for existing PageView and ChatSession records
export async function POST(request: NextRequest) {
  // Only admin can run backfill
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type = 'pageviews', batchSize = 50 } = body

    let updated = 0
    let skipped = 0
    let failed = 0

    if (type === 'pageviews' || type === 'all') {
      // Get PageViews without geo data but with session info
      // We'll try to get unique IPs from sessions that have pageviews
      const pageViewsToUpdate = await prisma.pageView.findMany({
        where: {
          country: null,
          sessionId: { not: null },
        },
        select: {
          id: true,
          sessionId: true,
        },
        take: batchSize,
      })

      // Get unique session IDs
      const sessionIds = [...new Set(pageViewsToUpdate.map(pv => pv.sessionId).filter(Boolean))]

      // Try to get geo data from chat sessions that might have IP
      for (const pv of pageViewsToUpdate) {
        try {
          // Check if we have a chat session with this session ID that has IP
          const chatSession = await prisma.chatSession.findFirst({
            where: {
              sessionId: pv.sessionId || '',
              ipAddress: { not: null },
            },
            select: {
              ipAddress: true,
              country: true,
              city: true,
            },
          })

          if (chatSession?.country && chatSession?.city) {
            // Use existing geo data from chat session
            await prisma.pageView.update({
              where: { id: pv.id },
              data: {
                country: chatSession.country,
                city: chatSession.city,
              },
            })
            updated++
          } else if (chatSession?.ipAddress) {
            // Fetch geo data from IP
            const geoData = await getGeoFromIP(chatSession.ipAddress)
            if (geoData.country) {
              await prisma.pageView.update({
                where: { id: pv.id },
                data: {
                  country: geoData.country,
                  city: geoData.city,
                },
              })
              updated++
            } else {
              skipped++
            }
          } else {
            skipped++
          }

          // Rate limit: ip-api.com allows 45 req/min
          await new Promise(resolve => setTimeout(resolve, 1500))
        } catch (error) {
          failed++
        }
      }
    }

    if (type === 'chatsessions' || type === 'all') {
      // Get ChatSessions without geo data but with IP
      const chatSessionsToUpdate = await prisma.chatSession.findMany({
        where: {
          country: null,
          ipAddress: { not: null },
        },
        select: {
          id: true,
          ipAddress: true,
        },
        take: batchSize,
      })

      for (const cs of chatSessionsToUpdate) {
        try {
          if (cs.ipAddress) {
            const geoData = await getGeoFromIP(cs.ipAddress)
            if (geoData.country) {
              await prisma.chatSession.update({
                where: { id: cs.id },
                data: {
                  country: geoData.country,
                  city: geoData.city,
                },
              })
              updated++
            } else {
              skipped++
            }
          }

          // Rate limit
          await new Promise(resolve => setTimeout(resolve, 1500))
        } catch (error) {
          failed++
        }
      }
    }

    // Get remaining counts
    const remainingPageViews = await prisma.pageView.count({
      where: { country: null },
    })
    const remainingChatSessions = await prisma.chatSession.count({
      where: { country: null, ipAddress: { not: null } },
    })

    return NextResponse.json({
      success: true,
      updated,
      skipped,
      failed,
      remaining: {
        pageViews: remainingPageViews,
        chatSessions: remainingChatSessions,
      },
    })
  } catch (error) {
    console.error('Backfill error:', error)
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
