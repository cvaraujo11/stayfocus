'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { AuthProvider } from '@/app/contexts/AuthContext'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <AuthProvider>
      <NextThemesProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem 
        disableTransitionOnChange
        {...props}
      >
        <div suppressHydrationWarning>
          {children}
        </div>
      </NextThemesProvider>
    </AuthProvider>
  )
}
