import { create } from 'zustand'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { supabaseSync } from '@/app/lib/supabase/sync'
import type { Database } from '@/app/types/database'

type PrioridadeRow = Database['public']['Tables']['prioridades']['Row']

export type Prioridade = {
  id: string
  texto: string
  concluida: boolean
  data: string // formato ISO: YYYY-MM-DD
  categoria: string
  nivel_prioridade: number
  tipo?: 'geral' | 'concurso' // Novo campo para tipo de prioridade
  origemId?: string // Novo campo para ID da origem (ex: concursoId)
}

interface PrioridadesState {
  prioridades: Prioridade[]
  loading: boolean
  error: string | null

  // Data operations
  carregarPrioridades: (userId: string) => Promise<void>
  adicionarPrioridade: (prioridade: Omit<Prioridade, 'id' | 'data' | 'concluida'> & { concluida?: boolean }) => Promise<void>
  atualizarPrioridade: (id: string, updates: Partial<Omit<Prioridade, 'id' | 'data'>>) => Promise<void>
  removerPrioridade: (id: string) => Promise<void>
  marcarConcluida: (id: string) => Promise<void>

  // Helper methods
  getHistoricoPorData: (data?: string) => Prioridade[]
  getDatasPrioridades: () => string[]

  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void

  // Legacy method names for backward compatibility
  editarPrioridade: (id: string, texto: string) => Promise<void>
  toggleConcluida: (id: string) => Promise<void>
}

const mapRowToPrioridade = (row: PrioridadeRow): Prioridade => ({
  id: row.id,
  texto: row.titulo,
  concluida: row.concluida,
  data: row.data,
  categoria: row.categoria || '',
  nivel_prioridade: row.nivel_prioridade,
  // Map categoria to tipo for backward compatibility
  tipo: row.categoria === 'concurso' ? 'concurso' : 'geral',
  // Note: origemId is not stored in database, would need schema update
})

export const usePrioridadesStore = create<PrioridadesState>((set, get) => ({
  prioridades: [],
  loading: false,
  error: null,

  carregarPrioridades: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('prioridades')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .order('nivel_prioridade', { ascending: true })

      if (error) throw error

      const prioridades = data.map(mapRowToPrioridade)
      set({ prioridades, loading: false })
    } catch (error: any) {
      console.error('Erro ao carregar prioridades:', error)
      set({ error: error.message || 'Erro ao carregar prioridades', loading: false })
    }
  },

  adicionarPrioridade: async (novaPrioridade) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Obter a data atual em formato ISO (YYYY-MM-DD)
      const dataAtual = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('prioridades')
        .insert({
          user_id: user.id,
          titulo: novaPrioridade.texto,
          concluida: novaPrioridade.concluida ?? false,
          data: dataAtual,
          categoria: novaPrioridade.tipo || 'geral',
          nivel_prioridade: novaPrioridade.nivel_prioridade || 2,
        })
        .select()
        .single()

      if (error) throw error

      const prioridade = mapRowToPrioridade(data)
      set((state) => ({
        prioridades: [prioridade, ...state.prioridades],
      }))
    } catch (error: any) {
      console.error('Erro ao adicionar prioridade:', error)
      set({ error: error.message || 'Erro ao adicionar prioridade' })
      throw error
    }
  },

  atualizarPrioridade: async (id: string, updates: Partial<Omit<Prioridade, 'id' | 'data'>>) => {
    try {
      const supabase = createSupabaseClient()

      const dbUpdates: any = {}
      if (updates.texto !== undefined) dbUpdates.titulo = updates.texto
      if (updates.concluida !== undefined) dbUpdates.concluida = updates.concluida
      if (updates.categoria !== undefined) dbUpdates.categoria = updates.categoria
      if (updates.nivel_prioridade !== undefined) dbUpdates.nivel_prioridade = updates.nivel_prioridade
      if (updates.tipo !== undefined) dbUpdates.categoria = updates.tipo

      const { data, error } = await supabase
        .from('prioridades')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const prioridade = mapRowToPrioridade(data)
      set((state) => ({
        prioridades: state.prioridades.map((p) =>
          p.id === id ? prioridade : p
        ),
      }))
    } catch (error: any) {
      console.error('Erro ao atualizar prioridade:', error)
      set({ error: error.message || 'Erro ao atualizar prioridade' })
      throw error
    }
  },

  removerPrioridade: async (id: string) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('prioridades')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        prioridades: state.prioridades.filter((p) => p.id !== id),
      }))
    } catch (error: any) {
      console.error('Erro ao remover prioridade:', error)
      set({ error: error.message || 'Erro ao remover prioridade' })
      throw error
    }
  },

  marcarConcluida: async (id: string) => {
    try {
      const prioridade = get().prioridades.find((p) => p.id === id)
      if (!prioridade) return

      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('prioridades')
        .update({ concluida: !prioridade.concluida })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updated = mapRowToPrioridade(data)
      set((state) => ({
        prioridades: state.prioridades.map((p) =>
          p.id === id ? updated : p
        ),
      }))
    } catch (error: any) {
      console.error('Erro ao marcar prioridade como concluída:', error)
      set({ error: error.message || 'Erro ao marcar prioridade como concluída' })
      throw error
    }
  },

  getHistoricoPorData: (data) => {
    const dataFiltro = data || new Date().toISOString().split('T')[0]
    return get().prioridades.filter((p) => p.data === dataFiltro)
  },

  getDatasPrioridades: () => {
    // Retorna array de datas únicas (sem repetições)
    const datas = get().prioridades.map((p) => p.data)
    return Array.from(new Set(datas)).sort().reverse() // Mais recentes primeiro
  },

  setupRealtimeSync: (userId: string) => {
    return supabaseSync.subscribeToUserData<PrioridadeRow>(
      'prioridades',
      userId,
      (newRow) => {
        const prioridade = mapRowToPrioridade(newRow)
        set((state) => ({
          prioridades: [prioridade, ...state.prioridades],
        }))
      },
      (updatedRow) => {
        const prioridade = mapRowToPrioridade(updatedRow)
        set((state) => ({
          prioridades: state.prioridades.map((p) =>
            p.id === updatedRow.id ? prioridade : p
          ),
        }))
      },
      (deleted) => {
        set((state) => ({
          prioridades: state.prioridades.filter((p) => p.id !== deleted.id),
        }))
      }
    )
  },

  // Legacy method names for backward compatibility
  editarPrioridade: async (id: string, texto: string) => {
    return get().atualizarPrioridade(id, { texto })
  },

  toggleConcluida: async (id: string) => {
    return get().marcarConcluida(id)
  },
}))
