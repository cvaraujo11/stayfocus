'use client'

import { useState, useEffect } from 'react'
import { Concurso, StatusConcurso, ConcursoFormData } from '@/app/types'
import { Input } from '@/app/components/ui/Input'
import { Select } from '@/app/components/ui/Select'
import { Button } from '@/app/components/ui/Button'
import { TagInput } from '@/app/components/ui/TagInput'
import { z } from 'zod'

// Schema de validação Zod
const concursoSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  dataProva: z.string().optional().refine(
    (date) => {
      if (!date) return true
      const dataProva = new Date(date)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      return dataProva >= hoje
    },
    'Data da prova deve ser futura'
  ),
  instituicao: z.string().max(200, 'Instituição deve ter no máximo 200 caracteres').optional(),
  cargo: z.string().max(200, 'Cargo deve ter no máximo 200 caracteres').optional(),
  disciplinas: z.array(z.string()).min(1, 'Adicione pelo menos uma disciplina'),
  status: z.enum(['em_andamento', 'concluido', 'cancelado']),
})

interface ConcursoFormProps {
  concurso?: Concurso
  onSubmit: (data: ConcursoFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

/**
 * Formulário para criar ou editar um concurso
 * Inclui validação Zod e feedback visual em tempo real
 */
export function ConcursoForm({ concurso, onSubmit, onCancel, isSubmitting = false }: ConcursoFormProps) {
  const [formData, setFormData] = useState<ConcursoFormData>({
    nome: concurso?.nome || '',
    dataProva: concurso?.dataProva || '',
    instituicao: concurso?.instituicao || '',
    cargo: concurso?.cargo || '',
    disciplinas: concurso?.disciplinas || [],
    status: concurso?.status || 'em_andamento',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  
  // Sugestões de disciplinas comuns
  const disciplinasSugestoes = [
    'Português',
    'Matemática',
    'Raciocínio Lógico',
    'Informática',
    'Direito Constitucional',
    'Direito Administrativo',
    'Direito Civil',
    'Direito Penal',
    'Direito Processual Civil',
    'Direito Processual Penal',
    'Direito Tributário',
    'Direito do Trabalho',
    'Direito Previdenciário',
    'Direito Empresarial',
    'Contabilidade',
    'Administração Pública',
    'Economia',
    'Estatística',
    'Atualidades',
    'Conhecimentos Específicos',
  ]
  
  // Opções de status
  const statusOptions = [
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' },
  ]
  
  // Validar campo individual
  const validateField = (name: keyof ConcursoFormData, value: any) => {
    try {
      const fieldSchema = concursoSchema.shape[name]
      fieldSchema.parse(value)
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    } catch (error) {
      if (error instanceof z.ZodError && error.issues && error.issues.length > 0) {
        setErrors(prev => ({
          ...prev,
          [name]: error.issues[0].message,
        }))
      }
    }
  }
  
  // Validar formulário completo
  const validateForm = (): boolean => {
    try {
      concursoSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }
  
  // Handlers de mudança
  const handleChange = (name: keyof ConcursoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Validar em tempo real se o campo já foi tocado
    if (touched[name]) {
      validateField(name, value)
    }
  }
  
  const handleBlur = (name: keyof ConcursoFormData) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, formData[name])
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Marcar todos os campos como tocados
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>)
    setTouched(allTouched)
    
    // Validar formulário
    if (!validateForm()) {
      return
    }
    
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Erro ao submeter formulário:', error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome do Concurso */}
      <Input
        label="Nome do Concurso *"
        type="text"
        value={formData.nome}
        onChange={(e) => handleChange('nome', e.target.value)}
        onBlur={() => handleBlur('nome')}
        error={touched.nome ? errors.nome : undefined}
        placeholder="Ex: TRF 2ª Região - Analista Judiciário"
        required
        disabled={isSubmitting}
      />
      
      {/* Instituição */}
      <Input
        label="Instituição"
        type="text"
        value={formData.instituicao}
        onChange={(e) => handleChange('instituicao', e.target.value)}
        onBlur={() => handleBlur('instituicao')}
        error={touched.instituicao ? errors.instituicao : undefined}
        placeholder="Ex: FGV, CESPE, FCC"
        disabled={isSubmitting}
      />
      
      {/* Cargo */}
      <Input
        label="Cargo"
        type="text"
        value={formData.cargo}
        onChange={(e) => handleChange('cargo', e.target.value)}
        onBlur={() => handleBlur('cargo')}
        error={touched.cargo ? errors.cargo : undefined}
        placeholder="Ex: Analista Judiciário - Área Administrativa"
        disabled={isSubmitting}
      />
      
      {/* Data da Prova */}
      <Input
        label="Data da Prova"
        type="date"
        value={formData.dataProva}
        onChange={(e) => handleChange('dataProva', e.target.value)}
        onBlur={() => handleBlur('dataProva')}
        error={touched.dataProva ? errors.dataProva : undefined}
        disabled={isSubmitting}
      />
      
      {/* Status */}
      <Select
        label="Status *"
        options={statusOptions}
        value={formData.status}
        onChange={(e) => handleChange('status', e.target.value as StatusConcurso)}
        onBlur={() => handleBlur('status')}
        error={touched.status ? errors.status : undefined}
        required
        disabled={isSubmitting}
      />
      
      {/* Disciplinas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Disciplinas *
        </label>
        <TagInput
          tags={formData.disciplinas}
          onChange={(disciplinas) => handleChange('disciplinas', disciplinas)}
          placeholder="Digite uma disciplina e pressione Enter"
          suggestions={disciplinasSugestoes}
        />
        {touched.disciplinas && errors.disciplinas && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.disciplinas}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Digite o nome da disciplina e pressione Enter ou vírgula para adicionar
        </p>
      </div>
      
      {/* Botões de ação */}
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
          {isSubmitting ? 'Salvando...' : concurso ? 'Atualizar' : 'Criar Concurso'}
        </Button>
      </div>
    </form>
  )
}
