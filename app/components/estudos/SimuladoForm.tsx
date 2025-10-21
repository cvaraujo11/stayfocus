'use client'

import { useState, useEffect } from 'react'
import { SimuladoFormData, Concurso, Questao } from '@/app/types'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Select } from '@/app/components/ui/Select'
import { Badge } from '@/app/components/ui/Badge'
import { Checkbox } from '@/app/components/ui/Checkbox'
import { useEstudosStore } from '@/app/stores/estudosStore'
import { X, Shuffle, FileText } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface SimuladoFormProps {
  onSubmit: (data: SimuladoFormData) => void | Promise<void>
  onCancel?: () => void
  initialData?: Partial<SimuladoFormData>
  concursos?: Concurso[]
  questoes?: Questao[]
}

type ModoSelecao = 'manual' | 'aleatoria'

/**
 * Formulário para criação/edição de simulados
 * Permite seleção manual ou aleatória de questões
 */
export function SimuladoForm({
  onSubmit,
  onCancel,
  initialData,
  concursos = [],
  questoes = [],
}: SimuladoFormProps) {
  const [titulo, setTitulo] = useState(initialData?.titulo || '')
  const [concursoId, setConcursoId] = useState<string>(initialData?.concursoId || '')
  const [tempoLimite, setTempoLimite] = useState<string>(
    initialData?.tempoLimiteMinutos?.toString() || ''
  )
  const [modoSelecao, setModoSelecao] = useState<ModoSelecao>('manual')
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState<string[]>(
    initialData?.questoesIds || []
  )
  const [quantidadeAleatoria, setQuantidadeAleatoria] = useState<string>('10')
  const [disciplinaFiltro, setDisciplinaFiltro] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Filtrar questões por concurso e disciplina
  const questoesFiltradas = questoes.filter((q) => {
    if (concursoId && q.concursoId !== concursoId) return false
    if (disciplinaFiltro && q.disciplina !== disciplinaFiltro) return false
    return true
  })

  // Obter disciplinas únicas
  const disciplinas = Array.from(
    new Set(
      questoes
        .filter((q) => !concursoId || q.concursoId === concursoId)
        .map((q) => q.disciplina)
    )
  ).sort()

  // Validar formulário
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório'
    } else if (titulo.trim().length < 3) {
      newErrors.titulo = 'Título deve ter no mínimo 3 caracteres'
    }

    if (tempoLimite && (isNaN(Number(tempoLimite)) || Number(tempoLimite) <= 0)) {
      newErrors.tempoLimite = 'Tempo limite deve ser um número positivo'
    }

    if (modoSelecao === 'manual' && questoesSelecionadas.length === 0) {
      newErrors.questoes = 'Selecione pelo menos uma questão'
    }

    if (modoSelecao === 'aleatoria') {
      const qtd = Number(quantidadeAleatoria)
      if (isNaN(qtd) || qtd <= 0) {
        newErrors.quantidadeAleatoria = 'Quantidade deve ser um número positivo'
      } else if (qtd > questoesFiltradas.length) {
        newErrors.quantidadeAleatoria = `Máximo de ${questoesFiltradas.length} questões disponíveis`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Gerar questões aleatórias
  const gerarQuestoesAleatorias = () => {
    const qtd = Number(quantidadeAleatoria)
    if (isNaN(qtd) || qtd <= 0 || qtd > questoesFiltradas.length) return

    // Embaralhar e selecionar
    const shuffled = [...questoesFiltradas].sort(() => Math.random() - 0.5)
    const selecionadas = shuffled.slice(0, qtd).map((q) => q.id)
    setQuestoesSelecionadas(selecionadas)
    setModoSelecao('manual') // Mudar para manual para mostrar preview
  }

  // Toggle seleção de questão
  const toggleQuestao = (questaoId: string) => {
    setQuestoesSelecionadas((prev) =>
      prev.includes(questaoId)
        ? prev.filter((id) => id !== questaoId)
        : [...prev, questaoId]
    )
  }

  // Selecionar todas as questões filtradas
  const selecionarTodas = () => {
    setQuestoesSelecionadas(questoesFiltradas.map((q) => q.id))
  }

  // Limpar seleção
  const limparSelecao = () => {
    setQuestoesSelecionadas([])
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setSubmitting(true)
    try {
      const data: SimuladoFormData = {
        titulo: titulo.trim(),
        concursoId: concursoId || undefined,
        questoesIds: questoesSelecionadas,
        tempoLimiteMinutos: tempoLimite ? Number(tempoLimite) : undefined,
      }

      await onSubmit(data)
    } catch (error) {
      console.error('Erro ao submeter formulário:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título do Simulado *
        </label>
        <Input
          id="titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Simulado TRF - Direito Constitucional"
          error={errors.titulo}
          disabled={submitting}
        />
      </div>

      {/* Concurso */}
      <div>
        <label htmlFor="concurso" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Concurso (opcional)
        </label>
        <Select
          id="concurso"
          value={concursoId}
          onChange={(e) => {
            setConcursoId(e.target.value)
            setDisciplinaFiltro('') // Resetar filtro de disciplina
            setQuestoesSelecionadas([]) // Limpar seleção
          }}
          disabled={submitting}
          options={[
            { value: '', label: 'Todos os concursos' },
            ...concursos.map((c) => ({ value: c.id, label: c.nome }))
          ]}
        />
      </div>

      {/* Tempo Limite */}
      <div>
        <label htmlFor="tempoLimite" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tempo Limite (minutos)
        </label>
        <Input
          id="tempoLimite"
          type="number"
          value={tempoLimite}
          onChange={(e) => setTempoLimite(e.target.value)}
          placeholder="Ex: 120"
          min="1"
          error={errors.tempoLimite}
          disabled={submitting}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Deixe em branco para simulado sem limite de tempo
        </p>
      </div>

      {/* Modo de Seleção */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Seleção de Questões *
        </label>
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={modoSelecao === 'manual' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setModoSelecao('manual')}
            disabled={submitting}
          >
            Seleção Manual
          </Button>
          <Button
            type="button"
            variant={modoSelecao === 'aleatoria' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setModoSelecao('aleatoria')}
            icon={<Shuffle className="h-4 w-4" />}
            disabled={submitting}
          >
            Seleção Aleatória
          </Button>
        </div>

        {/* Seleção Aleatória */}
        {modoSelecao === 'aleatoria' && (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <label htmlFor="disciplinaFiltro" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filtrar por Disciplina
              </label>
              <Select
                id="disciplinaFiltro"
                value={disciplinaFiltro}
                onChange={(e) => setDisciplinaFiltro(e.target.value)}
                disabled={submitting}
                options={[
                  { value: '', label: 'Todas as disciplinas' },
                  ...disciplinas.map((d) => ({ value: d, label: d }))
                ]}
              />
            </div>

            <div>
              <label htmlFor="quantidadeAleatoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantidade de Questões
              </label>
              <Input
                id="quantidadeAleatoria"
                type="number"
                value={quantidadeAleatoria}
                onChange={(e) => setQuantidadeAleatoria(e.target.value)}
                min="1"
                max={questoesFiltradas.length}
                error={errors.quantidadeAleatoria}
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {questoesFiltradas.length} questões disponíveis com os filtros atuais
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={gerarQuestoesAleatorias}
              icon={<Shuffle className="h-4 w-4" />}
              disabled={submitting || questoesFiltradas.length === 0}
              className="w-full"
            >
              Gerar Questões Aleatórias
            </Button>
          </div>
        )}

        {/* Seleção Manual */}
        {modoSelecao === 'manual' && (
          <div className="space-y-3">
            {/* Filtros */}
            <div>
              <label htmlFor="disciplinaFiltroManual" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filtrar por Disciplina
              </label>
              <Select
                id="disciplinaFiltroManual"
                value={disciplinaFiltro}
                onChange={(e) => setDisciplinaFiltro(e.target.value)}
                disabled={submitting}
                options={[
                  { value: '', label: 'Todas as disciplinas' },
                  ...disciplinas.map((d) => ({ value: d, label: d }))
                ]}
              />
            </div>

            {/* Ações em lote */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selecionarTodas}
                disabled={submitting || questoesFiltradas.length === 0}
              >
                Selecionar Todas ({questoesFiltradas.length})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={limparSelecao}
                disabled={submitting || questoesSelecionadas.length === 0}
              >
                Limpar Seleção
              </Button>
            </div>

            {/* Lista de questões */}
            <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {questoesFiltradas.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma questão disponível com os filtros atuais</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {questoesFiltradas.map((questao) => (
                    <label
                      key={questao.id}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={questoesSelecionadas.includes(questao.id)}
                        onChange={() => toggleQuestao(questao.id)}
                        disabled={submitting}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {questao.disciplina}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {questao.enunciado}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {errors.questoes && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.questoes}</p>
            )}
          </div>
        )}
      </div>

      {/* Preview de questões selecionadas */}
      {questoesSelecionadas.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {questoesSelecionadas.length}{' '}
                {questoesSelecionadas.length === 1 ? 'questão selecionada' : 'questões selecionadas'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={submitting || questoesSelecionadas.length === 0}
          className="flex-1"
        >
          {submitting ? 'Criando...' : 'Criar Simulado'}
        </Button>
      </div>
    </form>
  )
}
