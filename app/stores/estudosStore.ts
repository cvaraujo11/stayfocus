import { create } from 'zustand'
import type {
  Concurso,
  Questao,
  Simulado,
  RegistroEstudo,
  EstatisticasEstudo,
  FiltrosQuestao,
  RespostaSimulado,
  ResultadoSimulado,
} from '@/app/types'
import {
  carregarConcursos as carregarConcursosAPI,
  adicionarConcurso as adicionarConcursoAPI,
  atualizarConcurso as atualizarConcursoAPI,
  removerConcurso as removerConcursoAPI,
} from '@/app/lib/supabase/concursos'
import {
  carregarQuestoes as carregarQuestoesAPI,
  adicionarQuestao as adicionarQuestaoAPI,
  atualizarQuestao as atualizarQuestaoAPI,
  removerQuestao as removerQuestaoAPI,
  buscarQuestoes as buscarQuestoesAPI,
} from '@/app/lib/supabase/questoes'
import {
  carregarSimulados as carregarSimuladosAPI,
  criarSimulado as criarSimuladoAPI,
  iniciarSimulado as iniciarSimuladoAPI,
  finalizarSimulado as finalizarSimuladoAPI,
  removerSimulado as removerSimuladoAPI,
} from '@/app/lib/supabase/simulados'
import {
  carregarRegistros as carregarRegistrosAPI,
  adicionarRegistro as adicionarRegistroAPI,
  atualizarRegistro as atualizarRegistroAPI,
  removerRegistro as removerRegistroAPI,
  calcularEstatisticas as calcularEstatisticasAPI,
} from '@/app/lib/supabase/registros-estudo'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { supabaseSync } from '@/app/lib/supabase/sync'
import type { Database } from '@/app/types/database'

/**
 * Store para gerenciamento de estado do módulo de Estudos e Concursos
 * 
 * Este store gerencia:
 * - Concursos cadastrados
 * - Banco de questões
 * - Simulados criados e realizados
 * - Registros de sessões de estudo
 * - Estatísticas e métricas
 */

interface EstudosState {
  // Estados
  concursos: Concurso[]
  questoes: Questao[]
  simulados: Simulado[]
  registros: RegistroEstudo[]
  loading: boolean
  error: string | null
  
  // Estados de UI
  concursoSelecionado: Concurso | null
  questaoSelecionada: Questao | null
  simuladoEmAndamento: Simulado | null
  
  // Estatísticas
  estatisticas: EstatisticasEstudo | null
  
  // Ações - Concursos
  carregarConcursos: (userId: string) => Promise<void>
  adicionarConcurso: (concurso: Omit<Concurso, 'id' | 'userId' | 'createdAt'>) => Promise<void>
  atualizarConcurso: (id: string, updates: Partial<Omit<Concurso, 'id' | 'userId' | 'createdAt'>>) => Promise<void>
  removerConcurso: (id: string) => Promise<void>
  selecionarConcurso: (concurso: Concurso | null) => void
  
  // Ações - Questões
  carregarQuestoes: (userId: string, filtros?: FiltrosQuestao) => Promise<void>
  adicionarQuestao: (questao: Omit<Questao, 'id' | 'userId' | 'createdAt'>) => Promise<void>
  atualizarQuestao: (id: string, updates: Partial<Omit<Questao, 'id' | 'userId' | 'createdAt'>>) => Promise<void>
  removerQuestao: (id: string) => Promise<void>
  buscarQuestoes: (termo: string) => Promise<void>
  selecionarQuestao: (questao: Questao | null) => void
  
  // Ações - Simulados
  carregarSimulados: (userId: string) => Promise<void>
  criarSimulado: (simulado: Omit<Simulado, 'id' | 'userId' | 'createdAt'>) => Promise<void>
  iniciarSimulado: (simuladoId: string) => Promise<void>
  finalizarSimulado: (simuladoId: string, respostas: RespostaSimulado[]) => Promise<ResultadoSimulado>
  removerSimulado: (id: string) => Promise<void>
  
