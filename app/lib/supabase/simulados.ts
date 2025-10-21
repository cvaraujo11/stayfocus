/**
 * Serviço de API para gerenciamento de simulados
 * Implementa CRUD completo e lógica de cálculo de resultados
 */

import { createSupabaseClient } from './client'
import { carregarQuestaoPorId } from './questoes'
import type { Database } from '@/app/types/database'
import type {
  Simulado,
  RespostaSimulado,
  ResultadoSimulado,
  EstatisticaDisciplina,
  Questao,
} from '@/app/types'

// Types do banco de dados
type SimuladoRow = Database['public']['Tables']['estudos_simulados']['Row']
type SimuladoInsert = Database['public']['Tables']['estudos_simulados']['Insert']
type SimuladoUpdate = Database['public']['Tables']['estudos_simulados']['Update']

/**
 * Helper para mapear do banco para o cliente
 */
export function mapSimuladoFromDB(row: SimuladoRow): Simulado {
  return {
    id: row.id,
    userId: row.user_id,
    concursoId: row.concurso_id,
    titulo: row.titulo,
    questoesIds: row.questoes_ids || [],
    dataRealizacao: row.data_realizacao,
    tempoLimiteMinutos: row.tempo_limite_minutos,
    acertos: row.acertos,
    totalQuestoes: row.total_questoes,
    createdAt: row.created_at,
  }
}

/**
 * Carrega todos os simulados do usuário
 * @param userId - ID do usuário
 * @returns Lista de simulados
 */
export async function carregarSimulados(userId: string): Promise<Simulado[]> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('estudos_simulados')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar simulados:', error)
      throw new Error(`Erro ao carregar simulados: ${error.message}`)
    }

    return (data || []).map(mapSimuladoFromDB)
  } catch (error) {
    console.error('Erro inesperado ao carregar simulados:', error)
    throw error
  }
}

/**
 * Carrega um simulado específico por ID
 * @param id - ID do simulado
 * @param userId - ID do usuário
 * @returns Simulado encontrado ou null
 */
export async function carregarSimuladoPorId(
  id: string,
  userId: string
): Promise<Simulado | null> {
  try {
    if (!id || !userId) {
      throw new Error('ID do simulado e ID do usuário são obrigatórios')
    }

    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('estudos_simulados')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum registro encontrado
        console.warn(`Simulado não encontrado: ${id}`)
        return null
      }
      console.error('Erro ao carregar simulado:', error)
      throw new Error(`Erro ao carregar simulado: ${error.message}`)
    }

    return mapSimuladoFromDB(data)
  } catch (error) {
    console.error('Erro inesperado ao carregar simulado:', error)
    throw error
  }
}

/**
 * Carrega simulados já realizados (com data de realização)
 * @param userId - ID do usuário
 * @returns Lista de simulados realizados
 */
export async function carregarSimuladosRealizados(userId: string): Promise<Simulado[]> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('estudos_simulados')
      .select('*')
      .eq('user_id', userId)
      .not('data_realizacao', 'is', null)
      .order('data_realizacao', { ascending: false })

    if (error) {
      console.error('Erro ao carregar simulados realizados:', error)
      throw new Error(`Erro ao carregar simulados realizados: ${error.message}`)
    }

    return (data || []).map(mapSimuladoFromDB)
  } catch (error) {
    console.error('Erro inesperado ao carregar simulados realizados:', error)
    throw error
  }
}

/**
 * Cria um novo simulado
 * @param simulado - Dados do simulado (sem id e createdAt)
 * @param userId - ID do usuário
 * @returns Simulado criado
 */
