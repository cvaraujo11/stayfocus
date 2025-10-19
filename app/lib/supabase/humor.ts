/**
 * Serviço de API para gerenciamento de registros de humor
 * Implementa CRUD completo com integração ao Supabase
 */

import { createSupabaseClient } from './client'
import type { Database } from '@/app/types/database'

// Types do banco de dados
type RegistroHumorRow = Database['public']['Tables']['saude_registros_humor']['Row']
type RegistroHumorInsert = Database['public']['Tables']['saude_registros_humor']['Insert']
type RegistroHumorUpdate = Database['public']['Tables']['saude_registros_humor']['Update']

// Types do cliente
export interface RegistroHumor {
  id: string
  data: string // YYYY-MM-DD
  nivel: number // 1-5
  fatores: string[]
  notas: string | null
  createdAt: string
  updatedAt: string
}

export interface EstatisticasHumor {
  nivelMedio: number
  nivelMinimo: number
  nivelMaximo: number
  totalRegistros: number
  fatoresMaisComuns: Array<{ fator: string; count: number }>
}

export interface TendenciaHumor {
  tendencia: 'Melhorando' | 'Piorando' | 'Estável' | 'Dados insuficientes'
  variacaoPercentual: number
  nivelMedioRecente: number
  nivelMedioAnterior: number
}

// Helper para mapear do banco para o cliente
function mapRegistroHumorFromDB(row: RegistroHumorRow): RegistroHumor {
  return {
    id: row.id,
    data: row.data,
    nivel: row.nivel,
    fatores: row.fatores || [],
    notas: row.notas,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Carrega todos os registros de humor do usuário
 */
export async function carregarRegistrosHumor(
  userId: string,
  dataInicio?: string,
  dataFim?: string
): Promise<RegistroHumor[]> {
  const supabase = createSupabaseClient()
  
  let query = supabase
    .from('saude_registros_humor')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })
  
  if (dataInicio) {
    query = query.gte('data', dataInicio)
  }
  
  if (dataFim) {
    query = query.lte('data', dataFim)
  }
  
  const { data, error } = await query
  
  if (error) throw new Error(`Erro ao carregar registros de humor: ${error.message}`)
  
  return (data || []).map(mapRegistroHumorFromDB)
}

/**
 * Carrega o registro de humor de uma data específica
 */
export async function carregarRegistroHumorPorData(
  userId: string,
  data: string
): Promise<RegistroHumor | null> {
  const supabase = createSupabaseClient()
  
  const { data: registro, error } = await supabase
    .from('saude_registros_humor')
    .select('*')
    .eq('user_id', userId)
    .eq('data', data)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Nenhum registro encontrado
      return null
    }
    throw new Error(`Erro ao carregar registro de humor: ${error.message}`)
  }
  
  return mapRegistroHumorFromDB(registro)
}

/**
 * Adiciona um novo registro de humor
 */
export async function adicionarRegistroHumor(
  registro: Omit<RegistroHumor, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<RegistroHumor> {
  const supabase = createSupabaseClient()
  
  const registroData: RegistroHumorInsert = {
    user_id: userId,
    data: registro.data,
    nivel: registro.nivel,
    fatores: registro.fatores,
    notas: registro.notas,
  }
  
  const { data, error } = await supabase
    .from('saude_registros_humor')
    .insert(registroData)
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') {
      // Violação de constraint UNIQUE - já existe registro para esta data
      throw new Error('Já existe um registro de humor para esta data')
    }
    throw new Error(`Erro ao adicionar registro de humor: ${error.message}`)
  }
  
  return mapRegistroHumorFromDB(data)
}

/**
 * Atualiza um registro de humor existente
 */
export async function atualizarRegistroHumor(
  id: string,
  updates: Partial<Omit<RegistroHumor, 'id' | 'createdAt' | 'updatedAt'>>,
  userId: string
): Promise<RegistroHumor> {
  const supabase = createSupabaseClient()
  
  const updateData: RegistroHumorUpdate = {}
  
  if (updates.data !== undefined) updateData.data = updates.data
  if (updates.nivel !== undefined) updateData.nivel = updates.nivel
  if (updates.fatores !== undefined) updateData.fatores = updates.fatores
  if (updates.notas !== undefined) updateData.notas = updates.notas
  
  const { data, error } = await supabase
    .from('saude_registros_humor')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw new Error(`Erro ao atualizar registro de humor: ${error.message}`)
  
  return mapRegistroHumorFromDB(data)
}

/**
 * Atualiza ou cria um registro de humor para uma data específica (upsert)
 */
export async function salvarRegistroHumor(
  registro: Omit<RegistroHumor, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<RegistroHumor> {
  const supabase = createSupabaseClient()
  
  // Tentar buscar registro existente
  const registroExistente = await carregarRegistroHumorPorData(userId, registro.data)
  
  if (registroExistente) {
    // Atualizar registro existente
    return atualizarRegistroHumor(registroExistente.id, registro, userId)
  } else {
    // Criar novo registro
    return adicionarRegistroHumor(registro, userId)
  }
}

/**
 * Remove um registro de humor
 */
export async function removerRegistroHumor(id: string, userId: string): Promise<void> {
  const supabase = createSupabaseClient()
  
  const { error } = await supabase
    .from('saude_registros_humor')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) throw new Error(`Erro ao remover registro de humor: ${error.message}`)
}

