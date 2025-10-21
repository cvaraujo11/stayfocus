'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react'
import { Input } from '@/app/components/ui/Input'
import { Select } from '@/app/components/ui/Select'
import { Button } from '@/app/components/ui/Button'
import { Badge } from '@/app/components/ui/Badge'
import { EmptyState } from '@/app/components/common/EmptyState'
import { QuestaoCard } from './QuestaoCard'
import { debounce } from '@/app/lib/utils'
import type { Questao, Concurso } from '@/app/types'

type OrdenacaoTipo = 'data-desc' | 'data-asc' | 'disciplina-asc' | 'disciplina-desc'

interface QuestoesListProps {
  questoes: Questao[]
  concursos: Concurso[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
  isLoading?: boolean
}

/**
 * QuestoesList - Lista de questões com filtros e busca
 * 
 * Features:
 * - Filtros por concurso, disciplina e tags
 * - Barra de busca
 * - Ordenação (data, disciplina)
 * - Estado vazio
 * - Loading skeleton
 */
export function QuestoesList({
  questoes,
  concursos,
  onEdit,
  onDelete,
  onClick,
  isLoading = false,
}: QuestoesListProps) {
  // Estados de filtros
  const [busca, setBusca] = useState('')
  const [buscaDebounced, setBuscaDebounced] = useState('')
  const [concursoFiltro, setConcursoFiltro] = useState<string>('')
  const [disciplinaFiltro, setDisciplinaFiltro] = useState<string>('')
  const [tagFiltro, setTagFiltro] = useState<string>('')
  const [ordenacao, setOrdenacao] = useState<OrdenacaoTipo>('data-desc')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  
  // Ref para a função debounced
  const debouncedSetBusca = useRef(
    debounce((value: string) => {
      setBuscaDebounced(value)
    }, 300)
  ).current
  
  // Aplicar debounce quando busca mudar
  useEffect(() => {
    debouncedSetBusca(busca)
  }, [busca, debouncedSetBusca])
  
  // Extrair disciplinas e tags únicas
  const disciplinasDisponiveis = useMemo(() => {
    return Array.from(new Set(questoes.map(q => q.disciplina))).sort()
  }, [questoes])
  
  const tagsDisponiveis = useMemo(() => {
    const todasTags = questoes.flatMap(q => q.tags || [])
    return Array.from(new Set(todasTags)).sort()
  }, [questoes])
  
  // Filtrar e ordenar questões
  const questoesFiltradas = useMemo(() => {
    let resultado = [...questoes]
    
    // Filtro de busca (enunciado) - usando valor debounced
    if (buscaDebounced.trim()) {
      const buscaLower = buscaDebounced.toLowerCase()
      resultado = resultado.filter(q =>
        q.enunciado.toLowerCase().includes(buscaLower) ||
        q.alternativas.some(alt => alt.texto.toLowerCase().includes(buscaLower))
      )
    }
    
    // Filtro de concurso
    if (concursoFiltro) {
      resultado = resultado.filter(q => q.concursoId === concursoFiltro)
    }
    
    // Filtro de disciplina
    if (disciplinaFiltro) {
      resultado = resultado.filter(q => q.disciplina === disciplinaFiltro)
    }
    
    // Filtro de tag
    if (tagFiltro) {
      resultado = resultado.filter(q => q.tags?.includes(tagFiltro))
    }
    
    // Ordenação
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case 'data-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'data-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'disciplina-asc':
          return a.disciplina.localeCompare(b.disciplina)
        case 'disciplina-desc':
          return b.disciplina.localeCompare(a.disciplina)
        default:
          return 0
      }
    })
    
