'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { carregarQuestoesSimulado, calcularResultado } from '@/app/lib/supabase/simulados'
import { BackButton } from '@/app/components/common/BackButton'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { EmptyState } from '@/app/components/common/EmptyState'
import { Button } from '@/app/components/ui/Button'
import { Simulado, Questao, ResultadoSimulado as ResultadoSimuladoType, RespostaSimulado } from '@/app/types'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

// Lazy load SimuladoResultado - heavy component with charts and statistics
const SimuladoResultado = dynamic(
  () => import('@/app/components/estudos/SimuladoResultado').then(mod => ({ default: mod.SimuladoResultado })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
)

/**
 * Página de resultado do simulado
 * Exibe o desempenho e correção detalhada
 */
export default function ResultadoSimuladoPage() {
  const router = useRouter()
  const params = useParams()
  const simuladoId = params?.id as string

  const [simulado, setSimulado] = useState<Simulado | null>(null)
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [resultado, setResultado] = useState<ResultadoSimuladoType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados
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

        // Verificar se foi realizado
        if (!simuladoData.data_realizacao) {
          router.push(`/estudos/simulados/${simuladoId}`)
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

        // Reconstruir resultado a partir dos dados salvos
        // Como não salvamos as respostas individuais no banco, vamos criar um resultado básico
        // Em uma implementação completa, você salvaria as respostas em uma tabela separada
        const respostasReconstruidas: RespostaSimulado[] = questoesCarregadas.map((q) => ({
          questaoId: q.id,
          respostaSelecionada: 'A' as any, // Placeholder - idealmente seria salvo
          correta: false, // Será calculado
        }))

        const resultadoCalculado = calcularResultado(
          simuladoId,
          respostasReconstruidas,
          questoesCarregadas
        )

        // Ajustar com dados reais do banco
        resultadoCalculado.acertos = simuladoData.acertos || 0
        resultadoCalculado.totalQuestoes = simuladoData.total_questoes || questoesCarregadas.length
        resultadoCalculado.percentual =
          resultadoCalculado.totalQuestoes > 0
            ? (resultadoCalculado.acertos / resultadoCalculado.totalQuestoes) * 100
            : 0

        setResultado(resultadoCalculado)
        setLoading(false)
      } catch (err) {
        console.error('Erro ao carregar resultado:', err)
        setError('Erro ao carregar resultado')
        setLoading(false)
      }
    }

    loadData()
  }, [simuladoId, router])

  // Handlers
  const handleRefazer = () => {
    // Criar novo simulado com as mesmas questões
    router.push('/estudos/simulados/criar')
  }

  const handleRevisarErradas = () => {
    // Navegar para questões (futura implementação)
    router.push('/estudos/questoes')
  }

  const handleExportarPDF = () => {
    // Implementação futura de exportação para PDF
    alert('Funcionalidade de exportação para PDF em desenvolvimento')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !simulado || !resultado || questoes.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton href="/estudos/simulados" className="mb-4" />
        <EmptyState
          icon={<AlertTriangle className="h-16 w-16" />}
          message={error || 'Resultado não encontrado'}
          description="Não foi possível carregar o resultado do simulado."
          action={{
            label: 'Voltar para Simulados',
            onClick: () => router.push('/estudos/simulados'),
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <BackButton href="/estudos/simulados" className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {simulado.titulo}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Realizado em{' '}
            {simulado.dataRealizacao &&
              new Date(simulado.dataRealizacao).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
          </p>
        </div>

        {/* Resultado */}
        <SimuladoResultado
          resultado={resultado}
          questoes={questoes}
          onRefazer={handleRefazer}
          onRevisarErradas={handleRevisarErradas}
          onExportarPDF={handleExportarPDF}
        />
      </div>
    </div>
  )
}
