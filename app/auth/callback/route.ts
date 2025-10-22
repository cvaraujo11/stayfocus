import { createSupabaseRouteHandler } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isDevelopment } from '@/app/lib/env'

/**
 * Validates that a redirect path is safe (internal only)
 * Prevents open redirect vulnerabilities by ensuring only relative paths are allowed
 * 
 * @param path - The path to validate
 * @returns A safe internal path or '/' as fallback
 */
function getSafeRedirectPath(path: string | null): string {
  // Default fallback
  if (!path) return '/'
  
  // Trim whitespace
  const trimmedPath = path.trim()
  
  // Reject empty strings
  if (!trimmedPath) return '/'
  
  // Must start with / (relative path)
  if (!trimmedPath.startsWith('/')) return '/'
  
  // Reject scheme-relative URLs (//evil.com)
  if (trimmedPath.startsWith('//')) return '/'
  
  // Reject any path that looks like it contains a protocol
  // This catches javascript:, data:, vbscript:, etc.
  if (trimmedPath.match(/^\/[a-z][a-z0-9+.-]*:/i)) return '/'
  
  // Path is safe - it's a relative internal path
  return trimmedPath
}

/**
 * OAuth callback route handler
 * Handles the callback from OAuth providers (Google) and email confirmation links
 * Exchanges the authorization code for a session and redirects to the dashboard
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const nextParam = requestUrl.searchParams.get('next')
  const next = getSafeRedirectPath(nextParam)

  if (code) {
    const supabase = createSupabaseRouteHandler()
    
    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        // Log errors only in development (LGPD/GDPR compliance)
        if (isDevelopment()) {
          console.error('Error exchanging code for session:', error)
        }
        // Redirect to login with error
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        )
      }
    } catch (error) {
      // Log errors only in development (LGPD/GDPR compliance)
      if (isDevelopment()) {
        console.error('Unexpected error during auth callback:', error)
      }
      return NextResponse.redirect(
        new URL('/login?error=authentication_failed', requestUrl.origin)
      )
    }
  }

  // Redirect to the dashboard or specified next URL after successful authentication
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
