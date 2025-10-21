'use client'

import { memo, useMemo, useCallback } from 'react'
import { Concurso } from '@/app/types'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { Card } from '@/app/components/ui/Card'
import { Calendar, Building2, Briefcase, Edit, Trash2, Clock } from 'lucide-react'
import { calcularDiasAteProva } from '@/app/lib/supabase/concursos'
import { cn } from '@/app/lib/utils'

interface ConcursoCardProps {
  concurso: Concurso
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
}

/**
 * Componente para exibir um card de concurso
 * Mostra informações principais, status, contador de dias e ações
 * Otimizado com React.memo para evitar re-renders desnecessários
 */
export const ConcursoCard = memo(function ConcursoCard({ concurso, onEdit, onDelete, onClick }: ConcursoCardProps) {
  // Memoizar cálculo de dias até a prova
  const diasAteProva = useMemo(() => 
    concurso.dataProva ? calcularDiasAteProva(concurso.dataProva) : null,
    [concurso.dataProva]
  )
  
  // Memoizar variante do badge de status
  const statusVariant = useMemo(() => ({
    em_andamento: 'blue' as const,
    concluido: 'success' as const,
    cancelado: 'danger' as const,
  }[concurso.status]), [concurso.status])
  
  // Memoizar label do status
  const statusLabel = useMemo(() => ({
    em_andamento: 'Em Andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  }[concurso.status]), [concurso.status])
  
  // Memoizar cor do contador de dias
  const diasColor = useMemo(() => {
    if (diasAteProva === null) return ''
    if (diasAteProva < 0) return 'text-gray-500 dark:text-gray-400'
    if (diasAteProva <= 7) return 'text-red-600 dark:text-red-400'
    if (diasAteProva <= 30) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }, [diasAteProva])
  
  // Memoizar texto do contador
  const diasTexto = useMemo(() => {
    if (diasAteProva === null) return ''
    if (diasAteProva < 0) return `Prova realizada há ${Math.abs(diasAteProva)} dias`
    if (diasAteProva === 0) return 'Prova hoje!'
    if (diasAteProva === 1) return 'Prova amanhã!'
    return `Faltam ${diasAteProva} dias`
  }, [diasAteProva])
  
  // Memoizar handlers com useCallback
  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick(concurso.id)
    }
  }, [onClick, concurso.id])
  
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(concurso.id)
    }
  }, [onEdit, concurso.id])
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(concurso.id)
    }
  }, [onDelete, concurso.id])
  
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
          onClick(concurso.id)
        }
      }}
    >
      <div className="p-4">
        {/* Header com nome e status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {concurso.nome}
            </h3>
          </div>
          <Badge variant={statusVariant} className="ml-2 flex-shrink-0">
            {statusLabel}
          </Badge>
        </div>
        
        {/* Informações do concurso */}
        <div className="space-y-2 mb-4">
          {concurso.instituicao && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{concurso.instituicao}</span>
            </div>
          )}
          
          {concurso.cargo && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{concurso.cargo}</span>
            </div>
          )}
          
          {concurso.dataProva && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                {new Date(concurso.dataProva).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
        
        {/* Contador de dias até a prova */}
        {diasAteProva !== null && (
          <div className={cn(
            'flex items-center text-sm font-medium mb-4',
            diasColor
          )}>
            <Clock className="h-4 w-4 mr-2" />
            <span>{diasTexto}</span>
          </div>
        )}
        
        {/* Disciplinas */}
        {concurso.disciplinas.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {concurso.disciplinas.slice(0, 3).map((disciplina, index) => (
                <Badge key={index} variant="default" className="text-xs">
                  {disciplina}
                </Badge>
              ))}
              {concurso.disciplinas.length > 3 && (
                <Badge variant="default" className="text-xs">
                  +{concurso.disciplinas.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Ações */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                icon={<Edit className="h-4 w-4" />}
                aria-label={`Editar ${concurso.nome}`}
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
                aria-label={`Excluir ${concurso.nome}`}
              >
                Excluir
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function para otimizar re-renders
  return (
    prevProps.concurso.id === nextProps.concurso.id &&
    prevProps.concurso.nome === nextProps.concurso.nome &&
    prevProps.concurso.status === nextProps.concurso.status &&
    prevProps.concurso.dataProva === nextProps.concurso.dataProva &&
    prevProps.concurso.instituicao === nextProps.concurso.instituicao &&
    prevProps.concurso.cargo === nextProps.concurso.cargo &&
    JSON.stringify(prevProps.concurso.disciplinas) === JSON.stringify(nextProps.concurso.disciplinas) &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onClick === nextProps.onClick
  )
})
