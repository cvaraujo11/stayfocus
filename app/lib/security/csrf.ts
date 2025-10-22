/**
 * CSRF Protection
 * Simple CSRF token generation and validation
 */

import { cookies } from 'next/headers'
import { isProduction } from '../env'

const CSRF_TOKEN_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Set CSRF token in cookies
 */
export async function setCsrfToken(): Promise<string> {
  const token = generateCsrfToken()
  const cookieStore = await cookies()
  
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
  })
  
  return token
}

/**
 * Validate CSRF token from request
 */
export async function validateCsrfToken(headerToken: string | null): Promise<boolean> {
  if (!headerToken) {
    return false
  }

  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_TOKEN_NAME)?.value

  if (!cookieToken) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(headerToken, cookieToken)
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Get CSRF token from cookies
 */
export async function getCsrfToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_TOKEN_NAME)?.value
}

export { CSRF_HEADER_NAME }
