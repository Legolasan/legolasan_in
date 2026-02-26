import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// GET current feature flag status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_RESUME_DOWNLOAD === 'true'

    return NextResponse.json({
      resumeAndServicesEnabled: isEnabled
    })
  } catch (error) {
    console.error('Error reading feature flags:', error)
    return NextResponse.json(
      { error: 'Failed to read feature flags' },
      { status: 500 }
    )
  }
}

// POST to update feature flag
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { enabled } = body

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Path to .env file
    const envPath = join(process.cwd(), '.env')

    try {
      // Read current .env file
      let envContent = readFileSync(envPath, 'utf8')

      // Update or add the feature flag
      const flagLine = `NEXT_PUBLIC_ENABLE_RESUME_DOWNLOAD=${enabled ? 'true' : 'false'}`
      const flagRegex = /NEXT_PUBLIC_ENABLE_RESUME_DOWNLOAD=.*/

      if (flagRegex.test(envContent)) {
        // Update existing line
        envContent = envContent.replace(flagRegex, flagLine)
      } else {
        // Add new line
        envContent += `\n${flagLine}\n`
      }

      // Write updated .env file
      writeFileSync(envPath, envContent, 'utf8')

      // Trigger rebuild and restart in background
      // Note: This is fire-and-forget, response returns immediately
      const isProduction = process.env.NODE_ENV === 'production'

      if (isProduction) {
        // In production, rebuild and restart PM2
        execAsync('npm run build && pm2 restart portfolio')
          .then(() => console.log('✅ App rebuilt and restarted successfully'))
          .catch(err => console.error('❌ Error rebuilding app:', err))
      }

      return NextResponse.json({
        success: true,
        message: enabled
          ? 'Resume and Services features enabled. Rebuilding app...'
          : 'Resume and Services features disabled. Rebuilding app...',
        enabled,
        rebuilding: isProduction
      })

    } catch (fileError) {
      console.error('Error updating .env file:', fileError)
      return NextResponse.json(
        { error: 'Failed to update .env file' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error updating feature flags:', error)
    return NextResponse.json(
      { error: 'Failed to update feature flags' },
      { status: 500 }
    )
  }
}
