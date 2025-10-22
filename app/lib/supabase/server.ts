import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/app/types/database'
import { env } from '@/app/lib/env'

/**
 * Create a Supabase client for use in Server Components
 * This client automatically handles authentication state via cookies
 * 
 * Usage in Server Components:
 * ```typescript
 * const supabase = createSupabaseServerComponent()
 * const { data } = await supabase.from('table').select()
 * ```
 */
export function createSupabaseServerComponent() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Create a Supabase client for use in Route Handlers (API routes)
 * This client automatically handles authentication state via cookies
 * 
 * Usage in Route Handlers:
 * ```typescript
 * import { createSupabaseRouteHandler } from '@/app/lib/supabase/server'
 * 
 * export async function GET(request: Request) {
 *   const supabase = createSupabaseRouteHandler()
 *   const { data } = await supabase.from('table').select()
 *   return Response.json(data)
 * }
 * ```
 */
export function createSupabaseRouteHandler() {
  return createSupabaseServerComponent()
}
