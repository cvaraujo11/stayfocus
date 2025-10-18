import { create } from 'zustand'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { supabaseSync } from '@/app/lib/supabase/sync'
import type { Database } from '@/app/types/database'

type RegistroEstudoRow = Database['public']['Tables']['estudos_registros']['Row']

export type RegistroEstudo = {
  id: string
  data: string // formato ISO: YYYY-MM-DD
  disciplina: string
  duracao_minutos: number
  topicos: string[]
  observacoes: string
}

// Legacy type for backward compatibility
export type SessaoEstudo = {
  id: string
  titulo: string
  descricao: string
  duracao: number // em minutos
  data: string
  completo: boolean
}

// Statistics type
export type EstatisticasDisciplina = {
  disciplina: string
  total_minutos: number
  total_sessoes: number
  media_minutos: number
}

interface RegistroEstudosState {
  registros: RegistroEstudo[]
  loading: boolean
  error: string | null
  
  // Data operations
  carregarRegistros: (userId: string, dataInicio?: string, dataFim?: string) => Promise<void>
  adicionarRegistro: (registro: Omit<RegistroEstudo, 'id'>) => Promise<void>
  atualizarRegistro: (id: string, updates: Partial<Omit<RegistroEstudo, 'id'>>) => Promise<void>
  removerRegistro: (id: string) => Promise<void>
  obterEstatisticas: (userId: string, disciplina?: string) => Promise<EstatisticasDisciplina[]>
  
  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void
  
  // Legacy methods for backward compatibility
  sessoes: SessaoEstudo[]
  adicionarSessao: (sessao: Omit<SessaoEstudo, 'id' | 'data' | 'completo'>) => Promise<void>
  removerSessao: (id: string) => Promise<void>
  alternarCompletar: (id: string) => Promise<void>
  editarSessao: (id: string, dados: Pick<SessaoEstudo, 'titulo' | 'descricao' | 'duracao'>) => Promise<void>
}

const mapRowToRegistro = (row: RegistroEstudoRow): RegistroEstudo => ({
  id: row.id,
  data: row.data,
  disciplina: row.disciplina,
  duracao_minutos: row.duracao_minutos,
  topicos: row.topicos || [],
  observacoes: row.observacoes || '',
})

const mapRegistroToSessao = (registro: RegistroEstudo): SessaoEstudo => ({
  id: registro.id,
  titulo: registro.disciplina,
  descricao: registro.observacoes,
  duracao: registro.duracao_minutos,
  data: registro.data,
  completo: true, // All saved registros are considered complete
})

