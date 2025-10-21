'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Simulado, Questao, RespostaSimulado, LetraAlternativa, SimuladoEmAndamento } from '@/app/types'
import { Button } from '@/app/components/ui/Button'
import { Badge } from '@/app/components/ui/Badge'
import { Modal } from '@/app/components/ui/Modal'
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Flag, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface SimuladoPlayerProps {
  simulado: Simulado
  questoes: Questao[]
  onFinish: (respostas: RespostaSimulado[]) => void | Promise<void>
}

/**
 * Interface para realização de simulados
 * Gerencia navegação, cronômetro, marcações e estado local
 */
export function SimuladoPlayer({ simulado, questoes, onFinish }: SimuladoPlayerProps) {
  const [questaoAtual, setQuestaoAtual] = useState(0)
  const [respostas, setRespostas] = useState<Map<string, LetraAlternativa>>(new Map())
  const [questoesMarcadas, setQuestoesMarcadas] = useState<Set<string>>(new Set())
  const [tempoDecorrido, setTempoDecorrido] = useState(0) // em segundos
  const [tempoInicio, setTempoInicio] = useState<number>(Date.now())
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showTimeAlert, setShowTimeAlert] = useState(false)
  const [finalizando, setFinalizando] = useState(false)

  const questao = questoes[questaoAtual]
  const totalQuestoes = questoes.length
  const tempoLimiteSegundos = simulado.tempoLimiteMinutos ? simulado.tempoLimiteMinutos * 60 : null

  // Chave para localStorage
  const storageKey = `simulado-${simulado.id}`

  // Carregar estado do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(storageKey)
    if (savedState) {
      try {
        const state: SimuladoEmAndamento = JSON.parse(savedState)
        setQuestaoAtual(state.questaoAtual)
        setRespostas(new Map(state.respostas.map(r => [r.questaoId, r.respostaSelecionada])))
        setQuestoesMarcadas(new Set(state.questoesMarcadas))
        setTempoInicio(new Date(state.tempoInicio).getTime())
      } catch (error) {
        console.error('Erro ao carregar estado do simulado:', error)
      }
    }
  }, [storageKey])

  // Salvar estado no localStorage
  const salvarEstado = useCallback(() => {
    const respostasArray: RespostaSimulado[] = Array.from(respostas.entries()).map(
      ([questaoId, respostaSelecionada]) => ({
        questaoId,
        respostaSelecionada,
        correta: false, // Será calculado ao finalizar
      })
    )

    const state: SimuladoEmAndamento = {
      simuladoId: simulado.id,
      questaoAtual,
      respostas: respostasArray,
      tempoInicio: new Date(tempoInicio).toISOString(),
      questoesMarcadas: Array.from(questoesMarcadas),
    }

    localStorage.setItem(storageKey, JSON.stringify(state))
  }, [storageKey, simulado.id, questaoAtual, respostas, tempoInicio, questoesMarcadas])

  // Salvar estado quando houver mudanças
  useEffect(() => {
    salvarEstado()
  }, [salvarEstado])

  // Cronômetro
  useEffect(() => {
    const interval = setInterval(() => {
      const agora = Date.now()
      const decorrido = Math.floor((agora - tempoInicio) / 1000)
      setTempoDecorrido(decorrido)

      // Alertar quando faltarem 5 minutos
      if (
        tempoLimiteSegundos &&
        !showTimeAlert &&
        decorrido >= tempoLimiteSegundos - 300 &&
        decorrido < tempoLimiteSegundos
      ) {
        setShowTimeAlert(true)
      }

      // Finalizar automaticamente quando o tempo acabar
      if (tempoLimiteSegundos && decorrido >= tempoLimiteSegundos) {
        handleFinalizarAutomatico()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [tempoInicio, tempoLimiteSegundos, showTimeAlert])

  // Formatar tempo
  const formatarTempo = (segundos: number): string => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segs = segundos % 60

    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
    }
    return `${minutos}:${segs.toString().padStart(2, '0')}`
  }

  // Calcular tempo restante
  const tempoRestante = tempoLimiteSegundos ? tempoLimiteSegundos - tempoDecorrido : null

  // Memoizar handlers com useCallback
  const selecionarResposta = useCallback((letra: LetraAlternativa) => {
    setRespostas((prev) => {
      const newMap = new Map(prev)
      newMap.set(questao.id, letra)
      return newMap
    })
  }, [questao.id])

  const toggleMarcacao = useCallback(() => {
    setQuestoesMarcadas((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questao.id)) {
        newSet.delete(questao.id)
      } else {
        newSet.add(questao.id)
      }
      return newSet
    })
  }, [questao.id])

  const irParaQuestao = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestoes) {
      setQuestaoAtual(index)
    }
  }, [totalQuestoes])

  const questaoAnterior = useCallback(() => {
    if (questaoAtual > 0) {
      setQuestaoAtual(questaoAtual - 1)
    }
  }, [questaoAtual])

  const proximaQuestao = useCallback(() => {
    if (questaoAtual < totalQuestoes - 1) {
      setQuestaoAtual(questaoAtual + 1)
    }
  }, [questaoAtual, totalQuestoes])

  const handleFinalizar = useCallback(() => {
    setShowConfirmModal(true)
  }, [])

  // Finalizar automaticamente (tempo esgotado)
  const handleFinalizarAutomatico = async () => {
    await confirmarFinalizacao()
  }

  // Confirmar finalização
  const confirmarFinalizacao = async () => {
    setFinalizando(true)
    try {
      // Preparar respostas
      const respostasArray: RespostaSimulado[] = questoes.map((q) => {
        const respostaSelecionada = respostas.get(q.id)
        return {
          questaoId: q.id,
          respostaSelecionada: respostaSelecionada || 'A', // Default se não respondida
          correta: respostaSelecionada === q.respostaCorreta,
        }
      })

      // Limpar localStorage
      localStorage.removeItem(storageKey)

      // Chamar callback
      await onFinish(respostasArray)
    } catch (error) {
      console.error('Erro ao finalizar simulado:', error)
      setFinalizando(false)
    }
  }

  // Memoizar cálculos de progresso
  const questoesRespondidas = useMemo(() => respostas.size, [respostas])
  const percentualProgresso = useMemo(() => 
    (questoesRespondidas / totalQuestoes) * 100,
    [questoesRespondidas, totalQuestoes]
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header fixo */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {simulado.titulo}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Questão {questaoAtual + 1} de {totalQuestoes}
              </p>
            </div>

            {/* Cronômetro */}
            <div className="flex items-center gap-4">
              {tempoLimiteSegundos && tempoRestante !== null && (
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg',
                    tempoRestante <= 300
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  )}
                >
                  <Clock className="h-5 w-5" />
                  <span className="font-mono font-semibold">
                    {formatarTempo(tempoRestante)}
                  </span>
                </div>
              )}

              {!tempoLimiteSegundos && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono font-semibold">
                    {formatarTempo(tempoDecorrido)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
              style={{ width: `${percentualProgresso}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {questoesRespondidas} de {totalQuestoes} respondidas
          </p>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {questao && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            {/* Enunciado */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="outline" className="text-sm">
                  {questao.disciplina}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMarcacao}
                  icon={<Flag className="h-4 w-4" />}
                  className={cn(
                    questoesMarcadas.has(questao.id) &&
                      'text-yellow-600 dark:text-yellow-400'
                  )}
                >
                  {questoesMarcadas.has(questao.id) ? 'Marcada' : 'Marcar'}
                </Button>
              </div>

              <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                {questao.enunciado}
              </p>
            </div>

            {/* Alternativas */}
            <div className="space-y-3">
              {questao.alternativas.map((alt) => {
                const isSelected = respostas.get(questao.id) === alt.letra
                return (
                  <label
                    key={alt.letra}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <input
                      type="radio"
                      name="resposta"
                      value={alt.letra}
                      checked={isSelected}
                      onChange={() => selecionarResposta(alt.letra)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900 dark:text-white mr-2">
                        {alt.letra})
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {alt.texto}
                      </span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Navegação entre questões */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={questaoAnterior}
              disabled={questaoAtual === 0}
              icon={<ChevronLeft className="h-4 w-4" />}
            >
              Anterior
            </Button>

            <Button
              variant="outline"
              onClick={proximaQuestao}
              disabled={questaoAtual === totalQuestoes - 1}
              className="flex-row-reverse"
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Grid de navegação */}
          <div className="grid grid-cols-10 gap-2">
            {questoes.map((q, index) => {
              const isRespondida = respostas.has(q.id)
              const isMarcada = questoesMarcadas.has(q.id)
              const isAtual = index === questaoAtual

              return (
                <button
                  key={q.id}
                  onClick={() => irParaQuestao(index)}
                  className={cn(
                    'relative h-10 rounded-lg font-medium text-sm transition-all',
                    isAtual &&
                      'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800',
                    isRespondida
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  )}
                  aria-label={`Ir para questão ${index + 1}`}
                >
                  {index + 1}
                  {isMarcada && (
                    <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 fill-yellow-500" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Botão finalizar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <Button
            variant="primary"
            onClick={handleFinalizar}
            disabled={finalizando}
            icon={<CheckCircle className="h-5 w-5" />}
            className="w-full"
          >
            {finalizando ? 'Finalizando...' : 'Finalizar Simulado'}
          </Button>
          {questoesRespondidas < totalQuestoes && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 text-center flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Você ainda tem {totalQuestoes - questoesRespondidas} questões não respondidas
            </p>
          )}
        </div>
      </div>

      {/* Modal de confirmação */}
      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Finalizar Simulado?"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Tem certeza que deseja finalizar o simulado?
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Questões respondidas:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {questoesRespondidas} de {totalQuestoes}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Questões marcadas:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {questoesMarcadas.size}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tempo decorrido:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatarTempo(tempoDecorrido)}
                </span>
              </div>
            </div>

            {questoesRespondidas < totalQuestoes && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Questões não respondidas serão consideradas incorretas
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={finalizando}
                className="flex-1"
              >
                Continuar Simulado
              </Button>
              <Button
                variant="primary"
                onClick={confirmarFinalizacao}
                disabled={finalizando}
                className="flex-1"
              >
                {finalizando ? 'Finalizando...' : 'Sim, Finalizar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Alerta de tempo */}
      {showTimeAlert && tempoRestante !== null && tempoRestante > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-pulse">
          <AlertTriangle className="h-6 w-6" />
          <div>
            <p className="font-semibold">Atenção!</p>
            <p className="text-sm">Faltam menos de 5 minutos</p>
          </div>
          <button
            onClick={() => setShowTimeAlert(false)}
            className="ml-4 hover:bg-red-700 rounded p-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
