'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Plus, BookOpen } from 'lucide-react'
import { useEstudosStore } from '@/app/stores/estudosStore'
import { Button } from '@/app/components/ui/Button'
import { BackButton } from '@/app/components/common/BackButton'
import { Modal } from '@/app/components/ui/Modal'
import { QuestoesList } from '@/app/components/estudos/QuestoesList'
import { QuestaoViewer } from '@/app/components/estudos/QuestaoViewer'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import type { Questao, QuestaoFormData } from '@/app/types'

// Lazy load QuestaoForm - large form component
const QuestaoForm = dynamic(
  () => import('@/app/components/estudos/QuestaoForm').then(mod => ({ default: mod.QuestaoForm })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

/**
 * Página de Questões - Gerenciamento do banco de questões
 * 
 * Features:
 * - Lista de questões com filtros
 * - Modal para adicionar/editar questão
 * - Modal para visualizar questão completa
 * - Integração com store Zustand
 */
export default function QuestoesPage() {
  const {
    questoes,
    concursos,
    loading,
    error,
    carregarQuestoes,
    carregarConcursos,
    adicionarQuestao,
    atualizarQuestao,
    removerQuestao,
  } = useEstudosStore()
  
  const [userId, setUserId] = useState<string | null>(null)
  const [modalFormAberto, setModalFormAberto] = useState(false)
  const [modalViewAberto, setModalViewAberto] = useState(false)
  const [questaoSelecionada, setQuestaoSelecionada] = useState<Questao | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
        await Promise.all([
          carregarQuestoes(user.id),
          carregarConcursos(user.id),
        ])
      }
    }
    
    loadData()
  }, [carregarQuestoes, carregarConcursos])
  
  // Abrir modal para adicionar questão
  const handleAdicionarQuestao = () => {
    setQuestaoSelecionada(null)
    setModoEdicao(false)
    setModalFormAberto(true)
  }
  
  // Abrir modal para editar questão
  const handleEditarQuestao = (id: string) => {
    const questao = questoes.find(q => q.id === id)
    if (questao) {
      setQuestaoSelecionada(questao)
      setModoEdicao(true)
      setModalFormAberto(true)
    }
  }
  
  // Abrir modal para visualizar questão
  const handleVisualizarQuestao = (id: string) => {
    const questao = questoes.find(q => q.id === id)
    if (questao) {
      setQuestaoSelecionada(questao)
      setModalViewAberto(true)
    }
  }
  
  // Excluir questão
  const handleExcluirQuestao = async (id: string) => {
    const questao = questoes.find(q => q.id === id)
    if (!questao) return
    
    const confirmacao = window.confirm(
      `Tem certeza que deseja excluir esta questão?\n\nDisciplina: ${questao.disciplina}\nEnunciado: ${questao.enunciado.substring(0, 100)}...`
    )
    
    if (confirmacao) {
      try {
        await removerQuestao(id)
      } catch (error) {
        console.error('Erro ao excluir questão:', error)
        alert('Erro ao excluir questão. Tente novamente.')
      }
    }
  }
  
  // Submeter formulário (adicionar ou editar)
  const handleSubmitForm = async (data: QuestaoFormData) => {
    setIsSubmitting(true)
    
    try {
      if (modoEdicao && questaoSelecionada) {
        await atualizarQuestao(questaoSelecionada.id, data)
      } else {
        await adicionarQuestao({
          ...data,
          tags: data.tags || [],
          concursoId: data.concursoId || null,
          explicacao: data.explicacao || null
        })
      }
      
      setModalFormAberto(false)
      setQuestaoSelecionada(null)
    } catch (error) {
      console.error('Erro ao salvar questão:', error)
      alert('Erro ao salvar questão. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Fechar modais
  const handleFecharModalForm = () => {
    if (!isSubmitting) {
      setModalFormAberto(false)
      setQuestaoSelecionada(null)
      setModoEdicao(false)
    }
  }
  
  const handleFecharModalView = () => {
    setModalViewAberto(false)
    setQuestaoSelecionada(null)
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <BackButton href="/estudos" className="mb-4" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Banco de Questões
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas questões de estudo e organize por disciplina
          </p>
        </div>
        
        <Button
          variant="primary"
          size="lg"
          onClick={handleAdicionarQuestao}
          icon={<Plus className="h-5 w-5" />}
          disabled={concursos.length === 0}
        >
          Adicionar Questão
        </Button>
      </div>
      
      {/* Aviso se não houver concursos */}
      {concursos.length === 0 && !loading && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                Cadastre um concurso primeiro
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Para adicionar questões, você precisa ter pelo menos um concurso cadastrado com disciplinas.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 dark:text-red-300">
            {error}
          </p>
        </div>
      )}
      
      {/* Lista de Questões */}
      <QuestoesList
        questoes={questoes}
        concursos={concursos}
        onEdit={handleEditarQuestao}
        onDelete={handleExcluirQuestao}
        onClick={handleVisualizarQuestao}
        isLoading={loading}
      />
      
      {/* Modal de Formulário (Adicionar/Editar) */}
      <Modal
        isOpen={modalFormAberto}
        onClose={handleFecharModalForm}
        title={modoEdicao ? 'Editar Questão' : 'Adicionar Questão'}
        size="xl"
      >
        <QuestaoForm
          questao={questaoSelecionada || undefined}
          concursos={concursos}
          onSubmit={handleSubmitForm}
          onCancel={handleFecharModalForm}
          isSubmitting={isSubmitting}
        />
      </Modal>
      
      {/* Modal de Visualização */}
      <Modal
        isOpen={modalViewAberto}
        onClose={handleFecharModalView}
        title="Visualizar Questão"
        size="xl"
      >
        {questaoSelecionada && (
          <div className="space-y-4">
            <QuestaoViewer
              questao={questaoSelecionada}
              showResposta={true}
              showExplicacao={true}
              modo="visualizacao"
            />
            
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  handleFecharModalView()
                  handleEditarQuestao(questaoSelecionada.id)
                }}
              >
                Editar
              </Button>
              
              <Button
                variant="primary"
                onClick={handleFecharModalView}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
