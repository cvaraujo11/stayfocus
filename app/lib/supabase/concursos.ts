/**
 * Serviço de API para gerenciamento de concursos
 * Implementa CRUD completo com integração ao Supabase
 */

import { createSupabaseClient } from './client'
import type { Database } from '@/app/types/database'
import type { Concurso, StatusConcurso } from '@/app/types'

// Types do banco de dados
type ConcursoRow = Database['public']['Tables']['estudos_concursos']['Row']
type ConcursoInsert = Database['public']['Tables']['estudos_concursos']['Insert']
type ConcursoUpdate = Database['public']['Tables']['estudos_concursos']['Update']

/**
 * Helper para mapear do banco para o cliente
 */
function mapConcursoFromDB(row: ConcursoRow): Concurso {
  return {
    id: row.id,
    userId: row.user_id,
    nome: row.nome,
    dataProva: row.data_prova,
    instituicao: row.instituicao,
    cargo: row.cargo,
    disciplinas: row.disciplinas || [],
    status: row.status as StatusConcurso,
    createdAt: row.created_at,
  }
}

/**
 * Calcula o número de dias até a prova
 * @param dataProva - Data da prova no formato YYYY-MM-DD
 * @returns Número de dias até a prova (negativo se já passou)
 */
export function calcularDiasAteProva(dataProva: string): number {
  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const prova = new Date(dataProva)
    prova.setHours(0, 0, 0, 0)
    
    const diffTime = prova.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  } catch (error) {
    console.error('Erro ao calcular dias até a prova:', error)
    return 0
  }
}

/**
 * Carrega todos os concursos do usuário
 * @param userId - ID do usuário
 * @returns Lista de concursos ordenados por data da prova
 */
export async function carregarConcursos(userId: string): Promise<Concurso[]> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('estudos_concursos')
      .select('*')
      .eq('user_id', userId)
      .order('data_prova', { ascending: true, nullsFirst: false })
    
    if (error) {
      console.error('Erro ao carregar concursos:', error)
      throw new Error(`Erro ao carregar concursos: ${error.message}`)
    }
    
    return (data || []).map(mapConcursoFromDB)
  } catch (error) {
    console.error('Erro inesperado ao carregar concursos:', error)
    throw error
  }
}

/**
 * Carrega um concurso específico por ID
 * @param id - ID do concurso
 * @param userId - ID do usuário
 * @returns Concurso encontrado ou null
 */
export async function carregarConcursoPorId(
  id: string,
  userId: string
): Promise<Concurso | null> {
  try {
    if (!id || !userId) {
      throw new Error('ID do concurso e ID do usuário são obrigatórios')
    }

    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('estudos_concursos')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum registro encontrado
        console.warn(`Concurso não encontrado: ${id}`)
        return null
      }
      console.error('Erro ao carregar concurso:', error)
      throw new Error(`Erro ao carregar concurso: ${error.message}`)
    }
    
    return mapConcursoFromDB(data)
  } catch (error) {
    console.error('Erro inesperado ao carregar concurso:', error)
    throw error
  }
}

/**
 * Carrega apenas os concursos ativos (em andamento)
 * @param userId - ID do usuário
 * @returns Lista de concursos ativos
 */
export async function carregarConcursosAtivos(userId: string): Promise<Concurso[]> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('estudos_concursos')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'em_andamento')
      .order('data_prova', { ascending: true, nullsFirst: false })
    
    if (error) {
      console.error('Erro ao carregar concursos ativos:', error)
      throw new Error(`Erro ao carregar concursos ativos: ${error.message}`)
    }
    
    return (data || []).map(mapConcursoFromDB)
  } catch (error) {
    console.error('Erro inesperado ao carregar concursos ativos:', error)
    throw error
  }
}

/**
 * Adiciona um novo concurso
 * @param concurso - Dados do concurso (sem id e createdAt)
 * @param userId - ID do usuário
 * @returns Concurso criado
 */
export async function adicionarConcurso(
  concurso: Omit<Concurso, 'id' | 'userId' | 'createdAt'>,
  userId: string
): Promise<Concurso> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    if (!concurso.nome || concurso.nome.trim().length === 0) {
      throw new Error('Nome do concurso é obrigatório')
    }

    if (concurso.nome.length > 200) {
      throw new Error('Nome do concurso deve ter no máximo 200 caracteres')
    }

    if (concurso.disciplinas.length === 0) {
      throw new Error('Adicione pelo menos uma disciplina')
    }

    // Validar data da prova se fornecida
    if (concurso.dataProva) {
      const dataProva = new Date(concurso.dataProva)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      
      if (dataProva < hoje) {
        throw new Error('Data da prova não pode estar no passado')
      }
    }

    const supabase = createSupabaseClient()
    
    const concursoData: ConcursoInsert = {
      user_id: userId,
      nome: concurso.nome.trim(),
      data_prova: concurso.dataProva || null,
      instituicao: concurso.instituicao?.trim() || null,
      cargo: concurso.cargo?.trim() || null,
      disciplinas: concurso.disciplinas,
      status: concurso.status,
    }
    
    const { data, error } = await supabase
      .from('estudos_concursos')
      .insert(concursoData)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao adicionar concurso:', error)
      throw new Error(`Erro ao adicionar concurso: ${error.message}`)
    }
    
    return mapConcursoFromDB(data)
  } catch (error) {
    console.error('Erro inesperado ao adicionar concurso:', error)
    throw error
  }
}

