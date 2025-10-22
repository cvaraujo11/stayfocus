import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/app/types/database'
import { env, isDevelopment } from '@/app/lib/env'

/**
 * Middleware for route protection and authentication
 * - Verifies user session on every request
 * - Redirects unauthenticated users to /login for protected routes
 * - Redirects authenticated users away from /login and /registro to dashboard
 * - Refreshes expired tokens automatically
 */
export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Validate session authenticity
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = req.nextUrl

  // Debug logging only in development (LGPD/GDPR compliance - no PII in production logs)
  if (isDevelopment()) {
    console.log('🔒 Middleware:', {
      pathname,
      hasUser: !!user,
      isProtectedRoute: !['/login', '/registro', '/auth/callback', '/termos-de-uso', '/politica-de-privacidade', '/changelog'].some(
        (route) => pathname.startsWith(route)
      ),
    })
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/registro', '/auth/callback', '/termos-de-uso', '/politica-de-privacidade', '/changelog']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // If user is authenticated and trying to access login/registro, redirect to dashboard
  if (user && isPublicRoute && pathname !== '/auth/callback') {
    // Debug logging only in development
    if (isDevelopment()) {
      console.log('🔒 Middleware: Redirecionando usuário autenticado para /')
    }
    const redirectUrl = new URL('/', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is not authenticated and trying to access protected route, redirect to login
  if (!user && !isPublicRoute) {
    // Debug logging only in development
    if (isDevelopment()) {
      console.log('🔒 Middleware: Redirecionando usuário não autenticado para /login')
    }
    const redirectUrl = new URL('/login', req.url)
    // Store the original URL to redirect back after login
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

/**
 * Configure which routes the middleware should run on
 * Excludes static files, images, and Next.js internal routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png, favicon.svg (favicon files)
     * - public folder files (images, sounds, etc.)
     * - api routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|ogg)$).*)',
  ],
}
