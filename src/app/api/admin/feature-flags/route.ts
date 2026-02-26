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

    const resumeEnabled = process.env.NEXT_PUBLIC_ENABLE_RESUME_DOWNLOAD === 'true'
    const servicesEnabled = process.env.NEXT_PUBLIC_ENABLE_SERVICES === 'true'

    return NextResponse.json({
      resumeDownloadEnabled: resumeEnabled,
      servicesEnabled: servicesEnabled
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
    const { flag, enabled } = body

    if (!flag || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected { flag: string, enabled: boolean }' },
        { status: 400 }
      )
    }

    // Validate flag name
    const validFlags = ['resumeDownload', 'services']
    if (!validFlags.includes(flag)) {
      return NextResponse.json(
        { error: `Invalid flag name. Must be one of: ${validFlags.join(', ')}` },
        { status: 400 }
      )
    }

    // Map flag names to env variable names
    const flagMapping: { [key: string]: string } = {
      resumeDownload: 'NEXT_PUBLIC_ENABLE_RESUME_DOWNLOAD',
      services: 'NEXT_PUBLIC_ENABLE_SERVICES'
    }

    const envVarName = flagMapping[flag]

    // Path to .env file
    const envPath = join(process.cwd(), '.env')

    try {
      // Read current .env file
      let envContent = readFileSync(envPath, 'utf8')

      // Update or add the feature flag
      const flagLine = `${envVarName}=${enabled ? 'true' : 'false'}`
      const flagRegex = new RegExp(`${envVarName}=.*`)

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

      const featureNames: { [key: string]: string } = {
        resumeDownload: 'Resume Download',
        services: 'Services Page'
      }

      return NextResponse.json({
        success: true,
        message: enabled
          ? `${featureNames[flag]} feature enabled. Rebuilding app...`
          : `${featureNames[flag]} feature disabled. Rebuilding app...`,
        flag,
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
