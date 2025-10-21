'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/app/contexts/AuthContext'
import { useEstudosStore } from '@/app/stores/estudosStore'
import { ConcursosList } from '@/app/components/estudos/ConcursosList'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { Button } from '@/app/components/ui/Button'
import { Modal } from '@/app/components/ui/Modal'
import { Plus, BookOpen, FileQuestion, ClipboardList, Clock } from 'lucide-react'
import { ConcursoFormData } from '@/app/types'

// Lazy load ConcursoForm - only loaded when modal is opened
const ConcursoForm = dynamic(
  () => import('@/app/components/estudos/ConcursoForm').then(mod => ({ default: mod.ConcursoForm })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

/**
 * Página principal do módulo de Estudos e Concursos
 * Exibe dashboard com estatísticas e lista de concursos
 */
export default function EstudosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const {
    concursos,
    questoes,
    simulados,
    loading,
    error,
    carregarConcursos,
    adicionarConcurso,
    atualizarConcurso,
    removerConcurso,
    setupRealtimeSync,
  } = useEstudosStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [concursoEditando, setConcursoEditando] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  
  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])
  
  // Carregar concursos quando o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      carregarConcursos(user.id)
    }
  }, [user, carregarConcursos])
  
  // Configurar sincronização em tempo real
  useEffect(() => {
    if (user) {
      const cleanup = setupRealtimeSync(user.id)
      return cleanup
    }
  }, [user, setupRealtimeSync])
  
  // Calcular estatísticas
  const concursosAtivos = concursos.filter(c => c.status === 'em_andamento').length
  const totalQuestoes = questoes.length
  const totalSimulados = simulados.length
  
  // Handler para adicionar concurso
  const handleAddConcurso = () => {
    setConcursoEditando(null)
    setIsModalOpen(true)
  }
  
  // Handler para editar concurso
  const handleEditConcurso = (id: string) => {
    setConcursoEditando(id)
    setIsModalOpen(true)
  }
  
  // Handler para excluir concurso
  const handleDeleteConcurso = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
      return
    }
    
    try {
      await removerConcurso(id)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Erro ao remover concurso:', error)
    }
  }
  
  // Handler para submeter formulário
  const handleSubmitForm = async (data: ConcursoFormData) => {
    setIsSubmitting(true)
    try {
      if (concursoEditando) {
        await atualizarConcurso(concursoEditando, data)
      } else {
        await adicionarConcurso({
          ...data,
          dataProva: data.dataProva || null,
          instituicao: data.instituicao || null,
          cargo: data.cargo || null
        })
      }
      setIsModalOpen(false)
      setConcursoEditando(null)
    } catch (error) {
      console.error('Erro ao salvar concurso:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Loading state durante autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  // Não renderizar se não autenticado (será redirecionado)
  if (!user) {
    return null
  }
  
  const concursoParaEditar = concursoEditando
    ? concursos.find(c => c.id === concursoEditando)
    : undefined
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              Estudos e Concursos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Organize seus estudos e acompanhe seu progresso
            </p>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="h-5 w-5" />}
            onClick={handleAddConcurso}
          >
            Adicionar Concurso
          </Button>
        </div>
      </div>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Concursos Ativos
              </h3>
              <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                {concursosAtivos}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Questões
              </h3>
              <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                {totalQuestoes}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <FileQuestion className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Simulados
              </h3>
              <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                {totalSimulados}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <ClipboardList className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Horas/Semana
              </h3>
              <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                0h
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Ações Rápidas */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Ações Rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/estudos/questoes')}
          >
            Adicionar Questão
          </Button>
          <Button
            variant="outline"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/estudos/simulados')}
          >
            Novo Simulado
          </Button>
          <Button
            variant="outline"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/estudos/registros')}
          >
            Registrar Estudo
          </Button>
        </div>
      </div>
      
      {/* Lista de Concursos */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Meus Concursos
        </h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        <ConcursosList
          concursos={concursos}
          loading={loading}
          onEdit={handleEditConcurso}
          onDelete={handleDeleteConcurso}
          onAddNew={handleAddConcurso}
        />
      </div>
      
      {/* Modal de Formulário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setConcursoEditando(null)
        }}
        title={concursoEditando ? 'Editar Concurso' : 'Adicionar Concurso'}
        size="lg"
      >
        <ConcursoForm
          concurso={concursoParaEditar}
          onSubmit={handleSubmitForm}
          onCancel={() => {
            setIsModalOpen(false)
            setConcursoEditando(null)
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  )
}
