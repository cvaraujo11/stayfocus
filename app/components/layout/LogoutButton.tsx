'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'

interface LogoutButtonProps {
  variant?: 'icon' | 'text' | 'full'
  className?: string
  showConfirmation?: boolean
}

export function LogoutButton({ 
  variant = 'icon', 
  className = '',
  showConfirmation = false 
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { signOut } = useAuth()

  const handleLogout = async () => {
    if (showConfirmation) {
      const confirmed = window.confirm('Tem certeza que deseja sair?')
      if (!confirmed) return
    }

    try {
      setIsLoggingOut(true)
      await signOut()
      // O redirecionamento já é feito dentro do signOut
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      setIsLoggingOut(false)
    }
  }

  // Variante apenas com ícone
  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`p-2 rounded-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
        aria-label={isLoggingOut ? 'Saindo...' : 'Sair da conta'}
        title={isLoggingOut ? 'Saindo...' : 'Sair'}
      >
        <LogOut 
          className={`h-5 w-5 ${isLoggingOut ? 'animate-pulse' : ''}`} 
          aria-hidden="true" 
        />
      </button>
    )
  }

  // Variante apenas com texto
  if (variant === 'text') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
        aria-label={isLoggingOut ? 'Saindo...' : 'Sair da conta'}
      >
        {isLoggingOut ? 'Saindo...' : 'Sair'}
      </button>
    )
  }

  // Variante completa (ícone + texto)
  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      aria-label={isLoggingOut ? 'Saindo...' : 'Sair da conta'}
    >
      <LogOut 
        className={`h-4 w-4 ${isLoggingOut ? 'animate-pulse' : ''}`} 
        aria-hidden="true" 
      />
      <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
    </button>
  )
}
