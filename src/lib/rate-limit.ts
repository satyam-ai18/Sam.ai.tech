// In-memory rate limiting utility
// Sliding window rate limiter to protect authentication, admission, and complaint submissions

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

// Clean up stale keys periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    rateLimitMap.forEach((record, key) => {
      if (now > record.resetTime) {
        rateLimitMap.delete(key)
      }
    })
  }, 5 * 60 * 1000)
}

interface RateLimitConfig {
  limit?: number
  windowMs?: number
}

/**
 * Check if an IP or identifier has exceeded rate limits
 * Default: 60 requests per minute
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): { isRateLimited: boolean; remaining: number; resetTime: number } {
  const limit = config.limit || 60
  const windowMs = config.windowMs || 60 * 1000
  const now = Date.now()

  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      isRateLimited: false,
      remaining: limit - 1,
      resetTime: now + windowMs,
    }
  }

  record.count += 1

  if (record.count > limit) {
    return {
      isRateLimited: true,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  return {
    isRateLimited: false,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  }
}
