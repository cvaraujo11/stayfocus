'use client'

import { useState, useMemo } from 'react'
import { Concurso, StatusConcurso } from '@/app/types'
import { ConcursoCard } from './ConcursoCard'
import { EmptyState } from '@/app/components/common/EmptyState'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { Select } from '@/app/components/ui/Select'
import { BookOpen } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface ConcursosListProps {
  concursos: Concurso[]
  loading?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
  onAddNew?: () => void
  className?: string
}

/**
 * Componente para exibir lista de concursos com filtros e ordenação
 * Inclui estados de loading e vazio
 */
export function ConcursosList({
  concursos,
  loading = false,
  onEdit,
  onDelete,
  onClick,
  onAddNew,
  className,
}: ConcursosListProps) {
  const [filtroStatus, setFiltroStatus] = useState<StatusConcurso | 'todos'>('todos')
  const [ordenacao, setOrdenacao] = useState<'data_asc' | 'data_desc' | 'nome'>('data_asc')
  
  // Opções de filtro de status
  const statusOptions = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' },
  ]
  
  // Opções de ordenação
  const ordenacaoOptions = [
    { value: 'data_asc', label: 'Data da Prova (Mais Próxima)' },
    { value: 'data_desc', label: 'Data da Prova (Mais Distante)' },
    { value: 'nome', label: 'Nome (A-Z)' },
  ]
  
  // Filtrar e ordenar concursos
  const concursosFiltrados = useMemo(() => {
    let resultado = [...concursos]
    
    // Aplicar filtro de status
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter(c => c.status === filtroStatus)
    }
    
    // Aplicar ordenação
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case 'data_asc':
          // Concursos sem data vão para o final
          if (!a.dataProva) return 1
          if (!b.dataProva) return -1
          return new Date(a.dataProva).getTime() - new Date(b.dataProva).getTime()
          
        case 'data_desc':
          // Concursos sem data vão para o final
          if (!a.dataProva) return 1
          if (!b.dataProva) return -1
          return new Date(b.dataProva).getTime() - new Date(a.dataProva).getTime()
          
        case 'nome':
          return a.nome.localeCompare(b.nome, 'pt-BR')
          
        default:
          return 0
      }
    })
    
    return resultado
  }, [concursos, filtroStatus, ordenacao])
  
  // Loading state
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Skeleton para filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
        </div>
        
        {/* Skeleton para cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }
  
  // Empty state
  if (concursos.length === 0) {
    return (
      <EmptyState
        message="Nenhum concurso cadastrado"
        description="Comece adicionando um concurso que você está estudando para organizar seus estudos"
        icon={<BookOpen className="h-16 w-16" />}
        action={onAddNew ? {
          label: 'Adicionar Concurso',
          onClick: onAddNew,
        } : undefined}
        className={className}
      />
    )
  }
  
  // Empty state após filtro
  if (concursosFiltrados.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Filtrar por Status"
            options={statusOptions}
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusConcurso | 'todos')}
          />
          <Select
            label="Ordenar por"
            options={ordenacaoOptions}
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as typeof ordenacao)}
          />
        </div>
        
        <EmptyState
          message="Nenhum concurso encontrado"
          description={`Não há concursos com o status "${statusOptions.find(o => o.value === filtroStatus)?.label}"`}
          icon={<BookOpen className="h-16 w-16" />}
        />
      </div>
    )
  }
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Filtros e Ordenação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Filtrar por Status"
          options={statusOptions}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as StatusConcurso | 'todos')}
        />
        <Select
          label="Ordenar por"
          options={ordenacaoOptions}
          value={ordenacao}
          onChange={(e) => setOrdenacao(e.target.value as typeof ordenacao)}
        />
      </div>
      
      {/* Contador de resultados */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {concursosFiltrados.length === 1 ? (
          '1 concurso encontrado'
        ) : (
          `${concursosFiltrados.length} concursos encontrados`
        )}
      </div>
      
      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {concursosFiltrados.map((concurso) => (
          <ConcursoCard
            key={concurso.id}
            concurso={concurso}
            onEdit={onEdit}
            onDelete={onDelete}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  )
}
