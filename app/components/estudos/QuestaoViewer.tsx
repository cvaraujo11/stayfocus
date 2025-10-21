'use client'

import { useState } from 'react'
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { cn } from '@/app/lib/utils'
import type { Questao, LetraAlternativa } from '@/app/types'

type ModoVisualizacao = 'visualizacao' | 'pratica' | 'simulado'

interface QuestaoViewerProps {
  questao: Questao
  showResposta?: boolean
  showExplicacao?: boolean
  respostaSelecionada?: LetraAlternativa | null
  onSelectResposta?: (alternativa: LetraAlternativa) => void
  modo?: ModoVisualizacao
  className?: string
}

/**
 * QuestaoViewer - Componente para visualizar questão completa
 * 
 * Features:
 * - Modos: visualização, prática, simulado
 * - Alternativas interativas (radio buttons)
 * - Feedback visual (correta/incorreta)
 * - Seção de explicação expansível
 * - Acessibilidade completa
 */
export function QuestaoViewer({
  questao,
  showResposta = false,
  showExplicacao = false,
  respostaSelecionada = null,
  onSelectResposta,
  modo = 'visualizacao',
  className,
}: QuestaoViewerProps) {
  const [explicacaoExpandida, setExplicacaoExpandida] = useState(showExplicacao)
  
  const isInterativo = modo === 'pratica' || modo === 'simulado'
  const mostrarFeedback = showResposta && respostaSelecionada !== null
  const respostaCorretaSelecionada = respostaSelecionada === questao.respostaCorreta
  
  const handleSelectAlternativa = (letra: LetraAlternativa) => {
    if (isInterativo && onSelectResposta && !showResposta) {
      onSelectResposta(letra)
    }
  }
  
  const getAlternativaClassName = (letra: LetraAlternativa) => {
    const baseClasses = 'flex items-start gap-3 p-3 rounded-lg border-2 transition-all'
    
    // Modo visualização ou sem resposta selecionada
    if (!isInterativo || !respostaSelecionada) {
      return cn(
        baseClasses,
        'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600',
        isInterativo && 'cursor-pointer',
        respostaSelecionada === letra && 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
      )
    }
    
    // Mostrar feedback
    if (mostrarFeedback) {
      const isCorreta = letra === questao.respostaCorreta
      const isSelecionada = letra === respostaSelecionada
      
      if (isCorreta) {
        return cn(
          baseClasses,
          'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
        )
      }
      
      if (isSelecionada && !isCorreta) {
        return cn(
          baseClasses,
          'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20'
        )
      }
      
      return cn(baseClasses, 'border-gray-200 dark:border-gray-700 opacity-60')
    }
    
    // Resposta selecionada mas sem feedback
    if (respostaSelecionada === letra) {
      return cn(
        baseClasses,
        'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20',
        isInterativo && 'cursor-pointer'
      )
    }
    
    return cn(
      baseClasses,
      'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600',
      isInterativo && 'cursor-pointer'
    )
  }
  
  const renderIconeFeedback = (letra: LetraAlternativa) => {
    if (!mostrarFeedback) return null
    
    const isCorreta = letra === questao.respostaCorreta
    const isSelecionada = letra === respostaSelecionada
    
    if (isCorreta) {
      return (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center">
          <Check className="h-4 w-4 text-white" />
        </div>
      )
    }
    
    if (isSelecionada && !isCorreta) {
      return (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 dark:bg-red-600 flex items-center justify-center">
          <X className="h-4 w-4 text-white" />
        </div>
      )
    }
    
    return null
  }
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header: Disciplina e Tags */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="primary">
          {questao.disciplina}
        </Badge>
        
        {questao.tags && questao.tags.length > 0 && (
          <>
            {questao.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </>
        )}
      </div>
      
      {/* Enunciado */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
          {questao.enunciado}
        </p>
      </div>
      
      {/* Alternativas */}
      <div
        className="space-y-3"
        role={isInterativo ? 'radiogroup' : undefined}
        aria-label="Alternativas da questão"
      >
        {questao.alternativas.map((alt) => (
          <div
            key={alt.letra}
            className={getAlternativaClassName(alt.letra)}
            onClick={() => handleSelectAlternativa(alt.letra)}
            onKeyDown={(e) => {
              if (isInterativo && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                handleSelectAlternativa(alt.letra)
              }
            }}
            role={isInterativo ? 'radio' : undefined}
            aria-checked={isInterativo ? respostaSelecionada === alt.letra : undefined}
            tabIndex={isInterativo ? 0 : undefined}
          >
            {/* Radio Button (modo interativo) */}
            {isInterativo && (
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    respostaSelecionada === alt.letra
                      ? 'border-blue-500 dark:border-blue-400'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                >
                  {respostaSelecionada === alt.letra && (
                    <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400" />
                  )}
                </div>
              </div>
            )}
            
            {/* Ícone de Feedback */}
            {renderIconeFeedback(alt.letra)}
            
            {/* Letra e Texto */}
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[24px]">
                  {alt.letra})
                </span>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {alt.texto}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Feedback de Resultado (modo prática) */}
      {mostrarFeedback && modo === 'pratica' && (
        <div
          className={cn(
            'p-4 rounded-lg border-2',
            respostaCorretaSelecionada
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400'
          )}
        >
          <p
            className={cn(
              'font-medium',
              respostaCorretaSelecionada
                ? 'text-green-800 dark:text-green-300'
                : 'text-red-800 dark:text-red-300'
            )}
          >
            {respostaCorretaSelecionada ? '✓ Resposta Correta!' : '✗ Resposta Incorreta'}
          </p>
          {!respostaCorretaSelecionada && (
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              A resposta correta é a alternativa {questao.respostaCorreta}
            </p>
          )}
        </div>
      )}
      
      {/* Explicação (expansível) */}
      {questao.explicacao && (showResposta || modo === 'visualizacao') && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setExplicacaoExpandida(!explicacaoExpandida)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            aria-expanded={explicacaoExpandida}
          >
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Explicação
            </span>
            {explicacaoExpandida ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {explicacaoExpandida && (
            <div className="p-4 bg-white dark:bg-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {questao.explicacao}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
