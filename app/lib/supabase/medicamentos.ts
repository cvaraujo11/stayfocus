/**
 * Serviço de API para gerenciamento de medicamentos
 * Implementa CRUD completo com integração ao Supabase
 */

import { createSupabaseClient } from './client'
import type { Database } from '@/app/types/database'

// Types do banco de dados
type MedicamentoRow = Database['public']['Tables']['saude_medicamentos']['Row']
type MedicamentoInsert = Database['public']['Tables']['saude_medicamentos']['Insert']
type MedicamentoUpdate = Database['public']['Tables']['saude_medicamentos']['Update']
type TomadaMedicamentoRow = Database['public']['Tables']['saude_tomadas_medicamentos']['Row']
type TomadaMedicamentoInsert = Database['public']['Tables']['saude_tomadas_medicamentos']['Insert']

// Types do cliente
export interface Medicamento {
  id: string
  nome: string
  dosagem: string | null
  frequencia: string
  horarios: string[]
  observacoes: string | null
  dataInicio: string
  intervaloMinutos: number
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface TomadaMedicamento {
  id: string
  medicamentoId: string
  dataHora: string
  horarioProgramado: string | null
  observacoes: string | null
  createdAt: string
}

// Helpers para mapear entre banco e cliente
function mapMedicamentoFromDB(row: MedicamentoRow): Medicamento {
  return {
    id: row.id,
    nome: row.nome,
    dosagem: row.dosagem,
    frequencia: row.frequencia,
    horarios: row.horarios,
    observacoes: row.observacoes,
    dataInicio: row.data_inicio,
    intervaloMinutos: row.intervalo_minutos,
    ativo: row.ativo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapTomadaFromDB(row: TomadaMedicamentoRow): TomadaMedicamento {
  return {
    id: row.id,
    medicamentoId: row.medicamento_id,
    dataHora: row.data_hora,
    horarioProgramado: row.horario_programado,
    observacoes: row.observacoes,
    createdAt: row.created_at,
  }
}

/**
 * Carrega todos os medicamentos do usuário
 */
export async function carregarMedicamentos(userId: string): Promise<Medicamento[]> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('saude_medicamentos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(`Erro ao carregar medicamentos: ${error.message}`)
  
  return (data || []).map(mapMedicamentoFromDB)
}

/**
 * Carrega medicamentos ativos do usuário
 */
export async function carregarMedicamentosAtivos(userId: string): Promise<Medicamento[]> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('saude_medicamentos')
    .select('*')
    .eq('user_id', userId)
    .eq('ativo', true)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(`Erro ao carregar medicamentos ativos: ${error.message}`)
  
  return (data || []).map(mapMedicamentoFromDB)
}

/**
 * Adiciona um novo medicamento
 */
export async function adicionarMedicamento(
  medicamento: Omit<Medicamento, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<Medicamento> {
  const supabase = createSupabaseClient()
  
  const medicamentoData: MedicamentoInsert = {
    user_id: userId,
    nome: medicamento.nome,
    dosagem: medicamento.dosagem,
    frequencia: medicamento.frequencia,
    horarios: medicamento.horarios,
    observacoes: medicamento.observacoes,
    data_inicio: medicamento.dataInicio,
    intervalo_minutos: medicamento.intervaloMinutos,
    ativo: medicamento.ativo,
  }
  
  const { data, error } = await supabase
    .from('saude_medicamentos')
    .insert(medicamentoData)
    .select()
    .single()
  
  if (error) throw new Error(`Erro ao adicionar medicamento: ${error.message}`)
  
  return mapMedicamentoFromDB(data)
}

/**
 * Atualiza um medicamento existente
 */
export async function atualizarMedicamento(
  id: string,
  updates: Partial<Omit<Medicamento, 'id' | 'createdAt' | 'updatedAt'>>,
  userId: string
): Promise<Medicamento> {
  const supabase = createSupabaseClient()
  
  const updateData: MedicamentoUpdate = {}
  
  if (updates.nome !== undefined) updateData.nome = updates.nome
  if (updates.dosagem !== undefined) updateData.dosagem = updates.dosagem
  if (updates.frequencia !== undefined) updateData.frequencia = updates.frequencia
  if (updates.horarios !== undefined) updateData.horarios = updates.horarios
  if (updates.observacoes !== undefined) updateData.observacoes = updates.observacoes
  if (updates.dataInicio !== undefined) updateData.data_inicio = updates.dataInicio
  if (updates.intervaloMinutos !== undefined) updateData.intervalo_minutos = updates.intervaloMinutos
  if (updates.ativo !== undefined) updateData.ativo = updates.ativo
  
  const { data, error } = await supabase
    .from('saude_medicamentos')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw new Error(`Erro ao atualizar medicamento: ${error.message}`)
  
  return mapMedicamentoFromDB(data)
}

/**
 * Remove um medicamento
 */
export async function removerMedicamento(id: string, userId: string): Promise<void> {
  const supabase = createSupabaseClient()
  
  const { error } = await supabase
    .from('saude_medicamentos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) throw new Error(`Erro ao remover medicamento: ${error.message}`)
}

/**
 * Marca um medicamento como ativo/inativo
 */
export async function toggleMedicamentoAtivo(
  id: string,
  ativo: boolean,
  userId: string
): Promise<Medicamento> {
  return atualizarMedicamento(id, { ativo }, userId)
}

/**
 * Registra uma tomada de medicamento
 */
export async function registrarTomada(
  medicamentoId: string,
  userId: string,
  horarioProgramado?: string,
  observacoes?: string
): Promise<TomadaMedicamento> {
  const supabase = createSupabaseClient()
  
  const tomadaData: TomadaMedicamentoInsert = {
    medicamento_id: medicamentoId,
    user_id: userId,
    horario_programado: horarioProgramado || null,
    observacoes: observacoes || null,
  }
  
  const { data, error } = await supabase
    .from('saude_tomadas_medicamentos')
    .insert(tomadaData)
    .select()
    .single()
  
  if (error) throw new Error(`Erro ao registrar tomada: ${error.message}`)
  
  return mapTomadaFromDB(data)
}

/**
 * Carrega histórico de tomadas de um medicamento
 */
export async function carregarHistoricoTomadas(
  medicamentoId: string,
  userId: string,
  dataInicio?: string,
  dataFim?: string
): Promise<TomadaMedicamento[]> {
  const supabase = createSupabaseClient()
  
  let query = supabase
    .from('saude_tomadas_medicamentos')
    .select('*')
    .eq('medicamento_id', medicamentoId)
    .eq('user_id', userId)
    .order('data_hora', { ascending: false })
  
  if (dataInicio) {
    query = query.gte('data_hora', dataInicio)
  }
  
  if (dataFim) {
    query = query.lte('data_hora', dataFim)
  }
  
  const { data, error } = await query
  
  if (error) throw new Error(`Erro ao carregar histórico de tomadas: ${error.message}`)
  
  return (data || []).map(mapTomadaFromDB)
}

/**
 * Carrega todas as tomadas do usuário em um período
 */
export async function carregarTodasTomadas(
  userId: string,
  dataInicio?: string,
  dataFim?: string
): Promise<TomadaMedicamento[]> {
  const supabase = createSupabaseClient()
  
  let query = supabase
    .from('saude_tomadas_medicamentos')
    .select('*')
    .eq('user_id', userId)
    .order('data_hora', { ascending: false })
  
  if (dataInicio) {
    query = query.gte('data_hora', dataInicio)
  }
  
  if (dataFim) {
    query = query.lte('data_hora', dataFim)
  }
  
  const { data, error } = await query
  
  if (error) throw new Error(`Erro ao carregar tomadas: ${error.message}`)
  
  return (data || []).map(mapTomadaFromDB)
}

/**
 * Obtém a última tomada de um medicamento
 */
export async function obterUltimaTomada(
  medicamentoId: string,
  userId: string
): Promise<TomadaMedicamento | null> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('saude_tomadas_medicamentos')
    .select('*')
    .eq('medicamento_id', medicamentoId)
    .eq('user_id', userId)
    .order('data_hora', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Nenhum registro encontrado
      return null
    }
    throw new Error(`Erro ao obter última tomada: ${error.message}`)
  }
  
  return mapTomadaFromDB(data)
}

/**
 * Calcula estatísticas de adesão ao medicamento
 */
export async function calcularAdesao(
  medicamentoId: string,
  userId: string,
  diasAvaliar: number = 30
): Promise<{
  percentualAdesao: number
  tomadasEsperadas: number
  tomadasRealizadas: number
}> {
  const supabase = createSupabaseClient()
  
  // Buscar medicamento
  const { data: medicamento, error: medError } = await supabase
    .from('saude_medicamentos')
    .select('horarios, data_inicio')
    .eq('id', medicamentoId)
    .eq('user_id', userId)
    .single()
  
  if (medError) throw new Error(`Erro ao buscar medicamento: ${medError.message}`)
  
  // Calcular período de avaliação
  const dataFim = new Date()
  const dataInicio = new Date()
  dataInicio.setDate(dataInicio.getDate() - diasAvaliar)
  
  // Considerar a data de início do medicamento
  const dataInicioMedicamento = new Date(medicamento.data_inicio)
  const dataInicioAvaliacao = dataInicioMedicamento > dataInicio ? dataInicioMedicamento : dataInicio
  
  // Calcular dias efetivos
  const diasEfetivos = Math.ceil((dataFim.getTime() - dataInicioAvaliacao.getTime()) / (1000 * 60 * 60 * 24))
  
  // Calcular tomadas esperadas (simplificado - assumindo medicamento diário)
  const tomadasPorDia = medicamento.horarios.length
  const tomadasEsperadas = tomadasPorDia * diasEfetivos
  
  // Contar tomadas realizadas
  const { data: tomadas, error: tomadasError } = await supabase
    .from('saude_tomadas_medicamentos')
    .select('id', { count: 'exact' })
    .eq('medicamento_id', medicamentoId)
    .eq('user_id', userId)
    .gte('data_hora', dataInicioAvaliacao.toISOString())
    .lte('data_hora', dataFim.toISOString())
  
  if (tomadasError) throw new Error(`Erro ao contar tomadas: ${tomadasError.message}`)
  
  const tomadasRealizadas = tomadas?.length || 0
  const percentualAdesao = tomadasEsperadas > 0 
    ? Math.round((tomadasRealizadas / tomadasEsperadas) * 100) 
    : 0
  
  return {
    percentualAdesao,
    tomadasEsperadas,
    tomadasRealizadas,
  }
}