  // Ações - Registros
  carregarRegistros: (userId: string, dataInicio?: string, dataFim?: string) => Promise<void>
  adicionarRegistro: (registro: Omit<RegistroEstudo, 'id' | 'userId' | 'createdAt'>) => Promise<void>
  atualizarRegistro: (id: string, updates: Partial<Omit<RegistroEstudo, 'id' | 'userId' | 'createdAt'>>) => Promise<void>
  removerRegistro: (id: string) => Promise<void>
  carregarEstatisticas: (userId: string, periodo?: string) => Promise<void>
  
  // Real-time
  setupRealtimeSync: (userId: string) => () => void
  
  // Helpers
  obterConcursoPorId: (id: string) => Concurso | undefined
  obterQuestaoPorId: (id: string) => Questao | undefined
  obterSimuladoPorId: (id: string) => Simulado | undefined
}

export const useEstudosStore = create<EstudosState>((set, get) => ({
  // Estado inicial
  concursos: [],
  questoes: [],
  simulados: [],
  registros: [],
  loading: false,
  error: null,
  concursoSelecionado: null,
  questaoSelecionada: null,
  simuladoEmAndamento: null,
  estatisticas: null,
  
  // ============================================
  // AÇÕES - CONCURSOS
  // ============================================
  
  /**
   * Carrega todos os concursos do usuário
   */
  carregarConcursos: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const concursos = await carregarConcursosAPI(userId)
      set({ concursos, loading: false })
    } catch (error) {
      console.error('Error loading concursos:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar concursos',
        loading: false,
      })
    }
  },
  
  /**
   * Adiciona um novo concurso com optimistic update
   */
  adicionarConcurso: async (concurso: Omit<Concurso, 'id' | 'userId' | 'createdAt'>) => {
    const tempId = `temp-${Date.now()}`
    const concursoTemp: Concurso = {
      ...concurso,
      id: tempId,
      userId: '', // Será preenchido pela API
      createdAt: new Date().toISOString(),
    }
    
    // Atualização otimista
    set(state => ({
      concursos: [concursoTemp, ...state.concursos],
      loading: true,
      error: null,
    }))
    
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const novoConcurso = await adicionarConcursoAPI(concurso, user.id)
      
      // Substituir concurso temporário pelo real
      set(state => ({
        concursos: state.concursos.map(c => c.id === tempId ? novoConcurso : c),
        loading: false,
      }))
    } catch (error) {
      console.error('Error adding concurso:', error)
      // Rollback em caso de erro
      set(state => ({
        concursos: state.concursos.filter(c => c.id !== tempId),
        error: error instanceof Error ? error.message : 'Erro ao adicionar concurso',
        loading: false,
      }))
      throw error
    }
  },
  
  /**
   * Atualiza um concurso existente
   */
  atualizarConcurso: async (id: string, updates: Partial<Omit<Concurso, 'id' | 'userId' | 'createdAt'>>) => {
    // Salvar estado anterior para rollback
    const concursoAnterior = get().concursos.find(c => c.id === id)
    if (!concursoAnterior) {
      throw new Error('Concurso não encontrado')
    }
    
    // Atualização otimista
    set(state => ({
      concursos: state.concursos.map(c => 
        c.id === id ? { ...c, ...updates } : c
      ),
      loading: true,
      error: null,
    }))
    
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const concursoAtualizado = await atualizarConcursoAPI(id, updates, user.id)
      
      // Atualizar com dados reais do servidor
      set(state => ({
        concursos: state.concursos.map(c => c.id === id ? concursoAtualizado : c),
        loading: false,
      }))
    } catch (error) {
      console.error('Error updating concurso:', error)
      // Rollback em caso de erro
      set(state => ({
        concursos: state.concursos.map(c => c.id === id ? concursoAnterior : c),
        error: error instanceof Error ? error.message : 'Erro ao atualizar concurso',
        loading: false,
      }))
      throw error
    }
  },
  
  /**
   * Remove um concurso (com confirmação no componente)
   */
  removerConcurso: async (id: string) => {
    // Salvar estado anterior para rollback
    const concursoRemovido = get().concursos.find(c => c.id === id)
    if (!concursoRemovido) {
      throw new Error('Concurso não encontrado')
    }
    
    // Atualização otimista
    set(state => ({
      concursos: state.concursos.filter(c => c.id !== id),
      concursoSelecionado: state.concursoSelecionado?.id === id ? null : state.concursoSelecionado,
      loading: true,
      error: null,
    }))
    
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      await removerConcursoAPI(id, user.id)
      
      set({ loading: false })
    } catch (error) {
      console.error('Error removing concurso:', error)
      // Rollback em caso de erro
      set(state => ({
        concursos: [...state.concursos, concursoRemovido].sort((a, b) => {
          if (!a.dataProva) return 1
          if (!b.dataProva) return -1
          return new Date(a.dataProva).getTime() - new Date(b.dataProva).getTime()
        }),
        error: error instanceof Error ? error.message : 'Erro ao remover concurso',
        loading: false,
      }))
      throw error
    }
  },
  
  /**
   * Seleciona um concurso para visualização/edição
   */
  selecionarConcurso: (concurso: Concurso | null) => {
    set({ concursoSelecionado: concurso })
  },
  
  // ============================================
  // AÇÕES - QUESTÕES
  // ============================================
  
  /**
   * Carrega questões do usuário com filtros opcionais
   */
  carregarQuestoes: async (userId: string, filtros?: FiltrosQuestao) => {
    set({ loading: true, error: null })
    try {
      const questoes = await carregarQuestoesAPI(userId, filtros)
      set({ questoes, loading: false })
    } catch (error) {
      console.error('Error loading questoes:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar questões',
        loading: false,
      })
    }
  },
  
  /**
   * Adiciona uma nova questão com optimistic update
   */
  adicionarQuestao: async (questao: Omit<Questao, 'id' | 'userId' | 'createdAt'>) => {
    const tempId = `temp-${Date.now()}`
    const questaoTemp: Questao = {
      ...questao,
      id: tempId,
      userId: '', // Será preenchido pela API
      createdAt: new Date().toISOString(),
    }
    
    // Atualização otimista
    set(state => ({
      questoes: [questaoTemp, ...state.questoes],
      loading: true,
      error: null,
    }))
    
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const novaQuestao = await adicionarQuestaoAPI(questao, user.id)
      
      // Substituir questão temporária pela real
      set(state => ({
        questoes: state.questoes.map(q => q.id === tempId ? novaQuestao : q),
        loading: false,
      }))
    } catch (error) {
      console.error('Error adding questao:', error)
      // Rollback em caso de erro
      set(state => ({
        questoes: state.questoes.filter(q => q.id !== tempId),
        error: error instanceof Error ? error.message : 'Erro ao adicionar questão',
        loading: false,
      }))
      throw error
    }
  },
  
  /**
   * Atualiza uma questão existente
   */
  atualizarQuestao: async (id: string, updates: Partial<Omit<Questao, 'id' | 'userId' | 'createdAt'>>) => {
    // Salvar estado anterior para rollback
    const questaoAnterior = get().questoes.find(q => q.id === id)
    if (!questaoAnterior) {
      throw new Error('Questão não encontrada')
    }
    
    // Atualização otimista
    set(state => ({
      questoes: state.questoes.map(q => 
        q.id === id ? { ...q, ...updates } : q
      ),
      loading: true,
      error: null,
    }))
    
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const questaoAtualizada = await atualizarQuestaoAPI(id, updates, user.id)
      
      // Atualizar com dados reais do servidor
      set(state => ({
        questoes: state.questoes.map(q => q.id === id ? questaoAtualizada : q),
        loading: false,
      }))
    } catch (error) {
      console.error('Error updating questao:', error)
      // Rollback em caso de erro
      set(state => ({
        questoes: state.questoes.map(q => q.id === id ? questaoAnterior : q),
        error: error instanceof Error ? error.message : 'Erro ao atualizar questão',
        loading: false,
      }))
      throw error
    }
  },
  
  /**
   * Remove uma questão (com verificação de vínculos)
   */
  removerQuestao: async (id: string) => {
    // Salvar estado anterior para rollback
    const questaoRemovida = get().questoes.find(q => q.id === id)
    if (!questaoRemovida) {
      throw new Error('Questão não encontrada')
    }
    
    // Atualização otimista
    set(state => ({
      questoes: state.questoes.filter(q => q.id !== id),
      questaoSelecionada: state.questaoSelecionada?.id === id ? null : state.questaoSelecionada,
      loading: true,
      error: null,
    }))
    
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      await removerQuestaoAPI(id, user.id)
      
      set({ loading: false })
    } catch (error) {
      console.error('Error removing questao:', error)
      // Rollback em caso de erro
      set(state => ({
        questoes: [...state.questoes, questaoRemovida].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        error: error instanceof Error ? error.message : 'Erro ao remover questão',
        loading: false,
      }))
      throw error
    }
  },
  
  /**
   * Busca questões por termo (com debounce implementado no componente)
   */
  buscarQuestoes: async (termo: string) => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const questoes = await buscarQuestoesAPI(termo, user.id)
      set({ questoes, loading: false })
    } catch (error) {
      console.error('Error searching questoes:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao buscar questões',
        loading: false,
      })
    }
  },
  
  /**
   * Seleciona uma questão para visualização/edição
   */
  selecionarQuestao: (questao: Questao | null) => {
    set({ questaoSelecionada: questao })
  },
  
  // ============================================
  // AÇÕES - SIMULADOS
  // ============================================
  
  /**
   * Carrega todos os simulados do usuário
   */
  carregarSimulados: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const simulados = await carregarSimuladosAPI(userId)
      set({ simulados, loading: false })
    } catch (error) {
      console.error('Error loading simulados:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar simulados',
        loading: false,
      })
    }
  },
  
  /**
   * Cria um novo simulado com optimistic update
   */
  criarSimulado: async (simulado: Omit<Simulado, 'id' | 'userId' | 'createdAt'>) => {
    const tempId = `temp-${Date.now()}`
    const simuladoTemp: Simulado = {
      ...simulado,
      id: tempId,
      userId: '', // Será preenchido pela API
      createdAt: new Date().toISOString(),
    }
    
    // Atualização otimista
    set(state => ({
      simulados: [simuladoTemp, ...state.simulados],
      loading: true,
      error: null,
    }))
    
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const novoSimulado = await criarSimuladoAPI(simulado, user.id)
      
      // Substituir simulado temporário pelo real
      set(state => ({
        simulados: state.simulados.map(s => s.id === tempId ? novoSimulado : s),
        loading: false,
      }))
    } catch (error) {
      console.error('Error creating simulado:', error)
      // Rollback em caso de erro
      set(state => ({
        simulados: state.simulados.filter(s => s.id !== tempId),
        error: error instanceof Error ? error.message : 'Erro ao criar simulado',
        loading: false,
      }))
      throw error
    }
  },
  
  /**
   * Inicia um simulado (marca como em andamento)
   */
  iniciarSimulado: async (simuladoId: string) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      // Validar que o simulado existe
      await iniciarSimuladoAPI(simuladoId, user.id)
      
      // Atualizar estado local
      const simulado = get().simulados.find(s => s.id === simuladoId)
      if (simulado) {
        set({ simuladoEmAndamento: simulado })
      }
    } catch (error) {
      console.error('Error starting simulado:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao iniciar simulado',
      })
      throw error
    }
  },
  
  /**
   * Finaliza um simulado e calcula o resultado
   */
  finalizarSimulado: async (simuladoId: string, respostas: RespostaSimulado[]): Promise<ResultadoSimulado> => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      // Finalizar simulado e obter resultado
      const resultado = await finalizarSimuladoAPI(simuladoId, respostas, user.id)
      
      // Atualizar simulado no estado local
      set(state => ({
        simulados: state.simulados.map(s => 
          s.id === simuladoId 
            ? {
                ...s,
                dataRealizacao: new Date().toISOString(),
                acertos: resultado.acertos,
                totalQuestoes: resultado.totalQuestoes,
              }
            : s
        ),
        simuladoEmAndamento: null,
        loading: false,
      }))
      
      return resultado
    } catch (error) {
      console.error('Error finishing simulado:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao finalizar simulado',
        loading: false,
      })
      throw error
    }
  },
  
  /**
   * Remove um simulado
   */
  removerSimulado: async (id: string) => {
    // Salvar estado anterior para rollback
    const simuladoRemovido = get().simulados.find(s => s.id === id)
    if (!simuladoRemovido) {
      throw new Error('Simulado não encontrado')
    }
    
    // Atualização otimista
    set(state => ({
      simulados: state.simulados.filter(s => s.id !== id),
      simuladoEmAndamento: state.simuladoEmAndamento?.id === id ? null : state.simuladoEmAndamento,
      loading: true,
      error: null,
    }))
    
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      await removerSimuladoAPI(id, user.id)
      
      set({ loading: false })
    } catch (error) {
      console.error('Error removing simulado:', error)
      // Rollback em caso de erro
      set(state => ({
        simulados: [...state.simulados, simuladoRemovido].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        error: error instanceof Error ? error.message : 'Erro ao remover simulado',
        loading: false,
      }))
      throw error
    }
  },
  
  // ============================================
  // AÇÕES - REGISTROS
  // ============================================
  
  /**
   * Carrega registros de estudo do usuário com filtros de data opcionais
   */
  carregarRegistros: async (userId: string, dataInicio?: string, dataFim?: string) => {
    set({ loading: true, error: null })
    try {
      const registros = await carregarRegistrosAPI(userId, dataInicio, dataFim)
      set({ registros, loading: false })
    } catch (error) {
      console.error('Error loading registros:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar registros',
        loading: false,
      })
    }
  },
  
  /**
   * Adiciona um novo registro de estudo com optimistic update
   */
  adicionarRegistro: async (registro: Omit<RegistroEstudo, 'id' | 'userId' | 'createdAt'>) => {
    const tempId = `temp-${Date.now()}`
    const registroTemp: RegistroEstudo = {
      ...registro,
      id: tempId,
      userId: '', // Será preenchido pela API
      createdAt: new Date().toISOString(),
    }
    
    // Atualização otimista
    set(state => ({
      registros: [registroTemp, ...state.registros],
      loading: true,
      error: null,
    }))
    
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const novoRegistro = await adicionarRegistroAPI(registro, user.id)
      
      // Substituir registro temporário pelo real
      set(state => ({
        registros: state.registros.map(r => r.id === tempId ? novoRegistro : r),
        loading: false,
      }))
    } catch (error) {
      console.error('Error adding registro:', error)
      // Rollback em caso de erro
      set(state => ({
        registros: state.registros.filter(r => r.id !== tempId),
        error: error instanceof Error ? error.message : 'Erro ao adicionar registro',
        loading: false,
      }))
      throw error
    }
  },
  
  /**
   * Atualiza um registro de estudo existente
   */
  atualizarRegistro: async (id: string, updates: Partial<Omit<RegistroEstudo, 'id' | 'userId' | 'createdAt'>>) => {
    // Salvar estado anterior para rollback
    const registroAnterior = get().registros.find(r => r.id === id)
    if (!registroAnterior) {
      throw new Error('Registro não encontrado')
    }
    
    // Atualização otimista
    set(state => ({
      registros: state.registros.map(r => 
        r.id === id ? { ...r, ...updates } : r
      ),
      loading: true,
      error: null,
    }))
    
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const registroAtualizado = await atualizarRegistroAPI(id, updates, user.id)
      
      // Atualizar com dados reais do servidor
      set(state => ({
        registros: state.registros.map(r => r.id === id ? registroAtualizado : r),
        loading: false,
      }))
    } catch (error) {
      console.error('Error updating registro:', error)
      // Rollback em caso de erro
      set(state => ({
        registros: state.registros.map(r => r.id === id ? registroAnterior : r),
        error: error instanceof Error ? error.message : 'Erro ao atualizar registro',
        loading: false,
      }))
      throw error
    }
  },
  
  /**
   * Remove um registro de estudo
   */
  removerRegistro: async (id: string) => {
    // Salvar estado anterior para rollback
    const registroRemovido = get().registros.find(r => r.id === id)
    if (!registroRemovido) {
      throw new Error('Registro não encontrado')
    }
    
    // Atualização otimista
    set(state => ({
      registros: state.registros.filter(r => r.id !== id),
      loading: true,
      error: null,
    }))
    
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      await removerRegistroAPI(id, user.id)
      
      set({ loading: false })
    } catch (error) {
      console.error('Error removing registro:', error)
      // Rollback em caso de erro
      set(state => ({
        registros: [...state.registros, registroRemovido].sort((a, b) => 
          new Date(b.data).getTime() - new Date(a.data).getTime()
        ),
        error: error instanceof Error ? error.message : 'Erro ao remover registro',
        loading: false,
      }))
      throw error
    }
  },
  
  /**
   * Carrega estatísticas de estudo para um período
   */
  carregarEstatisticas: async (userId: string, periodo?: string) => {
    set({ loading: true, error: null })
    try {
      let dataInicio: string | undefined
      let dataFim: string | undefined
      
      // Calcular intervalo de datas baseado no período
      if (periodo) {
        const hoje = new Date()
        
        if (periodo === 'semana') {
          // Últimos 7 dias
          const inicioSemana = new Date(hoje)
          inicioSemana.setDate(hoje.getDate() - 7)
          dataInicio = inicioSemana.toISOString().split('T')[0]
          dataFim = hoje.toISOString().split('T')[0]
        } else if (periodo === 'mes') {
          // Mês atual
          const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
          dataInicio = inicioMes.toISOString().split('T')[0]
          dataFim = hoje.toISOString().split('T')[0]
        } else if (periodo === 'ano') {
          // Ano atual
          const inicioAno = new Date(hoje.getFullYear(), 0, 1)
          dataInicio = inicioAno.toISOString().split('T')[0]
          dataFim = hoje.toISOString().split('T')[0]
        }
      }
      
      const estatisticas = await calcularEstatisticasAPI(userId, dataInicio, dataFim)
      set({ estatisticas, loading: false })
    } catch (error) {
      console.error('Error loading estatisticas:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar estatísticas',
        loading: false,
      })
    }
  },
  
  // ============================================
  // REAL-TIME SYNC
  // ============================================
  
  /**
   * Configura sincronização em tempo real para todas as tabelas do módulo de estudos
   * @param userId - ID do usuário para filtrar os dados
   * @returns Função de cleanup que cancela todas as subscriptions
   */
  setupRealtimeSync: (userId: string) => {
    // Types do banco de dados
    type ConcursoRow = Database['public']['Tables']['estudos_concursos']['Row']
    type QuestaoRow = Database['public']['Tables']['estudos_questoes']['Row']
    type SimuladoRow = Database['public']['Tables']['estudos_simulados']['Row']
    type RegistroEstudoRow = Database['public']['Tables']['estudos_registros']['Row']
    
    // Helper functions para mapear dados do banco
    const mapConcursoFromDB = (row: ConcursoRow): Concurso => ({
      id: row.id,
      userId: row.user_id,
      nome: row.nome,
      dataProva: row.data_prova,
      instituicao: row.instituicao,
      cargo: row.cargo,
      disciplinas: row.disciplinas || [],
      status: row.status as 'em_andamento' | 'concluido' | 'cancelado',
      createdAt: row.created_at,
    })
    
    const mapQuestaoFromDB = (row: QuestaoRow): Questao => ({
      id: row.id,
      userId: row.user_id,
      concursoId: row.concurso_id,
      disciplina: row.disciplina,
      enunciado: row.enunciado,
      alternativas: row.alternativas as any,
      respostaCorreta: row.resposta_correta as any,
      explicacao: row.explicacao,
      tags: row.tags || [],
      createdAt: row.created_at,
    })
    
    const mapSimuladoFromDB = (row: SimuladoRow): Simulado => ({
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
    })
    
    const mapRegistroEstudoFromDB = (row: RegistroEstudoRow): RegistroEstudo => ({
      id: row.id,
      userId: row.user_id,
      data: row.data,
      disciplina: row.disciplina,
      duracaoMinutos: row.duracao_minutos,
      topicos: row.topicos || [],
      observacoes: row.observacoes,
      createdAt: row.created_at,
    })
    
    // ============================================
    // SUBSCRIPTION: estudos_concursos
    // ============================================
    const cleanupConcursos = supabaseSync.subscribeToUserData<ConcursoRow>(
      'estudos_concursos',
      userId,
      // INSERT: Adicionar novo concurso ao estado
      (payload) => {
        const novoConcurso = mapConcursoFromDB(payload)
        set(state => ({
          concursos: [novoConcurso, ...state.concursos],
        }))
        console.log('✓ Concurso adicionado via real-time:', novoConcurso.nome)
      },
      // UPDATE: Atualizar concurso existente
      (payload) => {
        const concursoAtualizado = mapConcursoFromDB(payload)
        set(state => ({
          concursos: state.concursos.map(c =>
            c.id === concursoAtualizado.id ? concursoAtualizado : c
          ),
          concursoSelecionado:
            state.concursoSelecionado?.id === concursoAtualizado.id
              ? concursoAtualizado
              : state.concursoSelecionado,
        }))
        console.log('✓ Concurso atualizado via real-time:', concursoAtualizado.nome)
      },
      // DELETE: Remover concurso do estado
      (payload) => {
        set(state => ({
          concursos: state.concursos.filter(c => c.id !== payload.id),
          concursoSelecionado:
            state.concursoSelecionado?.id === payload.id
              ? null
              : state.concursoSelecionado,
        }))
        console.log('✓ Concurso removido via real-time:', payload.id)
      }
    )
    
    // ============================================
    // SUBSCRIPTION: estudos_questoes
    // ============================================
    const cleanupQuestoes = supabaseSync.subscribeToUserData<QuestaoRow>(
      'estudos_questoes',
      userId,
      // INSERT: Adicionar nova questão ao estado
      (payload) => {
        const novaQuestao = mapQuestaoFromDB(payload)
        set(state => ({
          questoes: [novaQuestao, ...state.questoes],
        }))
        console.log('✓ Questão adicionada via real-time:', novaQuestao.id)
      },
      // UPDATE: Atualizar questão existente
      (payload) => {
        const questaoAtualizada = mapQuestaoFromDB(payload)
        set(state => ({
          questoes: state.questoes.map(q =>
            q.id === questaoAtualizada.id ? questaoAtualizada : q
          ),
          questaoSelecionada:
            state.questaoSelecionada?.id === questaoAtualizada.id
              ? questaoAtualizada
              : state.questaoSelecionada,
        }))
        console.log('✓ Questão atualizada via real-time:', questaoAtualizada.id)
      },
      // DELETE: Remover questão do estado
      (payload) => {
        set(state => ({
          questoes: state.questoes.filter(q => q.id !== payload.id),
          questaoSelecionada:
            state.questaoSelecionada?.id === payload.id
              ? null
              : state.questaoSelecionada,
        }))
        console.log('✓ Questão removida via real-time:', payload.id)
      }
    )
    
    // ============================================
    // SUBSCRIPTION: estudos_simulados
    // ============================================
    const cleanupSimulados = supabaseSync.subscribeToUserData<SimuladoRow>(
      'estudos_simulados',
      userId,
      // INSERT: Adicionar novo simulado ao estado
      (payload) => {
        const novoSimulado = mapSimuladoFromDB(payload)
        set(state => ({
          simulados: [novoSimulado, ...state.simulados],
        }))
        console.log('✓ Simulado adicionado via real-time:', novoSimulado.titulo)
      },
      // UPDATE: Atualizar simulado existente
      (payload) => {
        const simuladoAtualizado = mapSimuladoFromDB(payload)
        set(state => ({
          simulados: state.simulados.map(s =>
            s.id === simuladoAtualizado.id ? simuladoAtualizado : s
          ),
          simuladoEmAndamento:
            state.simuladoEmAndamento?.id === simuladoAtualizado.id
              ? simuladoAtualizado
              : state.simuladoEmAndamento,
        }))
        console.log('✓ Simulado atualizado via real-time:', simuladoAtualizado.titulo)
      },
      // DELETE: Remover simulado do estado
      (payload) => {
        set(state => ({
          simulados: state.simulados.filter(s => s.id !== payload.id),
          simuladoEmAndamento:
            state.simuladoEmAndamento?.id === payload.id
              ? null
              : state.simuladoEmAndamento,
        }))
        console.log('✓ Simulado removido via real-time:', payload.id)
      }
    )
    
    // ============================================
    // SUBSCRIPTION: estudos_registros
    // ============================================
    const cleanupRegistros = supabaseSync.subscribeToUserData<RegistroEstudoRow>(
      'estudos_registros',
      userId,
      // INSERT: Adicionar novo registro ao estado
      (payload) => {
        const novoRegistro = mapRegistroEstudoFromDB(payload)
        set(state => ({
          registros: [novoRegistro, ...state.registros],
        }))
        console.log('✓ Registro adicionado via real-time:', novoRegistro.disciplina)
      },
      // UPDATE: Atualizar registro existente
      (payload) => {
        const registroAtualizado = mapRegistroEstudoFromDB(payload)
        set(state => ({
          registros: state.registros.map(r =>
            r.id === registroAtualizado.id ? registroAtualizado : r
          ),
        }))
        console.log('✓ Registro atualizado via real-time:', registroAtualizado.disciplina)
      },
      // DELETE: Remover registro do estado
      (payload) => {
        set(state => ({
          registros: state.registros.filter(r => r.id !== payload.id),
        }))
        console.log('✓ Registro removido via real-time:', payload.id)
      }
    )
    
    console.log('✓ Real-time sync configurado para módulo de Estudos')
    
    // ============================================
    // CLEANUP FUNCTION
    // ============================================
    // Retorna função que cancela todas as subscriptions
    return () => {
      cleanupConcursos()
      cleanupQuestoes()
      cleanupSimulados()
      cleanupRegistros()
      console.log('✓ Real-time sync desconectado para módulo de Estudos')
    }
  },
  
  // ============================================
  // HELPERS
  // ============================================
  
  obterConcursoPorId: (id: string) => {
    return get().concursos.find(c => c.id === id)
  },
  
  obterQuestaoPorId: (id: string) => {
    return get().questoes.find(q => q.id === id)
  },
  
  obterSimuladoPorId: (id: string) => {
    return get().simulados.find(s => s.id === id)
  },
}))
