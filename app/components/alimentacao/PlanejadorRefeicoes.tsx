'use client'

import { useState, useEffect } from 'react'
import { Clock, Plus, Save, Trash2 } from 'lucide-react'
import { useAlimentacaoStore } from '@/app/stores/alimentacaoStore'
import { useAuth } from '@/app/contexts/AuthContext'
import { LoadingSpinner, ErrorMessage, EmptyState } from '@/app/components/common'

export function PlanejadorRefeicoes() {
  const { user } = useAuth()
  const { 
    refeicoes, 
    loadingPlanejamento, 
    errorPlanejamento,
    carregarPlanejamento,
    adicionarRefeicao, 
    atualizarRefeicao, 
    removerRefeicao,
    setupRealtimeSyncPlanejamento
  } = useAlimentacaoStore()
  const [novaRefeicao, setNovaRefeicao] = useState({ horario: '', descricao: '' })
  const [editando, setEditando] = useState<string | null>(null)

  // Carregar planejamento ao montar
  useEffect(() => {
    if (user?.id) {
      carregarPlanejamento(user.id)
    }
  }, [user?.id, carregarPlanejamento])

  // Setup real-time sync
  useEffect(() => {
    if (!user?.id) return
    
    const unsubscribe = setupRealtimeSyncPlanejamento(user.id)
    return () => unsubscribe()
  }, [user?.id, setupRealtimeSyncPlanejamento])

  const handleAdicionarRefeicao = async () => {
    if (!novaRefeicao.horario || !novaRefeicao.descricao) return

    try {
      await adicionarRefeicao(novaRefeicao.horario, novaRefeicao.descricao)
      setNovaRefeicao({ horario: '', descricao: '' })
    } catch (error) {
      console.error('Erro ao adicionar refeição:', error)
    }
  }

  const iniciarEdicao = (id: string, horario: string, descricao: string) => {
    setEditando(id)
    setNovaRefeicao({ horario, descricao })
  }

  const salvarEdicao = async () => {
    if (!editando || !novaRefeicao.horario || !novaRefeicao.descricao) return

    try {
      await atualizarRefeicao(editando, novaRefeicao.horario, novaRefeicao.descricao)
      setEditando(null)
      setNovaRefeicao({ horario: '', descricao: '' })
    } catch (error) {
      console.error('Erro ao atualizar refeição:', error)
    }
  }

  const cancelarEdicao = () => {
    setEditando(null)
    setNovaRefeicao({ horario: '', descricao: '' })
  }

  const handleRemover = async (id: string) => {
    try {
      await removerRefeicao(id)
    } catch (error) {
      console.error('Erro ao remover refeição:', error)
    }
  }

  if (loadingPlanejamento && refeicoes.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando planejamento...</span>
      </div>
    )
  }

  if (errorPlanejamento) {
    return (
      <ErrorMessage 
        message={errorPlanejamento} 
        onRetry={() => user?.id && carregarPlanejamento(user.id)} 
      />
    )
  }

  return (
    <div className="space-y-4">
      {refeicoes.length === 0 && !loadingPlanejamento && (
        <EmptyState
          message="Nenhum planejamento criado ainda"
          description="Adicione suas refeições planejadas para o dia"
          icon={<Clock className="h-12 w-12" />}
        />
      )}
      
      <div className="space-y-2">
        {refeicoes.map((refeicao) => (
          <div
            key={refeicao.id}
            className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center text-alimentacao-primary mr-3">
              <Clock className="h-5 w-5" />
            </div>
            
            {editando === refeicao.id ? (
              <>
                <input
                  type="time"
                  value={novaRefeicao.horario}
                  onChange={(e) => setNovaRefeicao({ ...novaRefeicao, horario: e.target.value })}
                  className="w-24 px-2 py-1 mr-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  value={novaRefeicao.descricao}
                  onChange={(e) => setNovaRefeicao({ ...novaRefeicao, descricao: e.target.value })}
                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  placeholder="Descrição da refeição"
                />
                <button
                  onClick={salvarEdicao}
                  className="ml-2 p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                  aria-label="Salvar edição"
                >
                  <Save className="h-5 w-5" />
                </button>
                <button
                  onClick={cancelarEdicao}
                  className="ml-1 p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Cancelar edição"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <span className="font-medium text-gray-700 dark:text-gray-300 w-16">
                  {refeicao.horario}
                </span>
                <span className="flex-1 text-gray-900 dark:text-white">
                  {refeicao.descricao}
                </span>
                <button
                  onClick={() => iniciarEdicao(refeicao.id, refeicao.horario, refeicao.descricao)}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label="Editar refeição"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleRemover(refeicao.id)}
                  className="ml-1 p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Remover refeição"
                  disabled={loadingPlanejamento}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Adicionar Nova Refeição
        </h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="time"
            value={novaRefeicao.horario}
            onChange={(e) => setNovaRefeicao({ ...novaRefeicao, horario: e.target.value })}
            className="w-full sm:w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            value={novaRefeicao.descricao}
            onChange={(e) => setNovaRefeicao({ ...novaRefeicao, descricao: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            placeholder="Descrição da refeição"
          />
          <button
            onClick={handleAdicionarRefeicao}
            disabled={!novaRefeicao.horario || !novaRefeicao.descricao || loadingPlanejamento}
            className="w-full sm:w-auto px-4 py-2 bg-alimentacao-primary text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loadingPlanejamento ? (
              <LoadingSpinner />
            ) : (
              <>
                <Plus className="h-5 w-5 inline mr-1" />
                Adicionar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
