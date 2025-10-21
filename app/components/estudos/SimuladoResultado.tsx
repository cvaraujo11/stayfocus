'use client'

import { useState } from 'react'
import { ResultadoSimulado, Questao, LetraAlternativa } from '@/app/types'
import { Button } from '@/app/components/ui/Button'
import { Badge } from '@/app/components/ui/Badge'
import { Card } from '@/app/components/ui/Card'
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  RotateCcw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface SimuladoResultadoProps {
  resultado: ResultadoSimulado
  questoes: Questao[]
  onRefazer?: () => void
  onRevisarErradas?: () => void
  onExportarPDF?: () => void
}

/**
 * Componente para exibir o resultado de um simulado
 * Mostra resumo geral, estatísticas por disciplina e questões detalhadas
 */
export function SimuladoResultado({
  resultado,
  questoes,
  onRefazer,
  onRevisarErradas,
  onExportarPDF,
}: SimuladoResultadoProps) {
  const [questaoExpandida, setQuestaoExpandida] = useState<string | null>(null)
  const [mostrarApenas, setMostrarApenas] = useState<'todas' | 'erradas' | 'certas'>('todas')

  // Criar mapa de questões para acesso rápido
  const questoesMap = new Map(questoes.map((q) => [q.id, q]))

  // Criar mapa de respostas
  const respostasMap = new Map(
    resultado.respostas.map((r) => [r.questaoId, r])
  )

  // Filtrar questões
  const questoesFiltradas = questoes.filter((q) => {
    const resposta = respostasMap.get(q.id)
    if (!resposta) return false

    if (mostrarApenas === 'erradas') return !resposta.correta
    if (mostrarApenas === 'certas') return resposta.correta
    return true
  })

  // Determinar cor do percentual
  const getPercentualColor = (perc: number) => {
    if (perc >= 70) return 'text-green-600 dark:text-green-400'
    if (perc >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Formatar tempo
  const formatarTempo = (segundos: number): string => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segs = segundos % 60

    if (horas > 0) {
      return `${horas}h ${minutos}min ${segs}s`
    }
    if (minutos > 0) {
      return `${minutos}min ${segs}s`
    }
    return `${segs}s`
  }

  // Toggle expansão de questão
  const toggleQuestao = (questaoId: string) => {
    setQuestaoExpandida((prev) => (prev === questaoId ? null : questaoId))
  }

  const questoesErradas = resultado.respostas.filter((r) => !r.correta).length

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Resultado do Simulado
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Percentual */}
          <div className="text-center">
            <div
              className={cn(
                'text-5xl font-bold mb-2',
                getPercentualColor(resultado.percentual)
              )}
            >
              {Math.round(resultado.percentual)}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Aproveitamento
            </p>
          </div>

          {/* Acertos */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {resultado.acertos}/{resultado.totalQuestoes}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Questões Corretas
            </p>
          </div>

          {/* Tempo */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {formatarTempo(resultado.tempoTotal)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tempo Total
            </p>
          </div>
        </div>

        {/* Gráfico visual simples */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Desempenho:
            </span>
          </div>
          <div className="flex h-8 rounded-lg overflow-hidden">
            <div
              className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
              style={{
                width: `${(resultado.acertos / resultado.totalQuestoes) * 100}%`,
              }}
            >
              {resultado.acertos > 0 && resultado.acertos}
            </div>
            <div
              className="bg-red-500 flex items-center justify-center text-white text-sm font-medium"
              style={{
                width: `${(questoesErradas / resultado.totalQuestoes) * 100}%`,
              }}
            >
              {questoesErradas > 0 && questoesErradas}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              Corretas ({resultado.acertos})
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded" />
              Incorretas ({questoesErradas})
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {onRefazer && (
            <Button
              variant="primary"
              onClick={onRefazer}
              icon={<RotateCcw className="h-4 w-4" />}
            >
              Refazer Simulado
            </Button>
          )}
          {onRevisarErradas && questoesErradas > 0 && (
            <Button
              variant="outline"
              onClick={onRevisarErradas}
              icon={<AlertCircle className="h-4 w-4" />}
            >
              Revisar Questões Erradas
            </Button>
          )}
          {onExportarPDF && (
            <Button
              variant="outline"
              onClick={onExportarPDF}
              icon={<Download className="h-4 w-4" />}
            >
              Exportar PDF
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas por Disciplina */}
      {resultado.estatisticasPorDisciplina.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Desempenho por Disciplina
          </h3>

          <div className="space-y-4">
            {resultado.estatisticasPorDisciplina.map((stat) => (
              <div key={stat.disciplina}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stat.disciplina}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.acertos}/{stat.total}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        getPercentualColor(stat.percentual)
                      )}
                    >
                      {Math.round(stat.percentual)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all',
                      stat.percentual >= 70
                        ? 'bg-green-500'
                        : stat.percentual >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    )}
                    style={{ width: `${stat.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questões Detalhadas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Questões
          </h3>

          {/* Filtro */}
          <div className="flex gap-2">
            <Button
              variant={mostrarApenas === 'todas' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setMostrarApenas('todas')}
            >
              Todas ({questoes.length})
            </Button>
            <Button
              variant={mostrarApenas === 'erradas' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setMostrarApenas('erradas')}
            >
              Erradas ({questoesErradas})
            </Button>
            <Button
              variant={mostrarApenas === 'certas' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setMostrarApenas('certas')}
            >
              Certas ({resultado.acertos})
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {questoesFiltradas.map((questao, index) => {
            const resposta = respostasMap.get(questao.id)
            if (!resposta) return null

            const isExpandida = questaoExpandida === questao.id

            return (
              <div
                key={questao.id}
                className={cn(
                  'border-2 rounded-lg overflow-hidden transition-all',
                  resposta.correta
                    ? 'border-green-200 dark:border-green-800'
                    : 'border-red-200 dark:border-red-800'
                )}
              >
                {/* Header da questão */}
                <button
                  onClick={() => toggleQuestao(questao.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {resposta.correta ? (
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Questão {index + 1}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {questao.disciplina}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {questao.enunciado}
                      </p>
                    </div>
                  </div>
                  {isExpandida ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* Conteúdo expandido */}
                {isExpandida && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                    {/* Enunciado completo */}
                    <div className="mb-4">
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {questao.enunciado}
                      </p>
                    </div>

                    {/* Alternativas */}
                    <div className="space-y-2 mb-4">
                      {questao.alternativas.map((alt) => {
                        const isCorreta = alt.letra === questao.respostaCorreta
                        const isSelecionada = alt.letra === resposta.respostaSelecionada

                        return (
                          <div
                            key={alt.letra}
                            className={cn(
                              'p-3 rounded-lg border-2',
                              isCorreta &&
                                'border-green-500 bg-green-50 dark:bg-green-900/20',
                              isSelecionada &&
                                !isCorreta &&
                                'border-red-500 bg-red-50 dark:bg-red-900/20',
                              !isCorreta &&
                                !isSelecionada &&
                                'border-gray-200 dark:border-gray-700'
                            )}
                          >
                            <div className="flex items-start gap-2">
                              {isCorreta && (
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              )}
                              {isSelecionada && !isCorreta && (
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <span className="font-semibold text-gray-900 dark:text-white mr-2">
                                  {alt.letra})
                                </span>
                                <span className="text-gray-700 dark:text-gray-300">
                                  {alt.texto}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Explicação */}
                    {questao.explicacao && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                              Explicação:
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                              {questao.explicacao}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {questoesFiltradas.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma questão para exibir com o filtro atual</p>
          </div>
        )}
      </div>
    </div>
  )
}
