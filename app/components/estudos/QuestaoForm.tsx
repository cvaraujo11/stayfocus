'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/app/components/ui/Input'
import { Textarea } from '@/app/components/ui/Textarea'
import { Select } from '@/app/components/ui/Select'
import { Button } from '@/app/components/ui/Button'
import { TagInput } from '@/app/components/ui/TagInput'
import type { Questao, LetraAlternativa, AlternativaQuestao, Concurso } from '@/app/types'

// Schema de validação Zod
const questaoSchema = z.object({
  enunciado: z.string().min(10, 'Enunciado deve ter no mínimo 10 caracteres'),
  alternativas: z.array(z.object({
    letra: z.enum(['A', 'B', 'C', 'D', 'E']),
    texto: z.string().min(1, 'Alternativa não pode estar vazia')
  })).min(2, 'Adicione pelo menos 2 alternativas').max(5, 'Máximo de 5 alternativas'),
  respostaCorreta: z.enum(['A', 'B', 'C', 'D', 'E']),
  disciplina: z.string().min(1, 'Selecione uma disciplina'),
  concursoId: z.string().optional(),
  explicacao: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

type QuestaoFormData = z.infer<typeof questaoSchema>

interface QuestaoFormProps {
  questao?: Questao
  concursos: Concurso[]
  onSubmit: (data: QuestaoFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

const LETRAS_DISPONIVEIS: LetraAlternativa[] = ['A', 'B', 'C', 'D', 'E']

/**
 * QuestaoForm - Formulário para criar/editar questões
 * 
 * Features:
 * - Validação com Zod
 * - Editor de enunciado (textarea)
 * - Gerenciamento dinâmico de alternativas (2-5)
 * - Seletor de resposta correta
 * - Campo de explicação
 * - Seletor de concurso e disciplina
 * - Input de tags
 */
export function QuestaoForm({
  questao,
  concursos,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: QuestaoFormProps) {
  // Estado do formulário
  const [enunciado, setEnunciado] = useState(questao?.enunciado || '')
  const [alternativas, setAlternativas] = useState<AlternativaQuestao[]>(
    questao?.alternativas || [
      { letra: 'A', texto: '' },
      { letra: 'B', texto: '' },
    ]
  )
  const [respostaCorreta, setRespostaCorreta] = useState<LetraAlternativa>(
    questao?.respostaCorreta || 'A'
  )
  const [disciplina, setDisciplina] = useState(questao?.disciplina || '')
  const [concursoId, setConcursoId] = useState(questao?.concursoId || '')
  const [explicacao, setExplicacao] = useState(questao?.explicacao || '')
  const [tags, setTags] = useState<string[]>(questao?.tags || [])
  
  // Estado de erros
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Extrair disciplinas únicas dos concursos
  const disciplinasDisponiveis = Array.from(
    new Set(concursos.flatMap(c => c.disciplinas))
  ).sort()
  
  // Sugestões de tags baseadas em questões existentes (pode ser expandido)
  const sugestoesTags = [
    'Jurisprudência',
    'Doutrina',
    'Legislação',
    'Conceitos',
    'Aplicação Prática',
    'Questão Difícil',
    'Questão Recorrente',
  ]
  
  // Adicionar alternativa
  const adicionarAlternativa = () => {
    if (alternativas.length >= 5) return
    
    const proximaLetra = LETRAS_DISPONIVEIS[alternativas.length]
    setAlternativas([...alternativas, { letra: proximaLetra, texto: '' }])
  }
  
  // Remover alternativa
  const removerAlternativa = (index: number) => {
    if (alternativas.length <= 2) return
    
    const novasAlternativas = alternativas.filter((_, i) => i !== index)
    // Reajustar letras
    const alternativasReajustadas = novasAlternativas.map((alt, i) => ({
      ...alt,
      letra: LETRAS_DISPONIVEIS[i],
    }))
    
    setAlternativas(alternativasReajustadas)
    
    // Ajustar resposta correta se necessário
    const letrasDisponiveis = alternativasReajustadas.map(a => a.letra)
    if (!letrasDisponiveis.includes(respostaCorreta)) {
      setRespostaCorreta(letrasDisponiveis[0])
    }
  }
  
  // Atualizar texto de alternativa
  const atualizarAlternativa = (index: number, texto: string) => {
    const novasAlternativas = [...alternativas]
    novasAlternativas[index] = { ...novasAlternativas[index], texto }
    setAlternativas(novasAlternativas)
  }
  
  // Validar e submeter
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    const formData: QuestaoFormData = {
      enunciado,
      alternativas,
      respostaCorreta,
      disciplina,
      concursoId: concursoId || undefined,
      explicacao: explicacao || undefined,
      tags: tags.length > 0 ? tags : undefined,
    }
    
    try {
      // Validar com Zod
      questaoSchema.parse(formData)
      
      // Validar que resposta correta existe nas alternativas
      const letrasAlternativas = alternativas.map(a => a.letra)
      if (!letrasAlternativas.includes(respostaCorreta)) {
        setErrors({ respostaCorreta: 'Resposta correta deve corresponder a uma alternativa' })
        return
      }
      
      await onSubmit(formData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          const path = err.path.join('.')
          newErrors[path] = err.message
        })
        setErrors(newErrors)
      } else {
        console.error('Erro ao submeter questão:', error)
      }
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Concurso (opcional) */}
      <Select
        label="Concurso (opcional)"
        options={[
          { value: '', label: 'Nenhum concurso específico' },
          ...concursos.map(c => ({ value: c.id, label: c.nome }))
        ]}
        value={concursoId}
        onChange={(e) => setConcursoId(e.target.value)}
        error={errors.concursoId}
      />
      
      {/* Disciplina */}
      <div>
        <Select
          label="Disciplina *"
          options={[
            { value: '', label: 'Selecione uma disciplina' },
            ...disciplinasDisponiveis.map(d => ({ value: d, label: d }))
          ]}
          value={disciplina}
          onChange={(e) => setDisciplina(e.target.value)}
          error={errors.disciplina}
        />
        {disciplinasDisponiveis.length === 0 && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Cadastre um concurso com disciplinas primeiro
          </p>
        )}
      </div>
      
      {/* Enunciado */}
      <Textarea
        label="Enunciado *"
        value={enunciado}
        onChange={(e) => setEnunciado(e.target.value)}
        placeholder="Digite o enunciado da questão..."
        rows={4}
        error={errors.enunciado}
      />
      
      {/* Alternativas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Alternativas * (mínimo 2, máximo 5)
        </label>
        
        <div className="space-y-2">
          {alternativas.map((alt, index) => (
            <div key={alt.letra} className="flex items-start gap-2">
              <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-sm font-semibold">
                {alt.letra}
              </div>
              
              <Input
                value={alt.texto}
                onChange={(e) => atualizarAlternativa(index, e.target.value)}
                placeholder={`Alternativa ${alt.letra}`}
                error={errors[`alternativas.${index}.texto`]}
              />
              
              {alternativas.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removerAlternativa(index)}
                  aria-label={`Remover alternativa ${alt.letra}`}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {errors.alternativas && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.alternativas}
          </p>
        )}
        
        {alternativas.length < 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={adicionarAlternativa}
            icon={<Plus className="h-4 w-4" />}
            className="mt-2"
          >
            Adicionar Alternativa
          </Button>
        )}
      </div>
      
      {/* Resposta Correta */}
      <Select
        label="Resposta Correta *"
        options={alternativas.map(alt => ({
          value: alt.letra,
          label: `${alt.letra}) ${alt.texto || '(vazia)'}`.substring(0, 50)
        }))}
        value={respostaCorreta}
        onChange={(e) => setRespostaCorreta(e.target.value as LetraAlternativa)}
        error={errors.respostaCorreta}
      />
      
      {/* Explicação */}
      <Textarea
        label="Explicação (opcional)"
        value={explicacao}
        onChange={(e) => setExplicacao(e.target.value)}
        placeholder="Explique por que a resposta está correta..."
        rows={3}
        error={errors.explicacao}
      />
      
      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags (opcional)
        </label>
        <TagInput
          tags={tags}
          onChange={setTags}
          placeholder="Adicione tags para organizar..."
          suggestions={sugestoesTags}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Pressione Enter ou vírgula para adicionar uma tag
        </p>
      </div>
      
      {/* Botões de Ação */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : questao ? 'Atualizar' : 'Adicionar'} Questão
        </Button>
      </div>
    </form>
  )
}
