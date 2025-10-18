import { createSupabaseRouteHandler } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * OAuth callback route handler
 * Handles the callback from OAuth providers (Google) and email confirmation links
 * Exchanges the authorization code for a session and redirects to the dashboard
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createSupabaseRouteHandler()
    
    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        // Redirect to login with error
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        )
      }
    } catch (error) {
      console.error('Unexpected error during auth callback:', error)
      return NextResponse.redirect(
        new URL('/login?error=authentication_failed', requestUrl.origin)
      )
    }
  }

  // Redirect to the dashboard or specified next URL after successful authentication
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
