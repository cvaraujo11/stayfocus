/**
 * Environment Variables Validation
 * Validates and exports environment variables with type safety
 */

import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  
  // Base URL
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const serverEnvSchema = envSchema.extend({
  // Server-only variables
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  PPLX_API_KEY: z.string().optional(),
})

// Validate environment variables
function validateEnv() {
  try {
    const env = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    })
    return env
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    throw new Error('Invalid environment variables')
  }
}

function validateServerEnv() {
  try {
    const env = serverEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      SESSION_SECRET: process.env.SESSION_SECRET,
      PPLX_API_KEY: process.env.PPLX_API_KEY,
    })
    return env
  } catch (error) {
    console.error('❌ Invalid server environment variables:', error)
    throw new Error('Invalid server environment variables')
  }
}

// Export validated environment variables
export const env = validateEnv()
export const serverEnv = typeof window === 'undefined' ? validateServerEnv() : null

// Helper to get base URL with fallback
export const getBaseUrl = () => {
  return env.NEXT_PUBLIC_BASE_URL || 'https://stayfocus-alpha.vercel.app'
}

// Helper to check if in production
export const isProduction = () => env.NODE_ENV === 'production'
export const isDevelopment = () => env.NODE_ENV === 'development'
