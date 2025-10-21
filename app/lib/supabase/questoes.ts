/**
 * Serviço de API para gerenciamento de questões
 * Implementa CRUD completo com integração ao Supabase
 */

import { z } from 'zod'
import { createSupabaseClient } from './client'
import type { Database } from '@/app/types/database'
import type {
  Questao,
  AlternativaQuestao,
  LetraAlternativa,
  FiltrosQuestao,
  FiltrosAleatorio,
  ValidationResult,
} from '@/app/types'

// Types do banco de dados
type QuestaoRow = Database['public']['Tables']['estudos_questoes']['Row']
type QuestaoInsert = Database['public']['Tables']['estudos_questoes']['Insert']
type QuestaoUpdate = Database['public']['Tables']['estudos_questoes']['Update']

/**
 * Schema Zod para validação de questões
 */
export const questaoSchema = z.object({
  enunciado: z.string().min(10, 'Enunciado deve ter no mínimo 10 caracteres'),
  alternativas: z
    .array(
      z.object({
        letra: z.enum(['A', 'B', 'C', 'D', 'E']),
        texto: z.string().min(1, 'Texto da alternativa não pode estar vazio'),
      })
    )
    .min(2, 'A questão deve ter pelo menos 2 alternativas')
    .max(5, 'A questão deve ter no máximo 5 alternativas'),
  respostaCorreta: z.enum(['A', 'B', 'C', 'D', 'E']),
  disciplina: z.string().min(1, 'Disciplina é obrigatória'),
  explicacao: z.string().optional(),
  tags: z.array(z.string()).optional(),
  concursoId: z.string().nullable().optional(),
})

/**
 * Schema parcial para validação de atualizações
 */
export const questaoUpdateSchema = questaoSchema.partial()

/**
 * Helper para mapear do banco para o cliente
 */
export function mapQuestaoFromDB(row: QuestaoRow): Questao {
  return {
    id: row.id,
    userId: row.user_id,
    concursoId: row.concurso_id,
    disciplina: row.disciplina,
    enunciado: row.enunciado,
    alternativas: row.alternativas as AlternativaQuestao[],
    respostaCorreta: row.resposta_correta as LetraAlternativa,
    explicacao: row.explicacao,
    tags: row.tags || [],
    createdAt: row.created_at,
  }
}

/**
 * Valida uma questão antes de salvar usando Zod
 * @param questao - Questão a ser validada
 * @returns Resultado da validação
 */
export function validarQuestao(questao: Partial<Questao>): ValidationResult {
  try {
    // Validar com Zod
    questaoSchema.parse(questao)

    // Validação adicional: resposta correta deve corresponder a uma alternativa
    if (questao.alternativas && questao.respostaCorreta) {
      const alternativaCorreta = questao.alternativas.find(
        (alt) => alt.letra === questao.respostaCorreta
      )
      if (!alternativaCorreta) {
        return {
          valid: false,
          errors: ['A resposta correta deve corresponder a uma das alternativas'],
        }
      }
    }

    return {
      valid: true,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: z.ZodIssue) => {
        const path = err.path.join('.')
        return path ? `${path}: ${err.message}` : err.message
      })
      return {
        valid: false,
        errors,
      }
    }

    return {
      valid: false,
      errors: ['Erro desconhecido na validação'],
    }
  }
}

/**
 * Carrega questões do usuário com filtros opcionais
 * @param userId - ID do usuário
 * @param filtros - Filtros opcionais (concurso, disciplina, tags, busca)
 * @returns Lista de questões
 */