export const useRegistroEstudosStore = create<RegistroEstudosState>((set, get) => ({
  registros: [],
  loading: false,
  error: null,

  carregarRegistros: async (userId: string, dataInicio?: string, dataFim?: string) => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      let query = supabase
        .from('estudos_registros')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .order('created_at', { ascending: false })

      if (dataInicio) {
        query = query.gte('data', dataInicio)
      }
      if (dataFim) {
        query = query.lte('data', dataFim)
      }

      const { data, error } = await query

      if (error) throw error
      
      const registros = data.map(mapRowToRegistro)
      set({ registros, loading: false })
    } catch (error: any) {
      console.error('Erro ao carregar registros de estudo:', error)
      set({ error: error.message || 'Erro ao carregar registros de estudo', loading: false })
    }
  },

  adicionarRegistro: async (novoRegistro) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('estudos_registros')
        .insert({
          user_id: user.id,
          data: novoRegistro.data,
          disciplina: novoRegistro.disciplina,
          duracao_minutos: novoRegistro.duracao_minutos,
          topicos: novoRegistro.topicos.length > 0 ? novoRegistro.topicos : null,
          observacoes: novoRegistro.observacoes || null,
        })
        .select()
        .single()

      if (error) throw error

      const registro = mapRowToRegistro(data)
      set((state) => ({
        registros: [registro, ...state.registros],
      }))
    } catch (error: any) {
      console.error('Erro ao adicionar registro de estudo:', error)
      set({ error: error.message || 'Erro ao adicionar registro de estudo' })
      throw error
    }
  },

  atualizarRegistro: async (id: string, updates: Partial<Omit<RegistroEstudo, 'id'>>) => {
    try {
      const supabase = createSupabaseClient()
      
      const dbUpdates: any = {}
      if (updates.data !== undefined) dbUpdates.data = updates.data
      if (updates.disciplina !== undefined) dbUpdates.disciplina = updates.disciplina
      if (updates.duracao_minutos !== undefined) dbUpdates.duracao_minutos = updates.duracao_minutos
      if (updates.topicos !== undefined) dbUpdates.topicos = updates.topicos.length > 0 ? updates.topicos : null
      if (updates.observacoes !== undefined) dbUpdates.observacoes = updates.observacoes || null

      const { data, error } = await supabase
        .from('estudos_registros')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const registro = mapRowToRegistro(data)
      set((state) => ({
        registros: state.registros.map((r) =>
          r.id === id ? registro : r
        ),
      }))
    } catch (error: any) {
      console.error('Erro ao atualizar registro de estudo:', error)
      set({ error: error.message || 'Erro ao atualizar registro de estudo' })
      throw error
    }
  },

  removerRegistro: async (id: string) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('estudos_registros')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        registros: state.registros.filter((r) => r.id !== id),
      }))
    } catch (error: any) {
      console.error('Erro ao remover registro de estudo:', error)
      set({ error: error.message || 'Erro ao remover registro de estudo' })
      throw error
    }
  },

  obterEstatisticas: async (userId: string, disciplina?: string) => {
    try {
      const supabase = createSupabaseClient()
      let query = supabase
        .from('estudos_registros')
        .select('disciplina, duracao_minutos')
        .eq('user_id', userId)

      if (disciplina) {
        query = query.eq('disciplina', disciplina)
      }

      const { data, error } = await query

      if (error) throw error

      // Aggregate statistics by disciplina
      const stats = new Map<string, { total_minutos: number; total_sessoes: number }>()
      
      data.forEach((row) => {
        const current = stats.get(row.disciplina) || { total_minutos: 0, total_sessoes: 0 }
        stats.set(row.disciplina, {
          total_minutos: current.total_minutos + row.duracao_minutos,
          total_sessoes: current.total_sessoes + 1,
        })
      })

      const estatisticas: EstatisticasDisciplina[] = Array.from(stats.entries()).map(
        ([disciplina, { total_minutos, total_sessoes }]) => ({
          disciplina,
          total_minutos,
          total_sessoes,
          media_minutos: Math.round(total_minutos / total_sessoes),
        })
      )

      return estatisticas.sort((a, b) => b.total_minutos - a.total_minutos)
    } catch (error: any) {
      console.error('Erro ao obter estatísticas:', error)
      set({ error: error.message || 'Erro ao obter estatísticas' })
      return []
    }
  },

  setupRealtimeSync: (userId: string) => {
    return supabaseSync.subscribeToUserData<RegistroEstudoRow>(
      'estudos_registros',
      userId,
      (newRow) => {
        const registro = mapRowToRegistro(newRow)
        set((state) => ({
          registros: [registro, ...state.registros],
        }))
      },
      (updatedRow) => {
        const registro = mapRowToRegistro(updatedRow)
        set((state) => ({
          registros: state.registros.map((r) =>
            r.id === updatedRow.id ? registro : r
          ),
        }))
      },
      (deleted) => {
        set((state) => ({
          registros: state.registros.filter((r) => r.id !== deleted.id),
        }))
      }
    )
  },

  // Legacy methods for backward compatibility
  get sessoes() {
    return get().registros.map(mapRegistroToSessao)
  },

  adicionarSessao: async (sessao) => {
    const hoje = new Date().toISOString().split('T')[0]
    return get().adicionarRegistro({
      data: hoje,
      disciplina: sessao.titulo,
      duracao_minutos: sessao.duracao,
      topicos: [],
      observacoes: sessao.descricao,
    })
  },

  removerSessao: async (id: string) => {
    return get().removerRegistro(id)
  },

  alternarCompletar: async (id: string) => {
    // Legacy method - no-op since all saved registros are considered complete
    console.warn('alternarCompletar is deprecated - all saved registros are considered complete')
  },

  editarSessao: async (id: string, dados) => {
    return get().atualizarRegistro(id, {
      disciplina: dados.titulo,
      duracao_minutos: dados.duracao,
      observacoes: dados.descricao,
    })
  },
}))