    return resultado
  }, [questoes, buscaDebounced, concursoFiltro, disciplinaFiltro, tagFiltro, ordenacao])
  
  // Memoizar handlers de mudança de filtros
  const handleBuscaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBusca(e.target.value)
  }, [])
  
  const handleConcursoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setConcursoFiltro(e.target.value)
  }, [])
  
  const handleDisciplinaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDisciplinaFiltro(e.target.value)
  }, [])
  
  const handleTagChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTagFiltro(e.target.value)
  }, [])
  
  const handleOrdenacaoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrdenacao(e.target.value as OrdenacaoTipo)
  }, [])
  
  const toggleFiltros = useCallback(() => {
    setMostrarFiltros(prev => !prev)
  }, [])
  
  // Limpar todos os filtros
  const limparFiltros = useCallback(() => {
    setBusca('')
    setBuscaDebounced('')
    setConcursoFiltro('')
    setDisciplinaFiltro('')
    setTagFiltro('')
    setOrdenacao('data-desc')
  }, [])
  
  // Verificar se há filtros ativos
  const temFiltrosAtivos = buscaDebounced || concursoFiltro || disciplinaFiltro || tagFiltro
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 animate-pulse"
          />
        ))}
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Barra de Busca e Controles */}
      <div className="space-y-3">
        {/* Busca e Botões */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar questões..."
              value={busca}
              onChange={handleBuscaChange}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={mostrarFiltros ? 'primary' : 'outline'}
              size="default"
              onClick={toggleFiltros}
              icon={<Filter className="h-4 w-4" />}
            >
              Filtros
            </Button>
            
            <Select
              options={[
                { value: 'data-desc', label: 'Mais Recentes' },
                { value: 'data-asc', label: 'Mais Antigas' },
                { value: 'disciplina-asc', label: 'Disciplina A-Z' },
                { value: 'disciplina-desc', label: 'Disciplina Z-A' },
              ]}
              value={ordenacao}
              onChange={handleOrdenacaoChange}
              className="w-40"
            />
          </div>
        </div>
        
        {/* Painel de Filtros */}
        {mostrarFiltros && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Concurso"
                options={[
                  { value: '', label: 'Todos os concursos' },
                  ...concursos.map(c => ({ value: c.id, label: c.nome }))
                ]}
                value={concursoFiltro}
                onChange={handleConcursoChange}
              />
              
              <Select
                label="Disciplina"
                options={[
                  { value: '', label: 'Todas as disciplinas' },
                  ...disciplinasDisponiveis.map(d => ({ value: d, label: d }))
                ]}
                value={disciplinaFiltro}
                onChange={handleDisciplinaChange}
              />
              
              <Select
                label="Tag"
                options={[
                  { value: '', label: 'Todas as tags' },
                  ...tagsDisponiveis.map(t => ({ value: t, label: t }))
                ]}
                value={tagFiltro}
                onChange={handleTagChange}
              />
            </div>
            
            {temFiltrosAtivos && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {questoesFiltradas.length} questão(ões) encontrada(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limparFiltros}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Filtros Ativos (badges) */}
        {temFiltrosAtivos && !mostrarFiltros && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Filtros ativos:
            </span>
            
            {buscaDebounced && (
              <Badge variant="primary">
                Busca: "{buscaDebounced}"
              </Badge>
            )}
            
            {concursoFiltro && (
              <Badge variant="primary">
                Concurso: {concursos.find(c => c.id === concursoFiltro)?.nome}
              </Badge>
            )}
            
            {disciplinaFiltro && (
              <Badge variant="primary">
                Disciplina: {disciplinaFiltro}
              </Badge>
            )}
            
            {tagFiltro && (
              <Badge variant="primary">
                Tag: {tagFiltro}
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={limparFiltros}
            >
              Limpar
            </Button>
          </div>
        )}
      </div>
      
      {/* Lista de Questões */}
      {questoesFiltradas.length === 0 ? (
        <EmptyState
          message={temFiltrosAtivos ? 'Nenhuma questão encontrada' : 'Nenhuma questão cadastrada'}
          description={
            temFiltrosAtivos
              ? 'Tente ajustar os filtros ou buscar por outros termos'
              : 'Comece adicionando questões ao seu banco de questões'
          }
          action={
            temFiltrosAtivos
              ? {
                  label: 'Limpar Filtros',
                  onClick: limparFiltros,
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {questoesFiltradas.map((questao) => (
            <QuestaoCard
              key={questao.id}
              questao={questao}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onClick}
            />
          ))}
        </div>
      )}
      
      {/* Contador de Resultados */}
      {questoesFiltradas.length > 0 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4">
          Exibindo {questoesFiltradas.length} de {questoes.length} questão(ões)
        </div>
      )}
    </div>
  )
}
