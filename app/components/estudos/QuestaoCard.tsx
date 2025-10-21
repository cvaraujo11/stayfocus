'use client'

import { useState, memo, useMemo, useCallback } from 'react'
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { cn } from '@/app/lib/utils'
import type { Questao } from '@/app/types'

interface QuestaoCardProps {
  questao: Questao
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
  showActions?: boolean
}

/**
 * QuestaoCard - Componente para exibir resumo de uma questão
 * 
 * Features:
 * - Exibe enunciado resumido (primeiras linhas)
 * - Badges de disciplina e tags
 * - Alternativas de forma compacta
 * - Botões de ação (editar, excluir, visualizar)
 * - Toggle para mostrar/ocultar resposta
 * - Otimizado com React.memo e useMemo
 */
export const QuestaoCard = memo(function QuestaoCard({
  questao,
  onEdit,
  onDelete,
  onClick,
  showActions = true,
}: QuestaoCardProps) {
  const [showResposta, setShowResposta] = useState(false)
  
  // Memoizar enunciado truncado
  const enunciadoResumo = useMemo(() => 
    questao.enunciado.length > 150
      ? questao.enunciado.substring(0, 150) + '...'
      : questao.enunciado,
    [questao.enunciado]
  )
  
  // Memoizar handlers com useCallback
  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick(questao.id)
    }
  }, [onClick, questao.id])
  
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(questao.id)
    }
  }, [onEdit, questao.id])
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(questao.id)
    }
  }, [onDelete, questao.id])
  
  const toggleResposta = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShowResposta(prev => !prev)
  }, [])
  
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md',
        onClick && 'cursor-pointer hover:border-blue-500 dark:hover:border-blue-400'
      )}
      onClick={handleCardClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      {/* Header: Disciplina e Tags */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="primary">
          {questao.disciplina}
        </Badge>
        
        {questao.tags && questao.tags.length > 0 && (
          <>
            {questao.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
            {questao.tags.length > 3 && (
              <Badge variant="outline">
                +{questao.tags.length - 3}
              </Badge>
            )}
          </>
        )}
      </div>
      
      {/* Enunciado Resumido */}
      <div className="mb-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {enunciadoResumo}
        </p>
      </div>
      
      {/* Alternativas Compactas */}
      <div className="space-y-1 mb-3">
        {questao.alternativas.map((alt) => (
          <div
            key={alt.letra}
            className={cn(
              'text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2 p-1 rounded',
              showResposta && alt.letra === questao.respostaCorreta && 
              'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
            )}
          >
            <span className="font-semibold min-w-[20px]">{alt.letra})</span>
            <span className="line-clamp-1">{alt.texto}</span>
          </div>
        ))}
      </div>
      
      {/* Footer: Ações */}
      {showActions && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleResposta}
            icon={showResposta ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          >
            {showResposta ? 'Ocultar' : 'Ver'} Resposta
          </Button>
          
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                aria-label="Editar questão"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                aria-label="Excluir questão"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison para otimizar re-renders
  return (
    prevProps.questao.id === nextProps.questao.id &&
    prevProps.questao.enunciado === nextProps.questao.enunciado &&
    prevProps.questao.disciplina === nextProps.questao.disciplina &&
    prevProps.questao.respostaCorreta === nextProps.questao.respostaCorreta &&
    JSON.stringify(prevProps.questao.alternativas) === JSON.stringify(nextProps.questao.alternativas) &&
    JSON.stringify(prevProps.questao.tags) === JSON.stringify(nextProps.questao.tags) &&
    prevProps.showActions === nextProps.showActions &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onClick === nextProps.onClick
  )
})
