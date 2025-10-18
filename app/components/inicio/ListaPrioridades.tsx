'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Importar Link
import { CheckCircle2, Circle, PlusCircle, Edit2, Calendar, ChevronLeft, ChevronRight, X, Award } from 'lucide-react'; // Importar Award
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Modal } from '@/app/components/ui/Modal'
import { Badge } from '@/app/components/ui/Badge'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { ErrorMessage } from '@/app/components/common/ErrorMessage'
import { usePrioridadesStore, Prioridade } from '@/app/stores/prioridadesStore'
import { useAuth } from '@/app/contexts/AuthContext'

export function ListaPrioridades() {
  const { user } = useAuth()
  const {
    prioridades,
    loading,
    error,
    carregarPrioridades,
    adicionarPrioridade,
    editarPrioridade,
    removerPrioridade,
    toggleConcluida,
    getHistoricoPorData,
    getDatasPrioridades,
    setupRealtimeSync
  } = usePrioridadesStore()

  const [novoTexto, setNovoTexto] = useState('')
  const [prioridadeEditando, setPrioridadeEditando] = useState<Prioridade | null>(null)
  const [textoEditando, setTextoEditando] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [dataAtual, setDataAtual] = useState(new Date().toISOString().split('T')[0])
  const [prioridadesExibidas, setPrioridadesExibidas] = useState<Prioridade[]>([])
  const [datasHistorico, setDatasHistorico] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar prioridades quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      carregarPrioridades(user.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Setup real-time sync
  useEffect(() => {
    if (user) {
      const cleanup = setupRealtimeSync(user.id)
      return cleanup
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Carregar prioridades do dia atual
  useEffect(() => {
    const prioridadesDoDia = getHistoricoPorData(dataAtual)
    setPrioridadesExibidas(prioridadesDoDia)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prioridades, dataAtual])

  // Carregar datas disponíveis no histórico
  useEffect(() => {
    const datas = getDatasPrioridades()
    setDatasHistorico(datas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prioridades])

  // Verifica se estamos vendo o dia atual
  const isToday = () => {
    const hoje = new Date().toISOString().split('T')[0]
    return dataAtual === hoje
  }

  // Funções para navegação no histórico
  const irParaDataAnterior = () => {
    const indexAtual = datasHistorico.indexOf(dataAtual)
    if (indexAtual < datasHistorico.length - 1) {
      setDataAtual(datasHistorico[indexAtual + 1])
    }
  }

  const irParaDataProxima = () => {
    const indexAtual = datasHistorico.indexOf(dataAtual)
    if (indexAtual > 0) {
      setDataAtual(datasHistorico[indexAtual - 1])
    }
  }

  const voltarParaHoje = () => {
    setDataAtual(new Date().toISOString().split('T')[0])
  }

  // Função para adicionar nova prioridade
  const handleAdicionarPrioridade = async () => {
    if (!novoTexto.trim() || prioridadesExibidas.length >= 3 || isSubmitting) return

    setIsSubmitting(true)
    try {
      await adicionarPrioridade({
        texto: novoTexto,
        concluida: false,
        categoria: 'geral',
        nivel_prioridade: 2,
      })
      setNovoTexto('')
    } catch (error) {
      console.error('Erro ao adicionar prioridade:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para iniciar edição
  const iniciarEdicao = (prioridade: Prioridade) => {
    setPrioridadeEditando(prioridade)
    setTextoEditando(prioridade.texto)
  }

  // Função para salvar edição
  const salvarEdicao = async () => {
    if (prioridadeEditando && textoEditando.trim() && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await editarPrioridade(prioridadeEditando.id, textoEditando)
        setPrioridadeEditando(null)
      } catch (error) {
        console.error('Erro ao editar prioridade:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Função para cancelar edição
  const cancelarEdicao = () => {
    setPrioridadeEditando(null)
  }

  // Formatar data para exibição (DD/MM/YYYY)
  const formatarData = (dataISO: string) => {
    const partes = dataISO.split('-')
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  // Show loading state
  if (loading && prioridades.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => user && carregarPrioridades(user.id)}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com controles de histórico */}
      <div className="flex justify-between items-center mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          aria-label={showHistory ? "Esconder histórico" : "Mostrar histórico"}
        >
          <Calendar className="h-4 w-4 mr-1" />
          {showHistory ? 'Esconder Histórico' : 'Ver Histórico'}
        </Button>

        {isToday() ? (
          <Badge>Hoje</Badge>
        ) : (
          <Badge variant="secondary">{formatarData(dataAtual)}</Badge>
        )}
      </div>

      {/* Controles de navegação no histórico */}
      {showHistory && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={irParaDataAnterior}
            disabled={datasHistorico.indexOf(dataAtual) >= datasHistorico.length - 1}
            aria-label="Data anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-sm font-medium">
            {formatarData(dataAtual)}
            {!isToday() && (
              <Button
                variant="link"
                size="sm"
                className="ml-2 underline text-blue-600 dark:text-blue-400"
                onClick={voltarParaHoje}
              >
                Voltar para hoje
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={irParaDataProxima}
            disabled={datasHistorico.indexOf(dataAtual) <= 0}
            aria-label="Próxima data"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Lista de prioridades */}
      <div className="space-y-2">
        {prioridadesExibidas.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            {isToday() ? (
              <p>Nenhuma prioridade definida para hoje.</p>
            ) : (
              <p>Nenhuma prioridade registrada para esta data.</p>
            )}
          </div>
        ) : (
          prioridadesExibidas.map((prioridade) => (
            <div
              key={prioridade.id}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${prioridade.concluida
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-white dark:bg-gray-800'
                }`}
            >
              {isToday() && (
                <button
                  onClick={() => toggleConcluida(prioridade.id)}
                  className="mr-3 text-green-600 dark:text-green-400 focus:outline-none"
                  aria-label={prioridade.concluida ? 'Marcar como não concluída' : 'Marcar como concluída'}
                >
                  {prioridade.concluida ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>
              )}

              {/* Ícone para prioridade de concurso */}
              {prioridade.tipo === 'concurso' && (
                <Award className="h-5 w-5 mr-2 text-indigo-600 flex-shrink-0" />
              )}

              {/* Texto da prioridade, com link se for de concurso */}
              <span
                className={`flex-1 ${prioridade.concluida
                  ? 'text-gray-500 dark:text-gray-400 line-through'
                  : 'text-gray-900 dark:text-white'
                  }`}
              >
                {prioridade.tipo === 'concurso' && prioridade.origemId ? (
                  <Link href={`/concursos/${prioridade.origemId}`} className="hover:underline">
                    {prioridade.texto}
                  </Link>
                ) : (
                  prioridade.texto
                )}
              </span>

              {isToday() && prioridade.tipo !== 'concurso' && ( // Não permite editar prioridades de concurso diretamente aqui
                <button
                  onClick={() => iniciarEdicao(prioridade)}
                  className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                  aria-label="Editar prioridade"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input para adicionar nova prioridade (apenas no dia atual) */}
      {isToday() && prioridadesExibidas.length < 3 && (
        <div className="flex items-center mt-4">
          <Input
            type="text"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Nova prioridade..."
            className="flex-1"
            maxLength={50}
          />
          <Button
            onClick={handleAdicionarPrioridade}
            className="ml-2"
            aria-label="Adicionar prioridade"
            disabled={isSubmitting || !novoTexto.trim()}
          >
            {isSubmitting ? <LoadingSpinner size="sm" /> : <PlusCircle className="h-5 w-5" />}
          </Button>
        </div>
      )}

      {/* Mensagem quando atingir o limite de prioridades */}
      {isToday() && prioridadesExibidas.length >= 3 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Máximo de 3 prioridades para manter o foco.
        </p>
      )}

      {/* Modal de edição */}
      {prioridadeEditando && (
        <Modal
          isOpen={!!prioridadeEditando}
          title="Editar Prioridade"
          onClose={cancelarEdicao}
        >
          <div className="space-y-4">
            <Input
              value={textoEditando}
              onChange={(e) => setTextoEditando(e.target.value)}
              placeholder="Texto da prioridade"
              maxLength={50}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelarEdicao} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={salvarEdicao} disabled={!textoEditando.trim() || isSubmitting}>
                {isSubmitting ? <LoadingSpinner size="sm" /> : 'Salvar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
