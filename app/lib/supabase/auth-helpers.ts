/**
 * Secure Authentication Helpers
 * 
 * These helpers ensure secure authentication by always validating
 * with the Supabase Auth server instead of trusting cookies directly.
 */

import { createSupabaseServerComponent } from './server'
import { createSupabaseClient } from './client'
import type { User } from '@supabase/supabase-js'

/**
 * Get authenticated user (SERVER-SIDE)
 * 
 * ⚠️ ALWAYS use this instead of getSession() for authentication checks!
 * 
 * This validates the user with the Supabase Auth server, ensuring
 * the session hasn't been tampered with.
 * 
 * @returns User object if authenticated, null otherwise
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = createSupabaseServerComponent()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
  
  return user
}

/**
 * Get authenticated user (CLIENT-SIDE)
 * 
 * ⚠️ ALWAYS use this instead of getSession() for authentication checks!
 * 
 * @returns User object if authenticated, null otherwise
 */
export async function getAuthenticatedUserClient(): Promise<User | null> {
  const supabase = createSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
  
  return user
}

/**
 * Require authenticated user (SERVER-SIDE)
 * 
 * Throws an error if user is not authenticated.
 * Use this in Server Actions and API routes that require authentication.
 * 
 * @throws AuthenticationError if user is not authenticated
 * @returns User object
 */
export async function requireAuth(): Promise<User> {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

/**
 * Check if user is authenticated (SERVER-SIDE)
 * 
 * @returns true if user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthenticatedUser()
  return user !== null
}

/**
 * Check if user is authenticated (CLIENT-SIDE)
 * 
 * @returns true if user is authenticated, false otherwise
 */
export async function isAuthenticatedClient(): Promise<boolean> {
  const user = await getAuthenticatedUserClient()
  return user !== null
}
