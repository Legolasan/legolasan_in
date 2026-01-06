/**
 * Simple in-memory rate limiter for API routes
 * 
 * Usage:
 * const limiter = createRateLimiter({ limit: 10, windowMs: 60000 })
 * 
 * In your API route:
 * const { success, remaining } = limiter.check(ip)
 * if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

interface RateLimiterConfig {
  limit: number      // Max requests per window
  windowMs: number   // Window size in milliseconds
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map()
  private limit: number
  private windowMs: number

  constructor(config: RateLimiterConfig) {
    this.limit = config.limit
    this.windowMs = config.windowMs

    // Cleanup old records every minute
    setInterval(() => this.cleanup(), 60000)
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now()
    const record = this.records.get(identifier)

    // If no record or window has expired, create new record
    if (!record || now > record.resetTime) {
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + this.windowMs,
      }
      this.records.set(identifier, newRecord)
      return {
        success: true,
        remaining: this.limit - 1,
        resetTime: newRecord.resetTime,
      }
    }

    // If within window, check limit
    if (record.count >= this.limit) {
      return {
        success: false,
        remaining: 0,
        resetTime: record.resetTime,
      }
    }

    // Increment count
    record.count++
    return {
      success: true,
      remaining: this.limit - record.count,
      resetTime: record.resetTime,
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, record] of this.records.entries()) {
      if (now > record.resetTime) {
        this.records.delete(key)
      }
    }
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // Strict: 10 requests per minute (for sensitive operations)
  strict: new RateLimiter({ limit: 10, windowMs: 60 * 1000 }),
  
  // Standard: 30 requests per minute (for general API calls)
  standard: new RateLimiter({ limit: 30, windowMs: 60 * 1000 }),
  
  // Relaxed: 60 requests per minute (for public data)
  relaxed: new RateLimiter({ limit: 60, windowMs: 60 * 1000 }),
  
  // Chat: 20 requests per minute (for AI chat)
  chat: new RateLimiter({ limit: 20, windowMs: 60 * 1000 }),
  
  // Analytics: 100 requests per minute (high volume tracking)
  analytics: new RateLimiter({ limit: 100, windowMs: 60 * 1000 }),
}

// Helper to get client IP from request headers
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Factory function for custom limiters
export function createRateLimiter(config: RateLimiterConfig): RateLimiter {
  return new RateLimiter(config)
}

