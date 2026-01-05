import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { personalInfo, experiences, skills, projects, education } from '@/lib/data'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 20 // requests per window
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }
  
  if (record.count >= RATE_LIMIT) {
    return false
  }
  
  record.count++
  return true
}

// Build context from portfolio data
function buildContext(): string {
  const experienceText = experiences.map(exp => 
    `${exp.position} at ${exp.company} (${exp.duration}): ${exp.description.join(' ')}`
  ).join('\n\n')

  const skillsText = skills.map(s => `${s.name} (${s.category})`).join(', ')

  const projectsText = projects.map(p => 
    `${p.title}: ${p.description} [Technologies: ${p.technologies.join(', ')}]`
  ).join('\n\n')

  const educationText = education.map(e => 
    `${e.degree} in ${e.field} from ${e.institution} (${e.duration})`
  ).join('\n')

  return `
## About ${personalInfo.name}
Title: ${personalInfo.title}
Location: ${personalInfo.location}
Bio: ${personalInfo.bio}
${personalInfo.bioExtended ? personalInfo.bioExtended.join(' ') : ''}

## Professional Experience
${experienceText}

## Skills
${skillsText}

## Projects
${projectsText}

## Education
${educationText}
`
}

const SYSTEM_PROMPT = `You are a helpful AI assistant on ${personalInfo.name}'s portfolio website. Your role is to answer questions about ${personalInfo.name}'s professional background, experience, skills, and projects.

Here is the context about ${personalInfo.name}:
${buildContext()}

Guidelines:
- Be friendly, professional, and conversational
- Answer questions ONLY about ${personalInfo.name}'s professional background using the context provided
- Keep responses concise (2-3 sentences typically, unless more detail is specifically requested)
- If asked about something not in the context, politely say you can only answer questions about ${personalInfo.name}'s professional background
- If asked to do something unrelated (like write code, solve math problems, etc.), politely redirect to questions about the portfolio
- Use first person when referring to ${personalInfo.name} (e.g., "I have experience with..." instead of "${personalInfo.name} has experience with...")
- Be enthusiastic about ${personalInfo.name}'s achievements and experience
- For contact inquiries, suggest using the contact form on the website or emailing ${personalInfo.email}`

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      )
    }

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      )
    }

    // Limit conversation history to last 10 messages to control costs
    const recentMessages = messages.slice(-10)

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...recentMessages,
      ],
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    })

    // Create a readable stream for the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    
    if (error?.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Chat service is not configured. Please contact the site owner.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

