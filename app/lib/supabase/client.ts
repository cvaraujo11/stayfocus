import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/app/types/database'

/**
 * Create a Supabase client for use in Client Components
 * This client automatically handles authentication state and cookies
 * Uses @supabase/ssr for proper cookie management
 */
export function createSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Get the current Supabase client instance
 * Use this in client components to interact with Supabase
 */
export const supabase = createSupabaseClient()
