'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import type { User, Session, AuthError } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createSupabaseClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Provide user-friendly error messages
        if (error.message.includes('Invalid') || error.message.includes('invalid')) {
          return { error: 'Email ou senha incorretos' }
        }
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error signing in with email:', error)
      return { error: 'Erro ao fazer login. Tente novamente.' }
    }
  }

  const signUpWithEmail = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        // Provide user-friendly error messages
        if (error.message.includes('already registered')) {
          return { error: 'Este email já está cadastrado' }
        }
        if (error.message.includes('password')) {
          return { error: 'A senha deve ter no mínimo 6 caracteres' }
        }
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error signing up with email:', error)
      return { error: 'Erro ao criar conta. Tente novamente.' }
    }
  }

  const signOut = async () => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        throw error
      }

      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