/**
 * Atualiza um concurso existente
 * @param id - ID do concurso
 * @param updates - Campos a serem atualizados
 * @param userId - ID do usuário
 * @returns Concurso atualizado
 */
export async function atualizarConcurso(
  id: string,
  updates: Partial<Omit<Concurso, 'id' | 'userId' | 'createdAt'>>,
  userId: string
): Promise<Concurso> {
  try {
    if (!id || !userId) {
      throw new Error('ID do concurso e ID do usuário são obrigatórios')
    }

    // Validações
    if (updates.nome !== undefined) {
      if (!updates.nome || updates.nome.trim().length === 0) {
        throw new Error('Nome do concurso é obrigatório')
      }
      if (updates.nome.length > 200) {
        throw new Error('Nome do concurso deve ter no máximo 200 caracteres')
      }
    }

    if (updates.disciplinas !== undefined && updates.disciplinas.length === 0) {
      throw new Error('Adicione pelo menos uma disciplina')
    }

    // Validar data da prova se fornecida
    if (updates.dataProva !== undefined && updates.dataProva !== null) {
      const dataProva = new Date(updates.dataProva)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      
      if (dataProva < hoje) {
        throw new Error('Data da prova não pode estar no passado')
      }
    }

    const supabase = createSupabaseClient()
    
    const updateData: ConcursoUpdate = {}
    
    if (updates.nome !== undefined) updateData.nome = updates.nome.trim()
    if (updates.dataProva !== undefined) updateData.data_prova = updates.dataProva
    if (updates.instituicao !== undefined) updateData.instituicao = updates.instituicao?.trim() || null
    if (updates.cargo !== undefined) updateData.cargo = updates.cargo?.trim() || null
    if (updates.disciplinas !== undefined) updateData.disciplinas = updates.disciplinas
    if (updates.status !== undefined) updateData.status = updates.status
    
    const { data, error } = await supabase
      .from('estudos_concursos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao atualizar concurso:', error)
      throw new Error(`Erro ao atualizar concurso: ${error.message}`)
    }
    
    return mapConcursoFromDB(data)
  } catch (error) {
    console.error('Erro inesperado ao atualizar concurso:', error)
    throw error
  }
}

/**
 * Remove um concurso e todas as questões e simulados vinculados
 * @param id - ID do concurso
 * @param userId - ID do usuário
 */
export async function removerConcurso(id: string, userId: string): Promise<void> {
  try {
    if (!id || !userId) {
      throw new Error('ID do concurso e ID do usuário são obrigatórios')
    }

    const supabase = createSupabaseClient()
    
    // Verificar se o concurso existe
    const concurso = await carregarConcursoPorId(id, userId)
    if (!concurso) {
      throw new Error('Concurso não encontrado')
    }
    
    // Contar questões vinculadas
    const { count: questoesCount } = await supabase
      .from('estudos_questoes')
      .select('*', { count: 'exact', head: true })
      .eq('concurso_id', id)
      .eq('user_id', userId)
    
    // Contar simulados vinculados
    const { count: simuladosCount } = await supabase
      .from('estudos_simulados')
      .select('*', { count: 'exact', head: true })
      .eq('concurso_id', id)
      .eq('user_id', userId)
    
    // Log de aviso se houver dados vinculados
    if (questoesCount && questoesCount > 0) {
      console.warn(`Removendo concurso com ${questoesCount} questões vinculadas`)
    }
    if (simuladosCount && simuladosCount > 0) {
      console.warn(`Removendo concurso com ${simuladosCount} simulados vinculados`)
    }
    
    // Remover o concurso (cascade irá remover questões e simulados vinculados)
    const { error } = await supabase
      .from('estudos_concursos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Erro ao remover concurso:', error)
      throw new Error(`Erro ao remover concurso: ${error.message}`)
    }
  } catch (error) {
    console.error('Erro inesperado ao remover concurso:', error)
    throw error
  }
}

/**
 * Conta o número de questões vinculadas a um concurso
 * @param concursoId - ID do concurso
 * @param userId - ID do usuário
 * @returns Número de questões
 */
export async function contarQuestoesPorConcurso(
  concursoId: string,
  userId: string
): Promise<number> {
  try {
    if (!concursoId || !userId) {
      throw new Error('ID do concurso e ID do usuário são obrigatórios')
    }

    const supabase = createSupabaseClient()
    
    const { count, error } = await supabase
      .from('estudos_questoes')
      .select('*', { count: 'exact', head: true })
      .eq('concurso_id', concursoId)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Erro ao contar questões:', error)
      throw new Error(`Erro ao contar questões: ${error.message}`)
    }
    
    return count || 0
  } catch (error) {
    console.error('Erro inesperado ao contar questões:', error)
    throw error
  }
}