export async function carregarQuestoes(
  userId: string,
  filtros?: FiltrosQuestao
): Promise<Questao[]> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    const supabase = createSupabaseClient()

    let query = supabase
      .from('estudos_questoes')
      .select('*')
      .eq('user_id', userId)

    // Aplicar filtros
    if (filtros?.concursoId) {
      query = query.eq('concurso_id', filtros.concursoId)
    }

    if (filtros?.disciplina) {
      query = query.eq('disciplina', filtros.disciplina)
    }

    if (filtros?.tags && filtros.tags.length > 0) {
      query = query.contains('tags', filtros.tags)
    }

    if (filtros?.busca) {
      query = query.ilike('enunciado', `%${filtros.busca}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar questões:', error)
      throw new Error(`Erro ao carregar questões: ${error.message}`)
    }

    return (data || []).map(mapQuestaoFromDB)
  } catch (error) {
    console.error('Erro inesperado ao carregar questões:', error)
    throw error
  }
}

/**
 * Carrega uma questão específica por ID
 * @param id - ID da questão
 * @param userId - ID do usuário
 * @returns Questão encontrada ou null
 */
export async function carregarQuestaoPorId(
  id: string,
  userId: string
): Promise<Questao | null> {
  try {
    if (!id || !userId) {
      throw new Error('ID da questão e ID do usuário são obrigatórios')
    }

    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('estudos_questoes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum registro encontrado
        console.warn(`Questão não encontrada: ${id}`)
        return null
      }
      console.error('Erro ao carregar questão:', error)
      throw new Error(`Erro ao carregar questão: ${error.message}`)
    }

    return mapQuestaoFromDB(data)
  } catch (error) {
    console.error('Erro inesperado ao carregar questão:', error)
    throw error
  }
}

/**
 * Carrega questões de um concurso específico
 * @param concursoId - ID do concurso
 * @param userId - ID do usuário
 * @returns Lista de questões do concurso
 */
export async function carregarQuestoesPorConcurso(
  concursoId: string,
  userId: string
): Promise<Questao[]> {
  try {
    if (!concursoId || !userId) {
      throw new Error('ID do concurso e ID do usuário são obrigatórios')
    }

    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('estudos_questoes')
      .select('*')
      .eq('concurso_id', concursoId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar questões do concurso:', error)
      throw new Error(`Erro ao carregar questões do concurso: ${error.message}`)
    }

    return (data || []).map(mapQuestaoFromDB)
  } catch (error) {
    console.error('Erro inesperado ao carregar questões do concurso:', error)
    throw error
  }
}

/**
 * Carrega questões de uma disciplina específica
 * @param disciplina - Nome da disciplina
 * @param userId - ID do usuário
 * @returns Lista de questões da disciplina
 */
export async function carregarQuestoesPorDisciplina(
  disciplina: string,
  userId: string
): Promise<Questao[]> {
  try {
    if (!disciplina || !userId) {
      throw new Error('Disciplina e ID do usuário são obrigatórios')
    }

    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('estudos_questoes')
      .select('*')
      .eq('disciplina', disciplina)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar questões da disciplina:', error)
      throw new Error(`Erro ao carregar questões da disciplina: ${error.message}`)
    }

    return (data || []).map(mapQuestaoFromDB)
  } catch (error) {
    console.error('Erro inesperado ao carregar questões da disciplina:', error)
    throw error
  }
}

/**
 * Busca questões por texto no enunciado ou tags
 * @param termo - Termo de busca
 * @param userId - ID do usuário
 * @returns Lista de questões encontradas
 */
export async function buscarQuestoes(
  termo: string,
  userId: string
): Promise<Questao[]> {
  try {
    if (!termo || !userId) {
      throw new Error('Termo de busca e ID do usuário são obrigatórios')
    }

    const supabase = createSupabaseClient()

    // Buscar no enunciado
    const { data, error } = await supabase
      .from('estudos_questoes')
      .select('*')
      .eq('user_id', userId)
      .or(`enunciado.ilike.%${termo}%,tags.cs.{${termo}}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar questões:', error)
      throw new Error(`Erro ao buscar questões: ${error.message}`)
    }

    return (data || []).map(mapQuestaoFromDB)
  } catch (error) {
    console.error('Erro inesperado ao buscar questões:', error)
    throw error
  }
}