export async function criarSimulado(
  simulado: Omit<Simulado, 'id' | 'userId' | 'createdAt'>,
  userId: string
): Promise<Simulado> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    // Validações
    if (!simulado.titulo || simulado.titulo.trim().length === 0) {
      throw new Error('Título do simulado é obrigatório')
    }

    if (!simulado.questoesIds || simulado.questoesIds.length === 0) {
      throw new Error('O simulado deve ter pelo menos uma questão')
    }

    if (simulado.tempoLimiteMinutos !== null && simulado.tempoLimiteMinutos !== undefined) {
      if (simulado.tempoLimiteMinutos <= 0) {
        throw new Error('Tempo limite deve ser maior que zero')
      }
    }

    const supabase = createSupabaseClient()

    const simuladoData: SimuladoInsert = {
      user_id: userId,
      concurso_id: simulado.concursoId || null,
      titulo: simulado.titulo.trim(),
      questoes_ids: simulado.questoesIds,
      tempo_limite_minutos: simulado.tempoLimiteMinutos || null,
      data_realizacao: null,
      acertos: null,
      total_questoes: simulado.questoesIds.length,
    }

    const { data, error } = await supabase
      .from('estudos_simulados')
      .insert(simuladoData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar simulado:', error)
      throw new Error(`Erro ao criar simulado: ${error.message}`)
    }

    return mapSimuladoFromDB(data)
  } catch (error) {
    console.error('Erro inesperado ao criar simulado:', error)
    throw error
  }
}

/**
 * Inicia um simulado (marca como em andamento)
 * @param simuladoId - ID do simulado
 * @param userId - ID do usuário
 */
export async function iniciarSimulado(
  simuladoId: string,
  userId: string
): Promise<void> {
  try {
    if (!simuladoId || !userId) {
      throw new Error('ID do simulado e ID do usuário são obrigatórios')
    }

    // Verificar se o simulado existe
    const simulado = await carregarSimuladoPorId(simuladoId, userId)
    if (!simulado) {
      throw new Error('Simulado não encontrado')
    }

    // Verificar se já foi realizado
    if (simulado.dataRealizacao) {
      throw new Error('Este simulado já foi realizado')
    }

    // Não precisa atualizar nada no banco, apenas validar
    // O estado de "em andamento" é gerenciado no localStorage do cliente
  } catch (error) {
    console.error('Erro inesperado ao iniciar simulado:', error)
    throw error
  }
}

/**
 * Finaliza um simulado e calcula o resultado
 * @param simuladoId - ID do simulado
 * @param respostas - Respostas do usuário
 * @param userId - ID do usuário
 * @returns Resultado do simulado
 */
export async function finalizarSimulado(
  simuladoId: string,
  respostas: RespostaSimulado[],
  userId: string
): Promise<ResultadoSimulado> {
  try {
    if (!simuladoId || !userId) {
      throw new Error('ID do simulado e ID do usuário são obrigatórios')
    }

    if (!respostas || respostas.length === 0) {
      throw new Error('Respostas são obrigatórias')
    }

    // Carregar simulado
    const simulado = await carregarSimuladoPorId(simuladoId, userId)
    if (!simulado) {
      throw new Error('Simulado não encontrado')
    }

    // Carregar questões do simulado
    const questoes = await carregarQuestoesSimulado(simuladoId, userId)

    // Calcular resultado
    const resultado = calcularResultado(simuladoId, respostas, questoes)

    // Atualizar simulado no banco
    const supabase = createSupabaseClient()

    const updateData: SimuladoUpdate = {
      data_realizacao: new Date().toISOString(),
      acertos: resultado.acertos,
      total_questoes: resultado.totalQuestoes,
    }

    const { error } = await supabase
      .from('estudos_simulados')
      .update(updateData)
      .eq('id', simuladoId)
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao finalizar simulado:', error)
      throw new Error(`Erro ao finalizar simulado: ${error.message}`)
    }

    return resultado
  } catch (error) {
    console.error('Erro inesperado ao finalizar simulado:', error)
    throw error
  }
}

/**
 * Remove um simulado
 * @param id - ID do simulado
 * @param userId - ID do usuário
 */
export async function removerSimulado(id: string, userId: string): Promise<void> {
  try {
    if (!id || !userId) {
      throw new Error('ID do simulado e ID do usuário são obrigatórios')
    }

    const supabase = createSupabaseClient()

    // Verificar se o simulado existe
    const simulado = await carregarSimuladoPorId(id, userId)
    if (!simulado) {
      throw new Error('Simulado não encontrado')
    }

    // Remover o simulado
    const { error } = await supabase
      .from('estudos_simulados')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao remover simulado:', error)
      throw new Error(`Erro ao remover simulado: ${error.message}`)
    }
  } catch (error) {
    console.error('Erro inesperado ao remover simulado:', error)
    throw error
  }
}

