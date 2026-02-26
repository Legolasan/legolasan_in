import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Personal email domains to block
const BLOCKED_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.co.in',
  'hotmail.com',
  'hotmail.co.uk',
  'outlook.com',
  'outlook.co.uk',
  'live.com',
  'live.co.uk',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'ymail.com',
  'msn.com',
  'zoho.com',
  'gmx.com',
  'gmx.net',
  'fastmail.com',
  'tutanota.com',
  'hey.com',
  'pm.me',
  'yandex.com',
  'rediffmail.com',
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
])

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() || ''
}

function isBusinessEmail(email: string): boolean {
  const domain = extractDomain(email)
  return !BLOCKED_DOMAINS.has(domain)
}

export async function POST(request: NextRequest) {
  // Feature flag check - early return if disabled
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_RESUME_DOWNLOAD === 'true'
  if (!isEnabled) {
    return NextResponse.json(
      { error: 'Resume download is currently disabled' },
      { status: 503 } // 503 Service Unavailable
    )
  }

  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if it's a business email
    if (!isBusinessEmail(trimmedEmail)) {
      return NextResponse.json(
        { 
          error: 'Please use your work email. This resume is intended for professional/recruitment purposes only.',
          code: 'PERSONAL_EMAIL'
        },
        { status: 400 }
      )
    }

    const domain = extractDomain(trimmedEmail)

    // Get IP and user agent for analytics
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : null
    const userAgent = request.headers.get('user-agent')

    // Store the download request
    await prisma.resumeDownload.create({
      data: {
        email: trimmedEmail,
        domain,
        ipAddress,
        userAgent,
      },
    })

    return NextResponse.json({ 
      success: true,
      downloadUrl: '/resume.pdf'
    })

  } catch (error) {
    console.error('Resume request error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

