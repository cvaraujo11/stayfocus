'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, signOut } = useAuth()
  const router = useRouter()

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Fechar menu ao pressionar ESC
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
      // O redirecionamento já é feito dentro do signOut
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      setIsLoggingOut(false)
    }
  }

  // Pegar as iniciais do usuário
  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      }
      return names[0][0].toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  // Pegar o nome do usuário para exibir
  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'Usuário'
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Botão do menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-perfil-primary transition-colors"
        aria-label="Menu do usuário"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="h-8 w-8 rounded-full bg-perfil-primary hover:bg-perfil-secondary text-white flex items-center justify-center transition-colors">
          <span className="text-sm font-medium">{getUserInitials()}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Informações do usuário */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {getUserDisplayName()}
            </p>
            {user?.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {user.email}
              </p>
            )}
          </div>

          {/* Opções do menu */}
          <div className="py-1">
            <Link
              href="/perfil"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4 mr-3" aria-hidden="true" />
              <span>Meu Perfil</span>
            </Link>

            <Link
              href="/perfil/ajuda"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4 mr-3" aria-hidden="true" />
              <span>Configurações</span>
            </Link>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

          {/* Botão de Logout */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              role="menuitem"
            >
              <LogOut className="h-4 w-4 mr-3" aria-hidden="true" />
              <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
