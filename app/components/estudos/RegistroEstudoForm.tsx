'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Input } from '@/app/components/ui/Input'
import { Select } from '@/app/components/ui/Select'
import { Textarea } from '@/app/components/ui/Textarea'
import { Button } from '@/app/components/ui/Button'
import { TagInput } from '@/app/components/ui/TagInput'
import type { RegistroEstudo, RegistroEstudoFormData } from '@/app/types'

// Schema de validação Zod
const registroEstudoSchema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  disciplina: z.string().min(1, 'Selecione uma disciplina'),
  duracaoMinutos: z.number()
    .min(1, 'Duração deve ser maior que zero')
    .max(1440, 'Duração não pode exceder 24 horas (1440 minutos)'),
  topicos: z.array(z.string()).min(0),
  observacoes: z.string().optional(),
})

interface RegistroEstudoFormProps {
  registro?: RegistroEstudo
  disciplinasDisponiveis: string[]
  onSubmit: (data: RegistroEstudoFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

/**
 * RegistroEstudoForm - Formulário para registrar sessões de estudo
 * 
 * Features:
 * - Validação com Zod
 * - Seletor de data
 * - Seletor de disciplina
 * - Input de duração (horas e minutos)
 * - Input de tópicos (tags)
 * - Campo de observações
 */
export function RegistroEstudoForm({
  registro,
  disciplinasDisponiveis,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: RegistroEstudoFormProps) {
  // Estado do formulário
  const [data, setData] = useState(
    registro?.data || new Date().toISOString().split('T')[0]
  )
  const [disciplina, setDisciplina] = useState(registro?.disciplina || '')
  const [horas, setHoras] = useState(
    registro ? Math.floor(registro.duracaoMinutos / 60).toString() : '0'
  )
  const [minutos, setMinutos] = useState(
    registro ? (registro.duracaoMinutos % 60).toString() : '0'
  )
  const [topicos, setTopicos] = useState<string[]>(registro?.topicos || [])
  const [observacoes, setObservacoes] = useState(registro?.observacoes || '')
  
  // Estado de erros
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  
  // Sugestões de tópicos comuns
  const sugestoesTopicos = [
    'Teoria',
    'Exercícios',
    'Revisão',
    'Simulado',
    'Leitura de Lei',
    'Jurisprudência',
    'Doutrina',
    'Videoaula',
    'Resumo',
    'Mapas Mentais',
  ]
  
  // Validar campo individual
  const validateField = (name: string, value: any) => {
    try {
      const fieldSchema = registroEstudoSchema.shape[name as keyof typeof registroEstudoSchema.shape]
      if (fieldSchema) {
        fieldSchema.parse(value)
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [name]: error.issues[0].message,
        }))
      }
    }
  }
  
  // Validar duração
  const validateDuracao = () => {
    const horasNum = parseInt(horas) || 0
    const minutosNum = parseInt(minutos) || 0
    const duracaoTotal = horasNum * 60 + minutosNum
    
    try {
      registroEstudoSchema.shape.duracaoMinutos.parse(duracaoTotal)
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.duracao
        return newErrors
      })
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          duracao: error.issues[0].message,
        }))
      }
      return false
    }
  }
  
  // Validar formulário completo
  const validateForm = (): boolean => {
    const horasNum = parseInt(horas) || 0
    const minutosNum = parseInt(minutos) || 0
    const duracaoMinutos = horasNum * 60 + minutosNum
    
    const formData: RegistroEstudoFormData = {
      data,
      disciplina,
      duracaoMinutos,
      topicos,
      observacoes: observacoes || undefined,
    }
    
    try {
      registroEstudoSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }
  
  // Handlers
  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    if (name === 'horas' || name === 'minutos') {
      validateDuracao()
    } else if (name === 'data') {
      validateField('data', data)
    } else if (name === 'disciplina') {
      validateField('disciplina', disciplina)
    }
  }
  
  const handleHorasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Permitir apenas números
    if (value === '' || /^\d+$/.test(value)) {
      const num = parseInt(value) || 0
      // Limitar a 24 horas
      if (num <= 24) {
        setHoras(value)
        if (touched.horas || touched.minutos) {
          validateDuracao()
        }
      }
    }
  }
  
  const handleMinutosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Permitir apenas números
    if (value === '' || /^\d+$/.test(value)) {
      const num = parseInt(value) || 0
      // Limitar a 59 minutos
      if (num <= 59) {
        setMinutos(value)
        if (touched.horas || touched.minutos) {
          validateDuracao()
        }
      }
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Marcar todos os campos como tocados
    setTouched({
      data: true,
      disciplina: true,
      horas: true,
      minutos: true,
      topicos: true,
      observacoes: true,
    })
    
    // Validar formulário
    if (!validateForm()) {
      return
    }
    
    const horasNum = parseInt(horas) || 0
    const minutosNum = parseInt(minutos) || 0
    const duracaoMinutos = horasNum * 60 + minutosNum
    
    const formData: RegistroEstudoFormData = {
      data,
      disciplina,
      duracaoMinutos,
      topicos,
      observacoes: observacoes || undefined,
    }
    
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Erro ao submeter registro:', error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Data */}
      <Input
        label="Data *"
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        onBlur={() => handleBlur('data')}
        error={touched.data ? errors.data : undefined}
        max={new Date().toISOString().split('T')[0]}
        required
        disabled={isSubmitting}
      />
      
      {/* Disciplina */}
      <Select
        label="Disciplina *"
        options={[
          { value: '', label: 'Selecione uma disciplina' },
          ...disciplinasDisponiveis.map(d => ({ value: d, label: d }))
        ]}
        value={disciplina}
        onChange={(e) => setDisciplina(e.target.value)}
        onBlur={() => handleBlur('disciplina')}
        error={touched.disciplina ? errors.disciplina : undefined}
        required
        disabled={isSubmitting}
      />
      
      {disciplinasDisponiveis.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
          Cadastre um concurso com disciplinas primeiro
        </p>
      )}
      
      {/* Duração (Horas e Minutos) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Duração *
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                inputMode="numeric"
                value={horas}
                onChange={handleHorasChange}
                onBlur={() => handleBlur('horas')}
                placeholder="0"
                className="text-center"
                disabled={isSubmitting}
                aria-label="Horas"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">h</span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                inputMode="numeric"
                value={minutos}
                onChange={handleMinutosChange}
                onBlur={() => handleBlur('minutos')}
                placeholder="0"
                className="text-center"
                disabled={isSubmitting}
                aria-label="Minutos"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">min</span>
            </div>
          </div>
        </div>
        
        {(touched.horas || touched.minutos) && errors.duracao && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.duracao}
          </p>
        )}
        
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Digite a duração da sessão de estudo (máximo 24 horas)
        </p>
      </div>
      
      {/* Tópicos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tópicos Estudados
        </label>
        <TagInput
          tags={topicos}
          onChange={setTopicos}
          placeholder="Digite um tópico e pressione Enter"
          suggestions={sugestoesTopicos}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Adicione os tópicos que você estudou nesta sessão
        </p>
      </div>
      
      {/* Observações */}
      <Textarea
        label="Observações"
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        onBlur={() => handleBlur('observacoes')}
        placeholder="Adicione observações sobre esta sessão de estudo..."
        rows={3}
        disabled={isSubmitting}
      />
      
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
          {isSubmitting ? 'Salvando...' : registro ? 'Atualizar' : 'Registrar'} Estudo
        </Button>
      </div>
    </form>
  )
}