/**
 * Carrega as questões de um simulado
 * @param simuladoId - ID do simulado
 * @param userId - ID do usuário
 * @returns Lista de questões do simulado
 */
export async function carregarQuestoesSimulado(
  simuladoId: string,
  userId: string
): Promise<Questao[]> {
  try {
    if (!simuladoId || !userId) {
      throw new Error('ID do simulado e ID do usuário são obrigatórios')
    }

    // Carregar simulado
    const simulado = await carregarSimuladoPorId(simuladoId, userId)
    if (!simulado) {
      throw new Error('Simulado não encontrado')
    }

    // Carregar cada questão
    const questoes: Questao[] = []
    for (const questaoId of simulado.questoesIds) {
      const questao = await carregarQuestaoPorId(questaoId, userId)
      if (questao) {
        questoes.push(questao)
      } else {
        console.warn(`Questão ${questaoId} não encontrada no simulado ${simuladoId}`)
      }
    }

    return questoes
  } catch (error) {
    console.error('Erro inesperado ao carregar questões do simulado:', error)
    throw error
  }
}

/**
 * Calcula o resultado de um simulado
 * @param simuladoId - ID do simulado
 * @param respostas - Respostas do usuário
 * @param questoes - Questões do simulado
 * @returns Resultado calculado
 */
export function calcularResultado(
  simuladoId: string,
  respostas: RespostaSimulado[],
  questoes: Questao[]
): ResultadoSimulado {
  try {
    if (!simuladoId) {
      throw new Error('ID do simulado é obrigatório')
    }

    if (!respostas || respostas.length === 0) {
      throw new Error('Respostas são obrigatórias')
    }

    if (!questoes || questoes.length === 0) {
      throw new Error('Questões são obrigatórias')
    }

    // Criar mapa de questões para acesso rápido
    const questoesMap = new Map<string, Questao>()
    questoes.forEach((q) => questoesMap.set(q.id, q))

    // Processar respostas e calcular acertos
    const respostasProcessadas: RespostaSimulado[] = []
    let acertos = 0
    let tempoTotal = 0

    // Agrupar por disciplina para estatísticas
    const disciplinasMap = new Map<
      string,
      { acertos: number; total: number }
    >()

    for (const resposta of respostas) {
      const questao = questoesMap.get(resposta.questaoId)

      if (!questao) {
        console.warn(`Questão ${resposta.questaoId} não encontrada`)
        continue
      }

      // Verificar se a resposta está correta
      const correta = resposta.respostaSelecionada === questao.respostaCorreta

      respostasProcessadas.push({
        questaoId: resposta.questaoId,
        respostaSelecionada: resposta.respostaSelecionada,
        correta,
        tempoResposta: resposta.tempoResposta,
      })

      if (correta) {
        acertos++
      }

      // Acumular tempo
      if (resposta.tempoResposta) {
        tempoTotal += resposta.tempoResposta
      }

      // Atualizar estatísticas por disciplina
      const disciplina = questao.disciplina
      const stats = disciplinasMap.get(disciplina) || { acertos: 0, total: 0 }
      stats.total++
      if (correta) {
        stats.acertos++
      }
      disciplinasMap.set(disciplina, stats)
    }

    // Calcular percentual geral
    const totalQuestoes = respostasProcessadas.length
    const percentual = totalQuestoes > 0 ? (acertos / totalQuestoes) * 100 : 0

    // Gerar estatísticas por disciplina
    const estatisticasPorDisciplina: EstatisticaDisciplina[] = []
    disciplinasMap.forEach((stats, disciplina) => {
      const percentualDisciplina =
        stats.total > 0 ? (stats.acertos / stats.total) * 100 : 0

      estatisticasPorDisciplina.push({
        disciplina,
        acertos: stats.acertos,
        total: stats.total,
        percentual: Math.round(percentualDisciplina * 100) / 100,
      })
    })

    // Ordenar por disciplina
    estatisticasPorDisciplina.sort((a, b) => a.disciplina.localeCompare(b.disciplina))

    return {
      simuladoId,
      acertos,
      totalQuestoes,
      percentual: Math.round(percentual * 100) / 100,
      tempoTotal,
      respostas: respostasProcessadas,
      estatisticasPorDisciplina,
    }
  } catch (error) {
    console.error('Erro ao calcular resultado:', error)
    throw error
  }
}