/**
 * Adiciona uma nova questão
 * @param questao - Dados da questão (sem id e createdAt)
 * @param userId - ID do usuário
 * @returns Questão criada
 */
export async function adicionarQuestao(
  questao: Omit<Questao, 'id' | 'userId' | 'createdAt'>,
  userId: string
): Promise<Questao> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    // Validar questão
    const validation = validarQuestao(questao)
    if (!validation.valid) {
      throw new Error(`Validação falhou: ${validation.errors?.join(', ')}`)
    }

    const supabase = createSupabaseClient()

    const questaoData: QuestaoInsert = {
      user_id: userId,
      concurso_id: questao.concursoId || null,
      disciplina: questao.disciplina.trim(),
      enunciado: questao.enunciado.trim(),
      alternativas: questao.alternativas as unknown as Database['public']['Tables']['estudos_questoes']['Insert']['alternativas'],
      resposta_correta: questao.respostaCorreta,
      explicacao: questao.explicacao?.trim() || null,
      tags: questao.tags || [],
    }

    const { data, error } = await supabase
      .from('estudos_questoes')
      .insert(questaoData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao adicionar questão:', error)
      throw new Error(`Erro ao adicionar questão: ${error.message}`)
    }

    return mapQuestaoFromDB(data)
  } catch (error) {
    console.error('Erro inesperado ao adicionar questão:', error)
    throw error
  }
}

/**
 * Atualiza uma questão existente
 * @param id - ID da questão
 * @param updates - Campos a serem atualizados
 * @param userId - ID do usuário
 * @returns Questão atualizada
 */
export async function atualizarQuestao(
  id: string,
  updates: Partial<Omit<Questao, 'id' | 'userId' | 'createdAt'>>,
  userId: string
): Promise<Questao> {
  try {
    if (!id || !userId) {
      throw new Error('ID da questão e ID do usuário são obrigatórios')
    }

    // Validar se há atualizações
    if (Object.keys(updates).length === 0) {
      throw new Error('Nenhuma atualização fornecida')
    }

    // Se estiver atualizando campos críticos, validar
    if (
      updates.enunciado !== undefined ||
      updates.alternativas !== undefined ||
      updates.respostaCorreta !== undefined
    ) {
      // Carregar questão atual para validação completa
      const questaoAtual = await carregarQuestaoPorId(id, userId)
      if (!questaoAtual) {
        throw new Error('Questão não encontrada')
      }

      const questaoParaValidar = {
        ...questaoAtual,
        ...updates,
      }

      const validation = validarQuestao(questaoParaValidar)
      if (!validation.valid) {
        throw new Error(`Validação falhou: ${validation.errors?.join(', ')}`)
      }
    }

    const supabase = createSupabaseClient()

    const updateData: QuestaoUpdate = {}

    if (updates.concursoId !== undefined) updateData.concurso_id = updates.concursoId
    if (updates.disciplina !== undefined) updateData.disciplina = updates.disciplina.trim()
    if (updates.enunciado !== undefined) updateData.enunciado = updates.enunciado.trim()
    if (updates.alternativas !== undefined)
      updateData.alternativas = updates.alternativas as unknown as Database['public']['Tables']['estudos_questoes']['Update']['alternativas']
    if (updates.respostaCorreta !== undefined)
      updateData.resposta_correta = updates.respostaCorreta
    if (updates.explicacao !== undefined)
      updateData.explicacao = updates.explicacao?.trim() || null
    if (updates.tags !== undefined) updateData.tags = updates.tags

    const { data, error } = await supabase
      .from('estudos_questoes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar questão:', error)
      throw new Error(`Erro ao atualizar questão: ${error.message}`)
    }

    return mapQuestaoFromDB(data)
  } catch (error) {
    console.error('Erro inesperado ao atualizar questão:', error)
    throw error
  }
}

