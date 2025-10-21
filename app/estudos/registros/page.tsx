'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useEstudosStore } from '@/app/stores/estudosStore'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { Button } from '@/app/components/ui/Button'
import { BackButton } from '@/app/components/common/BackButton'
import { Card } from '@/app/components/ui/Card'
import { Modal } from '@/app/components/ui/Modal'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { EmptyState } from '@/app/components/common/EmptyState'
import { Plus, Calendar, Filter, BookOpen, Clock, X } from 'lucide-react'
import type { RegistroEstudo, RegistroEstudoFormData } from '@/app/types'

// Lazy load heavy components
const EstatisticasEstudo = dynamic(
  () => import('@/app/components/estudos').then(mod => ({ default: mod.EstatisticasEstudo })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
)

const RegistrosCalendar = dynamic(
  () => import('@/app/components/estudos').then(mod => ({ default: mod.RegistrosCalendar })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
)

const RegistroEstudoForm = dynamic(
  () => import('@/app/components/estudos').then(mod => ({ default: mod.RegistroEstudoForm })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

/**
 * Página de Registros de Estudo
 * 
 * Features:
 * - Integração com calendário e estatísticas
 * - Botão de adicionar registro
 * - Filtros de período (semana, mês, ano, personalizado)
 * - Visualização de registros do dia selecionado
 * - Edição e remoção de registros
 * 
 * Requirements: 4.1, 4.6, 6.1
 */
export default function RegistrosPage() {
  const {
    registros,
    concursos,
    loading,
    error,
    carregarRegistros,
    carregarConcursos,
    adicionarRegistro,
    atualizarRegistro,
    removerRegistro,
  } = useEstudosStore()

  const [userId, setUserId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [registroEditando, setRegistroEditando] = useState<RegistroEstudo | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'ano' | 'personalizado'>('mes')
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')
  const [showFiltros, setShowFiltros] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
        
        // Carregar concursos para obter disciplinas
        await carregarConcursos(user.id)
        
        // Carregar registros do período padrão (mês atual)
        const hoje = new Date()
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        const fimMes = hoje
        
        setDataInicio(inicioMes.toISOString().split('T')[0])
        setDataFim(fimMes.toISOString().split('T')[0])
        
        await carregarRegistros(
          user.id,
          inicioMes.toISOString().split('T')[0],
          fimMes.toISOString().split('T')[0]
        )
      }
    }
    
    loadData()
  }, [carregarRegistros, carregarConcursos])

  // Aplicar filtro de período
  const aplicarFiltroPeriodo = async (novoPeriodo: typeof periodo) => {
    if (!userId) return
    
    setPeriodo(novoPeriodo)
    const hoje = new Date()
    let inicio: Date
    let fim: Date = hoje
    
    switch (novoPeriodo) {
      case 'semana':
        inicio = new Date(hoje)
        inicio.setDate(hoje.getDate() - 7)
        break
      case 'mes':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        break
      case 'ano':
        inicio = new Date(hoje.getFullYear(), 0, 1)
        break
      case 'personalizado':
        // Não carregar automaticamente, esperar usuário definir datas
        setShowFiltros(true)
        return
      default:
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    }
    
    const inicioStr = inicio.toISOString().split('T')[0]
    const fimStr = fim.toISOString().split('T')[0]
    
    setDataInicio(inicioStr)
    setDataFim(fimStr)
    
    await carregarRegistros(userId, inicioStr, fimStr)
  }

  // Aplicar filtro personalizado
  const aplicarFiltroPersonalizado = async () => {
    if (!userId || !dataInicio || !dataFim) return
    
    await carregarRegistros(userId, dataInicio, dataFim)
    setShowFiltros(false)
  }

  // Obter disciplinas disponíveis dos concursos
  const disciplinasDisponiveis = Array.from(
    new Set(concursos.flatMap(c => c.disciplinas))
  ).sort()

  // Obter registros do dia selecionado
  const registrosDoDia = selectedDate
    ? registros.filter(r => r.data === selectedDate)
    : []

  // Handlers
  const handleAddRegistro = () => {
    setRegistroEditando(null)
    setShowForm(true)
  }

  const handleEditRegistro = (registro: RegistroEstudo) => {
    setRegistroEditando(registro)
    setShowForm(true)
  }

  const handleDeleteRegistro = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este registro?')) return
    
    try {
      await removerRegistro(id)
    } catch (error) {
      console.error('Erro ao remover registro:', error)
    }
  }

  const handleSubmitForm = async (data: RegistroEstudoFormData) => {
    setIsSubmitting(true)
    try {
      if (registroEditando) {
        await atualizarRegistro(registroEditando.id, data)
      } else {
        await adicionarRegistro({
          ...data,
          observacoes: data.observacoes || null
        })
      }
      
      setShowForm(false)
      setRegistroEditando(null)
      
      // Recarregar registros
      if (userId) {
        await carregarRegistros(userId, dataInicio, dataFim)
      }
    } catch (error) {
      console.error('Erro ao salvar registro:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDayClick = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date)
  }

  const formatDuracao = (minutos: number): string => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    
    if (horas === 0) {
      return `${mins}min`
    } else if (mins === 0) {
      return `${horas}h`
    } else {
      return `${horas}h ${mins}min`
    }
  }

  // Loading state
  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <BackButton href="/estudos" className="mb-4" />
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Registros de Estudo
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Acompanhe suas sessões de estudo e visualize estatísticas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowFiltros(!showFiltros)}
            variant="outline"
            size="default"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Button
            onClick={handleAddRegistro}
            variant="primary"
            size="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Registro
          </Button>
        </div>
      </div>

      {/* Filtros de Período */}
      {showFiltros && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtrar por Período
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFiltros(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Botões de período rápido */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={periodo === 'semana' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => aplicarFiltroPeriodo('semana')}
              >
                Última Semana
              </Button>
              <Button
                variant={periodo === 'mes' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => aplicarFiltroPeriodo('mes')}
              >
                Este Mês
              </Button>
              <Button
                variant={periodo === 'ano' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => aplicarFiltroPeriodo('ano')}
              >
                Este Ano
              </Button>
              <Button
                variant={periodo === 'personalizado' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPeriodo('personalizado')}
              >
                Personalizado
              </Button>
            </div>
            
            {/* Filtro personalizado */}
            {periodo === 'personalizado' && (
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button
                    onClick={aplicarFiltroPersonalizado}
                    variant="primary"
                    disabled={!dataInicio || !dataFim}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Estatísticas */}
      <div>
        <EstatisticasEstudo userId={userId} periodo={periodo === 'personalizado' ? 'mes' : periodo} />
      </div>

      {/* Calendário de Registros */}
      <div>
        <RegistrosCalendar
          registros={registros}
          onDayClick={handleDayClick}
          selectedDate={selectedDate || undefined}
        />
      </div>

      {/* Registros do Dia Selecionado */}
      {selectedDate && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Registros de {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {registrosDoDia.length === 0 ? (
            <EmptyState
              message="Nenhum registro neste dia"
              description="Adicione um registro de estudo para este dia"
              icon={<BookOpen className="h-12 w-12" />}
            />
          ) : (
            <div className="space-y-3">
              {registrosDoDia.map((registro) => (
                <div
                  key={registro.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {registro.disciplina}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuracao(registro.duracaoMinutos)}
                        </span>
                      </div>
                      
                      {registro.topicos.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {registro.topicos.map((topico, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            >
                              {topico}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {registro.observacoes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {registro.observacoes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRegistro(registro)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRegistro(registro.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modal de Formulário */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setRegistroEditando(null)
        }}
        title={registroEditando ? 'Editar Registro' : 'Novo Registro de Estudo'}
      >
        <RegistroEstudoForm
          registro={registroEditando || undefined}
          disciplinasDisponiveis={disciplinasDisponiveis}
          onSubmit={handleSubmitForm}
          onCancel={() => {
            setShowForm(false)
            setRegistroEditando(null)
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  )
}
