/**
 * Serviço de API para gerenciamento de registros de estudo
 * Implementa CRUD completo e cálculo de estatísticas
 */

import { createSupabaseClient } from './client'
import type { Database } from '@/app/types/database'
import type { RegistroEstudo, EstatisticasEstudo } from '@/app/types'

// Types do banco de dados
type RegistroEstudoRow = Database['public']['Tables']['estudos_registros']['Row']
type RegistroEstudoInsert = Database['public']['Tables']['estudos_registros']['Insert']
type RegistroEstudoUpdate = Database['public']['Tables']['estudos_registros']['Update']

/**
 * Helper para mapear do banco para o cliente
 */
export function mapRegistroEstudoFromDB(row: RegistroEstudoRow): RegistroEstudo {
  return {
    id: row.id,
    userId: row.user_id,
    data: row.data,
    disciplina: row.disciplina,
    duracaoMinutos: row.duracao_minutos,
    topicos: row.topicos || [],
    observacoes: row.observacoes,
    createdAt: row.created_at,
  }
}

/**
 * Carrega registros de estudo do usuário com filtros de data opcionais
 * @param userId - ID do usuário
 * @param dataInicio - Data inicial (formato YYYY-MM-DD) - opcional
 * @param dataFim - Data final (formato YYYY-MM-DD) - opcional
 * @returns Lista de registros ordenados por data
 */
export async function carregarRegistros(
  userId: string,
  dataInicio?: string,
  dataFim?: string
): Promise<RegistroEstudo[]> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    const supabase = createSupabaseClient()

    let query = supabase
      .from('estudos_registros')
      .select('*')
      .eq('user_id', userId)

    // Aplicar filtros de data se fornecidos
    if (dataInicio) {
      query = query.gte('data', dataInicio)
    }

    if (dataFim) {
      query = query.lte('data', dataFim)
    }

    const { data, error } = await query.order('data', { ascending: false })

    if (error) {
      console.error('Erro ao carregar registros de estudo:', error)
      throw new Error(`Erro ao carregar registros de estudo: ${error.message}`)
    }

    return (data || []).map(mapRegistroEstudoFromDB)
  } catch (error) {
    console.error('Erro inesperado ao carregar registros de estudo:', error)
    throw error
  }
}

/**
 * Carrega um registro de estudo específico por ID
 * @param id - ID do registro
 * @param userId - ID do usuário
 * @returns Registro encontrado ou null
 */
export async function carregarRegistroPorId(
  id: string,
  userId: string
): Promise<RegistroEstudo | null> {
  try {
    if (!id || !userId) {
      throw new Error('ID do registro e ID do usuário são obrigatórios')
    }

    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('estudos_registros')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum registro encontrado
        console.warn(`Registro de estudo não encontrado: ${id}`)
        return null
      }
      console.error('Erro ao carregar registro de estudo:', error)
      throw new Error(`Erro ao carregar registro de estudo: ${error.message}`)
    }

    return mapRegistroEstudoFromDB(data)
  } catch (error) {
    console.error('Erro inesperado ao carregar registro de estudo:', error)
    throw error
  }
}

/**
 * Carrega registros de estudo de um mês específico
 * @param userId - ID do usuário
 * @param ano - Ano (ex: 2025)
 * @param mes - Mês (1-12)
 * @returns Lista de registros do mês
 */
