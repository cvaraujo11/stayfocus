'use client'

import { useState, useEffect } from 'react'
import { usePerfilStore } from '../../stores/perfilStore'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorMessage } from '../common/ErrorMessage'
import { Save, User, Edit } from 'lucide-react'

export function InformacoesPessoais() {
  const { user } = useAuth()
  const { nome, loading, error, carregarPerfil, atualizarNome } = usePerfilStore()
  const [novoNome, setNovoNome] = useState(nome)
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (user) {
      carregarPerfil(user.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    setNovoNome(nome)
  }, [nome])

  const iniciarEdicao = () => {
    setNovoNome(nome)
    setEditando(true)
  }

  const salvarAlteracoes = async () => {
    if (novoNome.trim()) {
      setSalvando(true)
      await atualizarNome(novoNome.trim())
      setSalvando(false)
    }
    setEditando(false)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <LoadingSpinner size="md" label="Carregando informações..." />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <User className="h-5 w-5 mr-2 text-perfil-primary" />
        Informações Básicas
      </h2>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => user && carregarPerfil(user.id)}
          className="mb-4"
        />
      )}

      <div className="space-y-4">
        {/* Nome do usuário */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome
          </label>

          {editando ? (
            <div className="flex items-center">
              <input
                type="text"
                id="nome"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:border-perfil-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Seu nome"
                maxLength={30}
                required
                disabled={salvando}
              />

              <button
                onClick={salvarAlteracoes}
                disabled={salvando}
                className="ml-2 p-2 text-white bg-perfil-primary rounded-md hover:bg-perfil-secondary focus:outline-none focus:ring-2 focus:ring-perfil-primary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Salvar nome"
              >
                {salvando ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-gray-800 dark:text-white text-lg">{nome}</p>

              <button
                onClick={iniciarEdicao}
                className="p-2 text-gray-500 hover:text-perfil-primary focus:outline-none focus:ring-2 focus:ring-perfil-primary rounded-md"
                aria-label="Editar nome"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Seu nome é usado para personalizar a experiência no Painel ND.
            As informações pessoais são armazenadas de forma segura.
          </p>
        </div>
      </div>
    </div>
  )
}
