'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEstudosStore } from '@/app/stores/estudosStore'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { SimuladoCard } from '@/app/components/estudos/SimuladoCard'
import { Button } from '@/app/components/ui/Button'
import { BackButton } from '@/app/components/common/BackButton'
import { EmptyState } from '@/app/components/common/EmptyState'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { Modal } from '@/app/components/ui/Modal'
import { Plus, FileText } from 'lucide-react'

/**
 * Página de listagem de simulados
 * Exibe todos os simulados criados pelo usuário
 */
export default function SimuladosPage() {
  const router = useRouter()
  const { simulados, loading, carregarSimulados, removerSimulado } = useEstudosStore()
  const [userId, setUserId] = useState<string | null>(null)
  const [simuladoParaRemover, setSimuladoParaRemover] = useState<string | null>(null)
  const [removendo, setRemovendo] = useState(false)

  // Carregar usuário e simulados
  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        await carregarSimulados(user.id)
      } else {
        router.push('/login')
      }
    }

    loadData()
  }, [carregarSimulados, router])

  // Separar simulados realizados e pendentes
  const simuladosRealizados = simulados.filter((s) => s.dataRealizacao !== null)
  const simuladosPendentes = simulados.filter((s) => s.dataRealizacao === null)

  // Handlers
  const handleCriarSimulado = () => {
    router.push('/estudos/simulados/criar')
  }

  const handleIniciarSimulado = (id: string) => {
    router.push(`/estudos/simulados/${id}`)
  }

  const handleVerResultado = (id: string) => {
    router.push(`/estudos/simulados/${id}/resultado`)
  }

  const handleRemover = async () => {
    if (!simuladoParaRemover) return

    setRemovendo(true)
    try {
      await removerSimulado(simuladoParaRemover)
      setSimuladoParaRemover(null)
    } catch (error) {
      console.error('Erro ao remover simulado:', error)
      alert('Erro ao remover simulado. Tente novamente.')
    } finally {
      setRemovendo(false)
    }
  }

  if (loading && simulados.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton href="/estudos" className="mb-4" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Simulados
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crie e realize simulados para testar seus conhecimentos
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleCriarSimulado}
          icon={<Plus className="h-5 w-5" />}
        >
          Criar Simulado
        </Button>
      </div>

      {/* Conteúdo */}
      {simulados.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          message="Nenhum simulado criado"
          description="Comece criando seu primeiro simulado para testar seus conhecimentos"
          action={{
            label: 'Criar Simulado',
            onClick: handleCriarSimulado,
          }}
        />
      ) : (
        <div className="space-y-8">
          {/* Simulados Pendentes */}
          {simuladosPendentes.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Pendentes ({simuladosPendentes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {simuladosPendentes.map((simulado) => (
                  <SimuladoCard
                    key={simulado.id}
                    simulado={simulado}
                    onStart={handleIniciarSimulado}
                    onDelete={(id) => setSimuladoParaRemover(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Simulados Realizados */}
          {simuladosRealizados.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Realizados ({simuladosRealizados.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {simuladosRealizados.map((simulado) => (
                  <SimuladoCard
                    key={simulado.id}
                    simulado={simulado}
                    onViewResult={handleVerResultado}
                    onDelete={(id) => setSimuladoParaRemover(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmação de remoção */}
      {simuladoParaRemover && (
        <Modal
          isOpen={true}
          onClose={() => setSimuladoParaRemover(null)}
          title="Remover Simulado?"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Tem certeza que deseja remover este simulado? Esta ação não pode ser desfeita.
            </p>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setSimuladoParaRemover(null)}
                disabled={removendo}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleRemover}
                disabled={removendo}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {removendo ? 'Removendo...' : 'Sim, Remover'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
