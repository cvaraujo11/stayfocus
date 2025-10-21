'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useEstudosStore } from '@/app/stores/estudosStore'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { carregarQuestoesSimulado } from '@/app/lib/supabase/simulados'
import { BackButton } from '@/app/components/common/BackButton'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { EmptyState } from '@/app/components/common/EmptyState'
import { Simulado, Questao, RespostaSimulado } from '@/app/types'
import { AlertTriangle } from 'lucide-react'

// Lazy load SimuladoPlayer - heavy component with timer and state management
const SimuladoPlayer = dynamic(
  () => import('@/app/components/estudos/SimuladoPlayer').then(mod => ({ default: mod.SimuladoPlayer })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
)

/**
 * Página de realização de simulado
 * Exibe o player para responder as questões
 */
export default function SimuladoPlayerPage() {
  const router = useRouter()
  const params = useParams()
  const simuladoId = params?.id as string

  const { finalizarSimulado } = useEstudosStore()
  const [simulado, setSimulado] = useState<Simulado | null>(null)
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar simulado e questões
  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        // Carregar simulado
        const { data: simuladoData, error: simuladoError } = await supabase
          .from('estudos_simulados')
          .select('*')
          .eq('id', simuladoId)
          .eq('user_id', user.id)
          .single()

        if (simuladoError || !simuladoData) {
          setError('Simulado não encontrado')
          setLoading(false)
          return
        }

        // Verificar se já foi realizado
        if (simuladoData.data_realizacao) {
          router.push(`/estudos/simulados/${simuladoId}/resultado`)
          return
        }

        // Mapear simulado
        const simuladoMapeado: Simulado = {
          id: simuladoData.id,
          userId: simuladoData.user_id,
          concursoId: simuladoData.concurso_id,
          titulo: simuladoData.titulo,
          questoesIds: simuladoData.questoes_ids || [],
          dataRealizacao: simuladoData.data_realizacao,
          tempoLimiteMinutos: simuladoData.tempo_limite_minutos,
          acertos: simuladoData.acertos,
          totalQuestoes: simuladoData.total_questoes,
          createdAt: simuladoData.created_at,
        }

        setSimulado(simuladoMapeado)

        // Carregar questões
        const questoesCarregadas = await carregarQuestoesSimulado(simuladoId, user.id)
        setQuestoes(questoesCarregadas)

        setLoading(false)
      } catch (err) {
        console.error('Erro ao carregar simulado:', err)
        setError('Erro ao carregar simulado')
        setLoading(false)
      }
    }

    loadData()
  }, [simuladoId, router])

  // Handler de finalização
  const handleFinish = async (respostas: RespostaSimulado[]) => {
    try {
      await finalizarSimulado(simuladoId, respostas)
      router.push(`/estudos/simulados/${simuladoId}/resultado`)
    } catch (error) {
      console.error('Erro ao finalizar simulado:', error)
      alert('Erro ao finalizar simulado. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !simulado || questoes.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton href="/estudos/simulados" className="mb-4" />
        <EmptyState
          icon={<AlertTriangle className="h-16 w-16" />}
          message={error || 'Simulado não encontrado'}
          description="Não foi possível carregar o simulado. Verifique se ele existe e tente novamente."
          action={{
            label: 'Voltar para Simulados',
            onClick: () => router.push('/estudos/simulados'),
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-4">
        <BackButton href="/estudos/simulados" />
      </div>
      <SimuladoPlayer simulado={simulado} questoes={questoes} onFinish={handleFinish} />
    </div>
  )
}
