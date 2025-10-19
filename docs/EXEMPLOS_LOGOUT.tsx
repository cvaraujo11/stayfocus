/**
 * EXEMPLOS DE USO - Componentes de Logout
 * 
 * Este arquivo demonstra diferentes formas de usar os componentes
 * de logout desenvolvidos para a aplicação StayFocus.
 */

import { useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { LogoutButton } from '@/app/components/layout/LogoutButton'
import { UserMenu } from '@/app/components/layout/UserMenu'

// ============================================================================
// EXEMPLO 1: UserMenu no Header (Implementação Atual)
// ============================================================================

export function HeaderExample() {
  return (
    <header className="flex items-center justify-between p-4">
      <div>Logo</div>
      <nav>Links</nav>
      
      {/* Menu completo do usuário com dropdown */}
      <UserMenu />
    </header>
  )
}

// ============================================================================
// EXEMPLO 2: LogoutButton - Variante Icon (Apenas Ícone)
// ============================================================================

export function SidebarExample() {
  return (
    <aside className="p-4">
      <nav>
        {/* Links do menu */}
      </nav>
      
      {/* Botão de logout minimalista */}
      <div className="mt-auto pt-4 border-t">
        <LogoutButton variant="icon" />
      </div>
    </aside>
  )
}

// ============================================================================
// EXEMPLO 3: LogoutButton - Variante Text (Apenas Texto)
// ============================================================================

export function ProfileMenuExample() {
  return (
    <div className="space-y-2">
      <button className="w-full text-left px-4 py-2">Meu Perfil</button>
      <button className="w-full text-left px-4 py-2">Configurações</button>
      
      {/* Botão de logout como link de texto */}
      <LogoutButton 
        variant="text" 
        className="w-full text-left"
      />
    </div>
  )
}

// ============================================================================
// EXEMPLO 4: LogoutButton - Variante Full (Ícone + Texto)
// ============================================================================

export function SettingsPageExample() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1>Configurações</h1>
      
      <div className="mt-8 space-y-4">
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-2">Sessão</h2>
          <p className="text-sm text-gray-600 mb-4">
            Sair da sua conta neste dispositivo
          </p>
          
          {/* Botão de logout completo e destacado */}
          <LogoutButton 
            variant="full"
            showConfirmation={true}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXEMPLO 5: LogoutButton com Confirmação
// ============================================================================

export function DangerZoneExample() {
  return (
    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <h3 className="text-red-800 dark:text-red-300 font-semibold mb-2">
        Zona de Perigo
      </h3>
      <p className="text-sm text-red-700 dark:text-red-400 mb-4">
        Ações irreversíveis
      </p>
      
      {/* Logout com confirmação obrigatória */}
      <LogoutButton 
        variant="full"
        showConfirmation={true}
        className="bg-red-700 hover:bg-red-800"
      />
    </div>
  )
}

// ============================================================================
// EXEMPLO 6: Menu Mobile com Logout
// ============================================================================

export function MobileMenuExample() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Menu
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50">
          <div className="flex flex-col h-full">
            {/* Header do menu mobile */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2>Menu</h2>
              <button onClick={() => setIsOpen(false)}>Fechar</button>
            </div>
            
            {/* Links do menu */}
            <nav className="flex-1 overflow-y-auto p-4">
              {/* ... links ... */}
            </nav>
            
            {/* Footer com logout */}
            <div className="p-4 border-t">
              <LogoutButton 
                variant="full"
                className="w-full justify-center"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ============================================================================
// EXEMPLO 7: Card de Perfil com Logout
// ============================================================================

export function ProfileCardExample() {
  const { user } = useAuth()
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* Avatar */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-16 w-16 rounded-full bg-perfil-primary text-white flex items-center justify-center text-2xl">
          {user?.email?.[0].toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold">{user?.email}</h3>
          <p className="text-sm text-gray-500">Usuário ativo</p>
        </div>
      </div>
      
      {/* Ações */}
      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 border rounded-lg">
          Editar Perfil
        </button>
        <LogoutButton 
          variant="icon"
          className="px-4"
        />
      </div>
    </div>
  )
}

// ============================================================================
// EXEMPLO 8: Lista de Sessões com Logout
// ============================================================================

export function SessionsListExample() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Sessões Ativas</h2>
      
      {/* Sessão atual */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Dispositivo Atual</p>
            <p className="text-sm text-gray-500">Chrome no Windows • Agora</p>
          </div>
          
          <LogoutButton 
            variant="text"
            showConfirmation={true}
          />
        </div>
      </div>
      
      {/* Outras sessões */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">iPhone</p>
            <p className="text-sm text-gray-500">Safari • 2 horas atrás</p>
          </div>
          
          <button className="text-sm text-red-600 hover:text-red-700">
            Encerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXEMPLO 9: Modal de Confirmação Custom
// ============================================================================

export function LogoutWithCustomModalExample() {
  const [showModal, setShowModal] = useState(false)
  const { signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      setIsLoggingOut(false)
    }
  }
  
  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Sair
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">
              Confirmar Logout
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja sair da sua conta?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
                disabled={isLoggingOut}
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isLoggingOut ? 'Saindo...' : 'Sair'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ============================================================================
// EXEMPLO 10: Logout com Toast Notification
// ============================================================================

export function LogoutWithToastExample() {
  const { signOut } = useAuth()
  const [showToast, setShowToast] = useState(false)
  
  const handleLogout = async () => {
    try {
      setShowToast(true)
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }
  
  return (
    <>
      <button onClick={handleLogout}>
        Sair
      </button>
      
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom">
          Saindo da conta...
        </div>
      )}
    </>
  )
}
