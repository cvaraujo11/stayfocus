/**
 * Store Zustand para gerenciamento de Saúde (Medicamentos e Humor)
 * Integrado com Supabase para persistência e sincronização em tempo real
 */

import { create } from 'zustand'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { supabaseSync } from '@/app/lib/supabase/sync'
import {
  carregarMedicamentos,
  carregarMedicamentosAtivos,
  adicionarMedicamento as adicionarMedicamentoAPI,
  atualizarMedicamento as atualizarMedicamentoAPI,
  removerMedicamento as removerMedicamentoAPI,
  registrarTomada as registrarTomadaAPI,
  carregarHistoricoTomadas,
  obterUltimaTomada,
  calcularAdesao,
  type Medicamento,
  type TomadaMedicamento,
} from '@/app/lib/supabase/medicamentos'
import {
  carregarRegistrosHumor,
  carregarRegistroHumorPorData,
  salvarRegistroHumor as salvarRegistroHumorAPI,
  removerRegistroHumor as removerRegistroHumorAPI,
  calcularEstatisticasHumor,
  calcularTendenciaHumor,
  obterHumorPorMes,
  type RegistroHumor,
  type EstatisticasHumor,
  type TendenciaHumor,
} from '@/app/lib/supabase/humor'
import type { Database } from '@/app/types/database'

// Types do banco de dados para real-time
type MedicamentoRow = Database['public']['Tables']['saude_medicamentos']['Row']
type RegistroHumorRow = Database['public']['Tables']['saude_registros_humor']['Row']
type TomadaMedicamentoRow = Database['public']['Tables']['saude_tomadas_medicamentos']['Row']

// Estado da Store
interface SaudeState {
  // Estados
  medicamentos: Medicamento[]
  registrosHumor: RegistroHumor[]
  tomadas: TomadaMedicamento[]
  loading: boolean
  error: string | null
  
  // Estatísticas
  estatisticasHumor: EstatisticasHumor | null
  tendenciaHumor: TendenciaHumor | null
  
