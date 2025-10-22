/**
 * Rate Limiting
 * Simple in-memory rate limiter for API protection
 * For production, consider using Redis or Upstash
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Maximum requests per interval
}

export const rateLimitConfigs = {
  // Authentication endpoints
  auth: {
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  // General API endpoints
  api: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  // Strict endpoints (e.g., password reset)
  strict: {
    interval: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 attempts per hour
  },
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns true if request is allowed, throws RateLimitError if exceeded
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = rateLimitConfigs.api
): boolean {
  const now = Date.now()
  const key = `${identifier}`

  // Initialize or get existing entry
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.interval,
    }
    return true
  }

  // Increment count
  store[key].count++

  // Check if limit exceeded
  if (store[key].count > config.maxRequests) {
    const retryAfter = Math.ceil((store[key].resetTime - now) / 1000)
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      retryAfter
    )
  }

  return true
}

/**
 * Get rate limit status for an identifier
 */
export function getRateLimitStatus(identifier: string) {
  const now = Date.now()
  const key = `${identifier}`
  const entry = store[key]

  if (!entry || entry.resetTime < now) {
    return {
      remaining: rateLimitConfigs.api.maxRequests,
      reset: now + rateLimitConfigs.api.interval,
    }
  }

  return {
    remaining: Math.max(0, rateLimitConfigs.api.maxRequests - entry.count),
    reset: entry.resetTime,
  }
}

/**
 * Reset rate limit for an identifier (useful for testing)
 */
export function resetRateLimit(identifier: string): void {
  delete store[identifier]
}