/**
 * Remove uma questão
 * @param id - ID da questão
 * @param userId - ID do usuário
 */
export async function removerQuestao(id: string, userId: string): Promise<void> {
  try {
    if (!id || !userId) {
      throw new Error('ID da questão e ID do usuário são obrigatórios')
    }

    const supabase = createSupabaseClient()

    // Verificar se a questão existe
    const questao = await carregarQuestaoPorId(id, userId)
    if (!questao) {
      throw new Error('Questão não encontrada')
    }

    // Verificar se a questão está vinculada a algum simulado
    const { data: simulados, error: simuladosError } = await supabase
      .from('estudos_simulados')
      .select('id, titulo')
      .eq('user_id', userId)
      .contains('questoes_ids', [id])

    if (simuladosError) {
      console.error('Erro ao verificar simulados vinculados:', simuladosError)
      // Continuar mesmo com erro na verificação
    }

    if (simulados && simulados.length > 0) {
      const titulosSimulados = simulados.map((s) => s.titulo).join(', ')
      console.warn(
        `Removendo questão vinculada a ${simulados.length} simulado(s): ${titulosSimulados}`
      )
    }

    // Remover a questão
    const { error } = await supabase
      .from('estudos_questoes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao remover questão:', error)
      throw new Error(`Erro ao remover questão: ${error.message}`)
    }
  } catch (error) {
    console.error('Erro inesperado ao remover questão:', error)
    throw error
  }
}

/**
 * Gera questões aleatórias baseadas em filtros
 * @param filtros - Filtros para seleção (concurso, disciplinas, tags)
 * @param quantidade - Número de questões a gerar
 * @param userId - ID do usuário
 * @returns Lista de questões aleatórias
 */
export async function gerarQuestoesAleatorias(
  filtros: FiltrosAleatorio,
  quantidade: number,
  userId: string
): Promise<Questao[]> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    if (quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero')
    }

    const supabase = createSupabaseClient()

    let query = supabase
      .from('estudos_questoes')
      .select('*')
      .eq('user_id', userId)

    // Aplicar filtros
    if (filtros.concursoId) {
      query = query.eq('concurso_id', filtros.concursoId)
    }

    if (filtros.disciplinas && filtros.disciplinas.length > 0) {
      query = query.in('disciplina', filtros.disciplinas)
    }

    if (filtros.tags && filtros.tags.length > 0) {
      query = query.contains('tags', filtros.tags)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao gerar questões aleatórias:', error)
      throw new Error(`Erro ao gerar questões aleatórias: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return []
    }

    // Embaralhar e selecionar quantidade desejada
    const questoes = data.map(mapQuestaoFromDB)
    const embaralhadas = questoes.sort(() => Math.random() - 0.5)
    return embaralhadas.slice(0, Math.min(quantidade, embaralhadas.length))
  } catch (error) {
    console.error('Erro inesperado ao gerar questões aleatórias:', error)
    throw error
  }
}

/**
 * Carrega questões com paginação
 * @param userId - ID do usuário
 * @param page - Número da página (começa em 1)
 * @param pageSize - Tamanho da página
 * @returns Objeto com questões e total
 */
export async function carregarQuestoesPaginadas(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ questoes: Questao[]; total: number }> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    if (page < 1) {
      throw new Error('Número da página deve ser maior ou igual a 1')
    }

    if (pageSize < 1 || pageSize > 100) {
      throw new Error('Tamanho da página deve estar entre 1 e 100')
    }

    const supabase = createSupabaseClient()

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('estudos_questoes')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Erro ao carregar questões paginadas:', error)
      throw new Error(`Erro ao carregar questões paginadas: ${error.message}`)
    }

    return {
      questoes: (data || []).map(mapQuestaoFromDB),
      total: count || 0,
    }
  } catch (error) {
    console.error('Erro inesperado ao carregar questões paginadas:', error)
    throw error
  }
}