  // Ações - Medicamentos
  carregarMedicamentos: (userId: string) => Promise<void>
  carregarMedicamentosAtivos: (userId: string) => Promise<void>
  adicionarMedicamento: (medicamento: Omit<Medicamento, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  atualizarMedicamento: (id: string, updates: Partial<Omit<Medicamento, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  removerMedicamento: (id: string) => Promise<void>
  toggleMedicamentoAtivo: (id: string, ativo: boolean) => Promise<void>
  registrarTomada: (medicamentoId: string, horarioProgramado?: string, observacoes?: string) => Promise<void>
  carregarHistoricoTomadas: (medicamentoId: string, dataInicio?: string, dataFim?: string) => Promise<void>
  obterUltimaTomada: (medicamentoId: string) => Promise<TomadaMedicamento | null>
  calcularAdesao: (medicamentoId: string, diasAvaliar?: number) => Promise<{ percentualAdesao: number; tomadasEsperadas: number; tomadasRealizadas: number }>
  
  // Ações - Humor
  carregarRegistrosHumor: (userId: string, dataInicio?: string, dataFim?: string) => Promise<void>
  carregarRegistroHumorPorData: (userId: string, data: string) => Promise<RegistroHumor | null>
  salvarRegistroHumor: (registro: Omit<RegistroHumor, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  removerRegistroHumor: (id: string) => Promise<void>
  carregarEstatisticasHumor: (userId: string, dataInicio?: string, dataFim?: string) => Promise<void>
  carregarTendenciaHumor: (userId: string, diasRecentes?: number) => Promise<void>
  obterHumorPorMes: (userId: string, ano: number, mes: number) => Promise<RegistroHumor[]>
  
  // Real-time
  setupRealtimeSync: (userId: string) => () => void
  
  // Helpers
  obterMedicamentoPorId: (id: string) => Medicamento | undefined
  obterRegistroHumorPorId: (id: string) => RegistroHumor | undefined
}

export const useSaudeStore = create<SaudeState>((set, get) => ({
  // Estado inicial
  medicamentos: [],
  registrosHumor: [],
  tomadas: [],
  loading: false,
  error: null,
  estatisticasHumor: null,
  tendenciaHumor: null,
  
  // ============================================================================
  // AÇÕES - MEDICAMENTOS
  // ============================================================================
  
  carregarMedicamentos: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const medicamentos = await carregarMedicamentos(userId)
      set({ medicamentos, loading: false })
    } catch (error) {
      console.error('Error loading medicamentos:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar medicamentos',
        loading: false,
      })
    }
  },
  
  carregarMedicamentosAtivos: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const medicamentos = await carregarMedicamentosAtivos(userId)
      set({ medicamentos, loading: false })
    } catch (error) {
      console.error('Error loading medicamentos ativos:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar medicamentos ativos',
        loading: false,
      })
    }
  },
  
  adicionarMedicamento: async (medicamento) => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const novoMedicamento = await adicionarMedicamentoAPI(medicamento, user.id)
      set(state => ({
        medicamentos: [novoMedicamento, ...state.medicamentos],
        loading: false,
      }))
    } catch (error) {
      console.error('Error adding medicamento:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao adicionar medicamento',
        loading: false,
      })
      throw error
    }
  },
  
  atualizarMedicamento: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const medicamentoAtualizado = await atualizarMedicamentoAPI(id, updates, user.id)
      set(state => ({
        medicamentos: state.medicamentos.map(m => m.id === id ? medicamentoAtualizado : m),
        loading: false,
      }))
    } catch (error) {
      console.error('Error updating medicamento:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao atualizar medicamento',
        loading: false,
      })
      throw error
    }
  },
  
  removerMedicamento: async (id) => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      await removerMedicamentoAPI(id, user.id)
      set(state => ({
        medicamentos: state.medicamentos.filter(m => m.id !== id),
        loading: false,
      }))
    } catch (error) {
      console.error('Error removing medicamento:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao remover medicamento',
        loading: false,
      })
      throw error
    }
  },
  
  toggleMedicamentoAtivo: async (id, ativo) => {
    try {
      await get().atualizarMedicamento(id, { ativo })
    } catch (error) {
      console.error('Error toggling medicamento ativo:', error)
      throw error
    }
  },
  
  registrarTomada: async (medicamentoId, horarioProgramado, observacoes) => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const tomada = await registrarTomadaAPI(medicamentoId, user.id, horarioProgramado, observacoes)
      set(state => ({
        tomadas: [tomada, ...state.tomadas],
        loading: false,
      }))
    } catch (error) {
      console.error('Error registering tomada:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao registrar tomada',
        loading: false,
      })
      throw error
    }
  },
  
  carregarHistoricoTomadas: async (medicamentoId, dataInicio, dataFim) => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const tomadas = await carregarHistoricoTomadas(medicamentoId, user.id, dataInicio, dataFim)
      set({ tomadas, loading: false })
    } catch (error) {
      console.error('Error loading historico tomadas:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar histórico',
        loading: false,
      })
    }
  },
  
  obterUltimaTomada: async (medicamentoId) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      return await obterUltimaTomada(medicamentoId, user.id)
    } catch (error) {
      console.error('Error getting ultima tomada:', error)
      return null
    }
  },
  
  calcularAdesao: async (medicamentoId, diasAvaliar = 30) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      return await calcularAdesao(medicamentoId, user.id, diasAvaliar)
    } catch (error) {
      console.error('Error calculating adesao:', error)
      throw error
    }
  },
  
  // ============================================================================
  // AÇÕES - HUMOR
  // ============================================================================
  
  carregarRegistrosHumor: async (userId, dataInicio, dataFim) => {
    set({ loading: true, error: null })
    try {
      const registros = await carregarRegistrosHumor(userId, dataInicio, dataFim)
      set({ registrosHumor: registros, loading: false })
    } catch (error) {
      console.error('Error loading registros humor:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar registros de humor',
        loading: false,
      })
    }
  },
  
  carregarRegistroHumorPorData: async (userId, data) => {
    try {
      return await carregarRegistroHumorPorData(userId, data)
    } catch (error) {
      console.error('Error loading registro humor por data:', error)
      return null
    }
  },
  
  salvarRegistroHumor: async (registro) => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const registroSalvo = await salvarRegistroHumorAPI(registro, user.id)
      
      set(state => {
        const registros = state.registrosHumor.filter(r => r.id !== registroSalvo.id)
        return {
          registrosHumor: [registroSalvo, ...registros].sort((a, b) => 
            new Date(b.data).getTime() - new Date(a.data).getTime()
          ),
          loading: false,
        }
      })
    } catch (error) {
      console.error('Error saving registro humor:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao salvar registro de humor',
        loading: false,
      })
      throw error
    }
  },
  
  removerRegistroHumor: async (id) => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      await removerRegistroHumorAPI(id, user.id)
      set(state => ({
        registrosHumor: state.registrosHumor.filter(r => r.id !== id),
        loading: false,
      }))
    } catch (error) {
      console.error('Error removing registro humor:', error)
      set({
        error: error instanceof Error ? error.message : 'Erro ao remover registro de humor',
        loading: false,
      })
      throw error
    }
  },
  
  carregarEstatisticasHumor: async (userId, dataInicio, dataFim) => {
    try {
      const estatisticas = await calcularEstatisticasHumor(userId, dataInicio, dataFim)
      set({ estatisticasHumor: estatisticas })
    } catch (error) {
      console.error('Error loading estatisticas humor:', error)
    }
  },
  
  carregarTendenciaHumor: async (userId, diasRecentes = 7) => {
    try {
      const tendencia = await calcularTendenciaHumor(userId, diasRecentes)
      set({ tendenciaHumor: tendencia })
    } catch (error) {
      console.error('Error loading tendencia humor:', error)
    }
  },
  
  obterHumorPorMes: async (userId, ano, mes) => {
    try {
      return await obterHumorPorMes(userId, ano, mes)
    } catch (error) {
      console.error('Error loading humor por mes:', error)
      return []
    }
  },
  
  // ============================================================================
  // REAL-TIME SYNC
  // ============================================================================
  
  setupRealtimeSync: (userId: string) => {
    const cleanupMedicamentos = supabaseSync.subscribeToUserData<MedicamentoRow>(
      'saude_medicamentos',
      userId,
      (newMedicamento) => {
        const medicamento: Medicamento = {
          id: newMedicamento.id,
          nome: newMedicamento.nome,
          dosagem: newMedicamento.dosagem,
          frequencia: newMedicamento.frequencia,
          horarios: newMedicamento.horarios,
          observacoes: newMedicamento.observacoes,
          dataInicio: newMedicamento.data_inicio,
          intervaloMinutos: newMedicamento.intervalo_minutos,
          ativo: newMedicamento.ativo,
          createdAt: newMedicamento.created_at,
          updatedAt: newMedicamento.updated_at,
        }
        set(state => ({
          medicamentos: [medicamento, ...state.medicamentos.filter(m => m.id !== medicamento.id)]
        }))
      },
      (updatedMedicamento) => {
        const medicamento: Medicamento = {
          id: updatedMedicamento.id,
          nome: updatedMedicamento.nome,
          dosagem: updatedMedicamento.dosagem,
          frequencia: updatedMedicamento.frequencia,
          horarios: updatedMedicamento.horarios,
          observacoes: updatedMedicamento.observacoes,
          dataInicio: updatedMedicamento.data_inicio,
          intervaloMinutos: updatedMedicamento.intervalo_minutos,
          ativo: updatedMedicamento.ativo,
          createdAt: updatedMedicamento.created_at,
          updatedAt: updatedMedicamento.updated_at,
        }
        set(state => ({
          medicamentos: state.medicamentos.map(m => m.id === medicamento.id ? medicamento : m)
        }))
      },
      (deleted) => {
        set(state => ({
          medicamentos: state.medicamentos.filter(m => m.id !== deleted.id)
        }))
      }
    )
    
    const cleanupHumor = supabaseSync.subscribeToUserData<RegistroHumorRow>(
      'saude_registros_humor',
      userId,
      (newRegistro) => {
        const registro: RegistroHumor = {
          id: newRegistro.id,
          data: newRegistro.data,
          nivel: newRegistro.nivel,
          fatores: newRegistro.fatores || [],
          notas: newRegistro.notas,
          createdAt: newRegistro.created_at,
          updatedAt: newRegistro.updated_at,
        }
        set(state => ({
          registrosHumor: [registro, ...state.registrosHumor.filter(r => r.id !== registro.id)]
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        }))
      },
      (updatedRegistro) => {
        const registro: RegistroHumor = {
          id: updatedRegistro.id,
          data: updatedRegistro.data,
          nivel: updatedRegistro.nivel,
          fatores: updatedRegistro.fatores || [],
          notas: updatedRegistro.notas,
          createdAt: updatedRegistro.created_at,
          updatedAt: updatedRegistro.updated_at,
        }
        set(state => ({
          registrosHumor: state.registrosHumor.map(r => r.id === registro.id ? registro : r)
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        }))
      },
      (deleted) => {
        set(state => ({
          registrosHumor: state.registrosHumor.filter(r => r.id !== deleted.id)
        }))
      }
    )
    
    const cleanupTomadas = supabaseSync.subscribeToUserData<TomadaMedicamentoRow>(
      'saude_tomadas_medicamentos',
      userId,
      (newTomada) => {
        const tomada: TomadaMedicamento = {
          id: newTomada.id,
          medicamentoId: newTomada.medicamento_id,
          dataHora: newTomada.data_hora,
          horarioProgramado: newTomada.horario_programado,
          observacoes: newTomada.observacoes,
          createdAt: newTomada.created_at,
        }
        set(state => ({
          tomadas: [tomada, ...state.tomadas.filter(t => t.id !== tomada.id)]
        }))
      }
    )
    
    // Retornar função de cleanup
    return () => {
      cleanupMedicamentos()
      cleanupHumor()
      cleanupTomadas()
    }
  },
  
  // ============================================================================
  // HELPERS
  // ============================================================================
  
  obterMedicamentoPorId: (id) => {
    return get().medicamentos.find(m => m.id === id)
  },
  
  obterRegistroHumorPorId: (id) => {
    return get().registrosHumor.find(r => r.id === id)
  },
}))
