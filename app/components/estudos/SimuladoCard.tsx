'use client'

import { memo, useMemo, useCallback } from 'react'
import { Simulado } from '@/app/types'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { FileText, Calendar, Clock, CheckCircle, Play, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface SimuladoCardProps {
  simulado: Simulado
  onStart?: (id: string) => void
  onViewResult?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
}

/**
 * Componente para exibir um card de simulado
 * Mostra informações principais, status de realização e ações
 * Otimizado com React.memo e useMemo
 */
export const SimuladoCard = memo(function SimuladoCard({
  simulado,
  onStart,
  onViewResult,
  onEdit,
  onDelete,
  onClick,
}: SimuladoCardProps) {
  // Memoizar cálculos
  const isRealizado = useMemo(() => simulado.dataRealizacao !== null, [simulado.dataRealizacao])
  
  const percentual = useMemo(() => 
    simulado.acertos !== null && simulado.totalQuestoes !== null
      ? (simulado.acertos / simulado.totalQuestoes) * 100
      : null,
    [simulado.acertos, simulado.totalQuestoes]
  )

  // Memoizar cor do percentual
  const percentualColor = useMemo(() => {
    if (percentual === null) return ''
    if (percentual >= 70) return 'text-green-600 dark:text-green-400'
    if (percentual >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }, [percentual])

  // Memoizar handlers com useCallback
  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick(simulado.id)
    }
  }, [onClick, simulado.id])

  const handleStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onStart) {
      onStart(simulado.id)
    }
  }, [onStart, simulado.id])

  const handleViewResult = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onViewResult) {
      onViewResult(simulado.id)
    }
  }, [onViewResult, simulado.id])

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(simulado.id)
    }
  }, [onEdit, simulado.id])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(simulado.id)
    }
  }, [onDelete, simulado.id])

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg',
        onClick && 'cursor-pointer hover:scale-[1.02]'
      )}
      onClick={handleCardClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick(simulado.id)
        }
      }}
    >
      <div className="p-4">
        {/* Header com título e status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {simulado.titulo}
            </h3>
          </div>
          {isRealizado ? (
            <Badge variant="success" className="ml-2 flex-shrink-0">
              Realizado
            </Badge>
          ) : (
            <Badge variant="primary" className="ml-2 flex-shrink-0">
              Pendente
            </Badge>
          )}
        </div>

        {/* Informações do simulado */}
        <div className="space-y-2 mb-4">
          {/* Número de questões */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {simulado.totalQuestoes || simulado.questoesIds.length}{' '}
              {(simulado.totalQuestoes || simulado.questoesIds.length) === 1
                ? 'questão'
                : 'questões'}
            </span>
          </div>

          {/* Tempo limite */}
          {simulado.tempoLimiteMinutos && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                Tempo limite: {simulado.tempoLimiteMinutos}{' '}
                {simulado.tempoLimiteMinutos === 1 ? 'minuto' : 'minutos'}
              </span>
            </div>
          )}

          {/* Data de realização */}
          {isRealizado && simulado.dataRealizacao && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                Realizado em{' '}
                {new Date(simulado.dataRealizacao).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Resultado (se realizado) */}
        {isRealizado && percentual !== null && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Resultado:
                </span>
              </div>
              <div className="text-right">
                <div className={cn('text-2xl font-bold', percentualColor)}>
                  {Math.round(percentual)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {simulado.acertos} de {simulado.totalQuestoes} acertos
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          {!isRealizado && onStart && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStart}
              icon={<Play className="h-4 w-4" />}
              className="flex-1"
              aria-label={`Iniciar ${simulado.titulo}`}
            >
              Iniciar
            </Button>
          )}

          {isRealizado && onViewResult && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleViewResult}
              icon={<CheckCircle className="h-4 w-4" />}
              className="flex-1"
              aria-label={`Ver resultado de ${simulado.titulo}`}
            >
              Ver Resultado
            </Button>
          )}

          {onEdit && !isRealizado && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              icon={<Edit className="h-4 w-4" />}
              aria-label={`Editar ${simulado.titulo}`}
            >
              Editar
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              icon={<Trash2 className="h-4 w-4" />}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              aria-label={`Excluir ${simulado.titulo}`}
            >
              Excluir
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison para otimizar re-renders
  return (
    prevProps.simulado.id === nextProps.simulado.id &&
    prevProps.simulado.titulo === nextProps.simulado.titulo &&
    prevProps.simulado.dataRealizacao === nextProps.simulado.dataRealizacao &&
    prevProps.simulado.acertos === nextProps.simulado.acertos &&
    prevProps.simulado.totalQuestoes === nextProps.simulado.totalQuestoes &&
    prevProps.simulado.tempoLimiteMinutos === nextProps.simulado.tempoLimiteMinutos &&
    prevProps.onStart === nextProps.onStart &&
    prevProps.onViewResult === nextProps.onViewResult &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onClick === nextProps.onClick
  )
})