/**
 * Calcula estatísticas de humor para um período
 */
export async function calcularEstatisticasHumor(
  userId: string,
  dataInicio?: string,
  dataFim?: string
): Promise<EstatisticasHumor> {
  const registros = await carregarRegistrosHumor(userId, dataInicio, dataFim)
  
  if (registros.length === 0) {
    return {
      nivelMedio: 0,
      nivelMinimo: 0,
      nivelMaximo: 0,
      totalRegistros: 0,
      fatoresMaisComuns: [],
    }
  }
  
  // Calcular estatísticas básicas
  const niveis = registros.map(r => r.nivel)
  const nivelMedio = Math.round((niveis.reduce((a, b) => a + b, 0) / niveis.length) * 10) / 10
  const nivelMinimo = Math.min(...niveis)
  const nivelMaximo = Math.max(...niveis)
  
  // Contar fatores
  const fatoresMap = new Map<string, number>()
  
  registros.forEach(registro => {
    registro.fatores.forEach(fator => {
      fatoresMap.set(fator, (fatoresMap.get(fator) || 0) + 1)
    })
  })
  
  // Ordenar fatores por frequência
  const fatoresMaisComuns = Array.from(fatoresMap.entries())
    .map(([fator, count]) => ({ fator, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Top 5 fatores
  
  return {
    nivelMedio,
    nivelMinimo,
    nivelMaximo,
    totalRegistros: registros.length,
    fatoresMaisComuns,
  }
}

/**
 * Calcula a tendência de humor comparando períodos
 */
export async function calcularTendenciaHumor(
  userId: string,
  diasRecentes: number = 7
): Promise<TendenciaHumor> {
  const hoje = new Date()
  const dataFimRecente = hoje.toISOString().split('T')[0]
  const dataInicioRecente = new Date(hoje.getTime() - diasRecentes * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]
  
  const dataFimAnterior = new Date(hoje.getTime() - diasRecentes * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]
  const dataInicioAnterior = new Date(hoje.getTime() - diasRecentes * 2 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]
  
  // Buscar registros dos dois períodos
  const registrosRecentes = await carregarRegistrosHumor(userId, dataInicioRecente, dataFimRecente)
  const registrosAnteriores = await carregarRegistrosHumor(userId, dataInicioAnterior, dataFimAnterior)
  
  if (registrosRecentes.length === 0 && registrosAnteriores.length === 0) {
    return {
      tendencia: 'Dados insuficientes',
      variacaoPercentual: 0,
      nivelMedioRecente: 0,
      nivelMedioAnterior: 0,
    }
  }
  
  // Calcular médias
  const nivelMedioRecente = registrosRecentes.length > 0
    ? registrosRecentes.reduce((sum, r) => sum + r.nivel, 0) / registrosRecentes.length
    : 0
  
  const nivelMedioAnterior = registrosAnteriores.length > 0
    ? registrosAnteriores.reduce((sum, r) => sum + r.nivel, 0) / registrosAnteriores.length
    : 0
  
  // Calcular variação
  const variacaoPercentual = nivelMedioAnterior > 0
    ? Math.round(((nivelMedioRecente - nivelMedioAnterior) / nivelMedioAnterior) * 100)
    : 0
  
  // Determinar tendência
  let tendencia: TendenciaHumor['tendencia'] = 'Estável'
  
  if (registrosRecentes.length === 0 || registrosAnteriores.length === 0) {
    tendencia = 'Dados insuficientes'
  } else if (variacaoPercentual > 5) {
    tendencia = 'Melhorando'
  } else if (variacaoPercentual < -5) {
    tendencia = 'Piorando'
  }
  
  return {
    tendencia,
    variacaoPercentual,
    nivelMedioRecente: Math.round(nivelMedioRecente * 10) / 10,
    nivelMedioAnterior: Math.round(nivelMedioAnterior * 10) / 10,
  }
}

/**
 * Obtém registros de humor agrupados por mês
 */
export async function obterHumorPorMes(
  userId: string,
  ano: number,
  mes: number
): Promise<RegistroHumor[]> {
  const dataInicio = new Date(ano, mes - 1, 1).toISOString().split('T')[0]
  const dataFim = new Date(ano, mes, 0).toISOString().split('T')[0]
  
  return carregarRegistrosHumor(userId, dataInicio, dataFim)
}

/**
 * Verifica se existe registro de humor para uma data
 */
export async function existeRegistroHumor(
  userId: string,
  data: string
): Promise<boolean> {
  const registro = await carregarRegistroHumorPorData(userId, data)
  return registro !== null
}