export async function carregarRegistrosPorMes(
  userId: string,
  ano: number,
  mes: number
): Promise<RegistroEstudo[]> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    if (ano < 2000 || ano > 2100) {
      throw new Error('Ano inválido')
    }

    if (mes < 1 || mes > 12) {
      throw new Error('Mês deve estar entre 1 e 12')
    }

    // Calcular primeiro e último dia do mês
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`
    
    // Último dia do mês
    const ultimoDia = new Date(ano, mes, 0).getDate()
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

    return await carregarRegistros(userId, dataInicio, dataFim)
  } catch (error) {
    console.error('Erro inesperado ao carregar registros por mês:', error)
    throw error
  }
}

/**
 * Adiciona um novo registro de estudo
 * @param registro - Dados do registro (sem id e createdAt)
 * @param userId - ID do usuário
 * @returns Registro criado
 */
export async function adicionarRegistro(
  registro: Omit<RegistroEstudo, 'id' | 'userId' | 'createdAt'>,
  userId: string
): Promise<RegistroEstudo> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    // Validações
    if (!registro.data) {
      throw new Error('Data é obrigatória')
    }

    if (!registro.disciplina || registro.disciplina.trim().length === 0) {
      throw new Error('Disciplina é obrigatória')
    }

    if (registro.duracaoMinutos <= 0) {
      throw new Error('Duração deve ser maior que zero')
    }

    if (registro.duracaoMinutos > 1440) {
      throw new Error('Duração não pode exceder 24 horas (1440 minutos)')
    }

    // Validar formato da data
    const dataRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dataRegex.test(registro.data)) {
      throw new Error('Data deve estar no formato YYYY-MM-DD')
    }

    // Verificar se já existe registro para mesma data, hora e disciplina
    // (prevenção de duplicação conforme requirement 8.8)
    const supabase = createSupabaseClient()

    const { data: registrosExistentes, error: checkError } = await supabase
      .from('estudos_registros')
      .select('id')
      .eq('user_id', userId)
      .eq('data', registro.data)
      .eq('disciplina', registro.disciplina.trim())

    if (checkError) {
      console.error('Erro ao verificar registros existentes:', checkError)
      // Continuar mesmo com erro na verificação
    }

    if (registrosExistentes && registrosExistentes.length > 0) {
      console.warn(
        `Já existe registro de estudo para ${registro.disciplina} em ${registro.data}`
      )
      // Permitir múltiplos registros por dia, mas avisar
    }

    const registroData: RegistroEstudoInsert = {
      user_id: userId,
      data: registro.data,
      disciplina: registro.disciplina.trim(),
      duracao_minutos: registro.duracaoMinutos,
      topicos: registro.topicos || [],
      observacoes: registro.observacoes?.trim() || null,
    }

    const { data, error } = await supabase
      .from('estudos_registros')
      .insert(registroData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao adicionar registro de estudo:', error)
      throw new Error(`Erro ao adicionar registro de estudo: ${error.message}`)
    }

    return mapRegistroEstudoFromDB(data)
  } catch (error) {
    console.error('Erro inesperado ao adicionar registro de estudo:', error)
    throw error
  }
}

/**
 * Atualiza um registro de estudo existente
 * @param id - ID do registro
 * @param updates - Campos a serem atualizados
 * @param userId - ID do usuário
 * @returns Registro atualizado
 */
export async function atualizarRegistro(
  id: string,
  updates: Partial<Omit<RegistroEstudo, 'id' | 'userId' | 'createdAt'>>,
  userId: string
): Promise<RegistroEstudo> {
  try {
    if (!id || !userId) {
      throw new Error('ID do registro e ID do usuário são obrigatórios')
    }

    // Validar se há atualizações
    if (Object.keys(updates).length === 0) {
      throw new Error('Nenhuma atualização fornecida')
    }

    // Validações
    if (updates.disciplina !== undefined) {
      if (!updates.disciplina || updates.disciplina.trim().length === 0) {
        throw new Error('Disciplina não pode estar vazia')
      }
    }

    if (updates.duracaoMinutos !== undefined) {
      if (updates.duracaoMinutos <= 0) {
        throw new Error('Duração deve ser maior que zero')
      }
      if (updates.duracaoMinutos > 1440) {
        throw new Error('Duração não pode exceder 24 horas (1440 minutos)')
      }
    }

    if (updates.data !== undefined) {
      const dataRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dataRegex.test(updates.data)) {
        throw new Error('Data deve estar no formato YYYY-MM-DD')
      }
    }

    const supabase = createSupabaseClient()

    const updateData: RegistroEstudoUpdate = {}

    if (updates.data !== undefined) updateData.data = updates.data
    if (updates.disciplina !== undefined) updateData.disciplina = updates.disciplina.trim()
    if (updates.duracaoMinutos !== undefined) updateData.duracao_minutos = updates.duracaoMinutos
    if (updates.topicos !== undefined) updateData.topicos = updates.topicos
    if (updates.observacoes !== undefined)
      updateData.observacoes = updates.observacoes?.trim() || null

    const { data, error } = await supabase
      .from('estudos_registros')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar registro de estudo:', error)
      throw new Error(`Erro ao atualizar registro de estudo: ${error.message}`)
    }

    return mapRegistroEstudoFromDB(data)
  } catch (error) {
    console.error('Erro inesperado ao atualizar registro de estudo:', error)
    throw error
  }
}

/**
 * Remove um registro de estudo
 * @param id - ID do registro
 * @param userId - ID do usuário
 */
export async function removerRegistro(id: string, userId: string): Promise<void> {
  try {
    if (!id || !userId) {
      throw new Error('ID do registro e ID do usuário são obrigatórios')
    }

    const supabase = createSupabaseClient()

    // Verificar se o registro existe
    const registro = await carregarRegistroPorId(id, userId)
    if (!registro) {
      throw new Error('Registro de estudo não encontrado')
    }

    // Remover o registro
    const { error } = await supabase
      .from('estudos_registros')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao remover registro de estudo:', error)
      throw new Error(`Erro ao remover registro de estudo: ${error.message}`)
    }
  } catch (error) {
    console.error('Erro inesperado ao remover registro de estudo:', error)
    throw error
  }
}

/**
 * Calcula estatísticas de estudo para um período
 * @param userId - ID do usuário
 * @param dataInicio - Data inicial (formato YYYY-MM-DD) - opcional
 * @param dataFim - Data final (formato YYYY-MM-DD) - opcional
 * @returns Estatísticas calculadas
 */
export async function calcularEstatisticas(
  userId: string,
  dataInicio?: string,
  dataFim?: string
): Promise<EstatisticasEstudo> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    // Carregar registros do período
    const registros = await carregarRegistros(userId, dataInicio, dataFim)

    if (registros.length === 0) {
      return {
        totalHoras: 0,
        horasPorDisciplina: [],
        mediaHorasDia: 0,
        diasEstudados: 0,
        disciplinaMaisEstudada: '',
        disciplinaMenosEstudada: '',
      }
    }

    // Calcular total de minutos
    const totalMinutos = registros.reduce((sum, r) => sum + r.duracaoMinutos, 0)
    const totalHoras = Math.round((totalMinutos / 60) * 100) / 100

    // Calcular horas por disciplina
    const disciplinasMap = new Map<string, number>()
    registros.forEach((registro) => {
      const minutos = disciplinasMap.get(registro.disciplina) || 0
      disciplinasMap.set(registro.disciplina, minutos + registro.duracaoMinutos)
    })

    const horasPorDisciplina = Array.from(disciplinasMap.entries())
      .map(([disciplina, minutos]) => ({
        disciplina,
        horas: Math.round((minutos / 60) * 100) / 100,
      }))
      .sort((a, b) => b.horas - a.horas)

    // Calcular dias únicos estudados
    const datasUnicas = new Set(registros.map((r) => r.data))
    const diasEstudados = datasUnicas.size

    // Calcular média de horas por dia
    const mediaHorasDia =
      diasEstudados > 0 ? Math.round((totalHoras / diasEstudados) * 100) / 100 : 0

    // Identificar disciplina mais e menos estudada
    const disciplinaMaisEstudada =
      horasPorDisciplina.length > 0 ? horasPorDisciplina[0].disciplina : ''
    const disciplinaMenosEstudada =
      horasPorDisciplina.length > 0
        ? horasPorDisciplina[horasPorDisciplina.length - 1].disciplina
        : ''

    return {
      totalHoras,
      horasPorDisciplina,
      mediaHorasDia,
      diasEstudados,
      disciplinaMaisEstudada,
      disciplinaMenosEstudada,
    }
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error)
    throw error
  }
}

/**
 * Calcula horas de estudo por disciplina para um período
 * @param userId - ID do usuário
 * @param periodo - Período no formato 'YYYY-MM' ou 'YYYY'
 * @returns Lista de disciplinas com horas estudadas
 */
export async function calcularHorasPorDisciplina(
  userId: string,
  periodo: string
): Promise<{ disciplina: string; horas: number }[]> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    if (!periodo) {
      throw new Error('Período é obrigatório')
    }

    let dataInicio: string
    let dataFim: string

    // Determinar intervalo de datas baseado no período
    if (periodo.match(/^\d{4}-\d{2}$/)) {
      // Formato YYYY-MM (mês específico)
      const [ano, mes] = periodo.split('-').map(Number)
      const ultimoDia = new Date(ano, mes, 0).getDate()
      dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`
      dataFim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`
    } else if (periodo.match(/^\d{4}$/)) {
      // Formato YYYY (ano inteiro)
      const ano = parseInt(periodo)
      dataInicio = `${ano}-01-01`
      dataFim = `${ano}-12-31`
    } else {
      throw new Error('Período deve estar no formato YYYY-MM ou YYYY')
    }

    // Carregar registros do período
    const registros = await carregarRegistros(userId, dataInicio, dataFim)

    if (registros.length === 0) {
      return []
    }

    // Agrupar por disciplina
    const disciplinasMap = new Map<string, number>()
    registros.forEach((registro) => {
      const minutos = disciplinasMap.get(registro.disciplina) || 0
      disciplinasMap.set(registro.disciplina, minutos + registro.duracaoMinutos)
    })

    // Converter para array e ordenar
    return Array.from(disciplinasMap.entries())
      .map(([disciplina, minutos]) => ({
        disciplina,
        horas: Math.round((minutos / 60) * 100) / 100,
      }))
      .sort((a, b) => b.horas - a.horas)
  } catch (error) {
    console.error('Erro ao calcular horas por disciplina:', error)
    throw error
  }
}
