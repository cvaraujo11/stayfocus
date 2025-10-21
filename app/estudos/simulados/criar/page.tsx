'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useEstudosStore } from '@/app/stores/estudosStore'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { SimuladoFormData } from '@/app/types'
import { BackButton } from '@/app/components/common/BackButton'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'

// Lazy load SimuladoForm - large form component with question selection
const SimuladoForm = dynamic(
  () => import('@/app/components/estudos/SimuladoForm').then(mod => ({ default: mod.SimuladoForm })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

/**
 * Página de criação de simulado
 * Permite criar um novo simulado selecionando questões
 */
export default function CriarSimuladoPage() {
  const router = useRouter()
  const { concursos, questoes, carregarConcursos, carregarQuestoes, criarSimulado } =
    useEstudosStore()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Carregar dados necessários
  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        await Promise.all([carregarConcursos(user.id), carregarQuestoes(user.id)])
      } else {
        router.push('/login')
      }

      setLoading(false)
    }

    loadData()
  }, [carregarConcursos, carregarQuestoes, router])

  // Handler de submit
  const handleSubmit = async (data: SimuladoFormData) => {
    try {
      await criarSimulado({
        concursoId: data.concursoId || null,
        titulo: data.titulo,
        questoesIds: data.questoesIds,
        tempoLimiteMinutos: data.tempoLimiteMinutos || null,
        dataRealizacao: null,
        acertos: null,
        totalQuestoes: null
      })
      router.push('/estudos/simulados')
    } catch (error) {
      console.error('Erro ao criar simulado:', error)
      alert('Erro ao criar simulado. Tente novamente.')
    }
  }

  // Handler de cancelar
  const handleCancel = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <BackButton href="/estudos/simulados" className="mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Criar Simulado
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure seu simulado selecionando as questões e definindo o tempo limite
        </p>
      </div>

      {/* Formulário */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <SimuladoForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          concursos={concursos}
          questoes={questoes}
        />
      </div>
    </div>
  )
}
