import { create } from 'zustand'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { supabaseSync } from '@/app/lib/supabase/sync'
import type { Database } from '@/app/types/database'

type AtividadeRow = Database['public']['Tables']['atividades']['Row']

export type Atividade = {
  id: string
  nome: string
  categoria: 'lazer' | 'saude' | 'social'
  duracao: number // em minutos
  observacoes: string
  data: string
  concluida?: boolean // Legacy field for backward compatibility
}

interface AtividadesState {
  atividades: Atividade[]
  loading: boolean
  error: string | null

  // Data operations
  carregarAtividades: (userId: string, categoria?: 'lazer' | 'saude' | 'social') => Promise<void>
  adicionarAtividade: (atividade: Omit<Atividade, 'id'>) => Promise<void>
  atualizarAtividade: (id: string, updates: Partial<Omit<Atividade, 'id'>>) => Promise<void>
  removerAtividade: (id: string) => Promise<void>

  // Legacy methods for backward compatibility
  marcarConcluida: (id: string) => Promise<void>

  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void
}

const mapRowToAtividade = (row: AtividadeRow): Atividade => ({
  id: row.id,
  nome: row.titulo,
  categoria: row.categoria as 'saude' | 'lazer' | 'social',
  duracao: row.duracao_minutos || 0,
  observacoes: row.observacoes || '',
  data: row.data,
  concluida: false, // Legacy field - not stored in database
})

export const useAtividadesStore = create<AtividadesState>((set, get) => ({
  atividades: [],
  loading: false,
  error: null,

  carregarAtividades: async (userId: string, categoria?: 'lazer' | 'saude' | 'social') => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      let query = supabase
        .from('atividades')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .order('created_at', { ascending: false })

      // Apply category filter if provided
      if (categoria) {
        query = query.eq('categoria', categoria)
      }

      const { data, error } = await query

      if (error) throw error

      const atividades = data.map(mapRowToAtividade)
      set({ atividades, loading: false })
    } catch (error: any) {
      console.error('Erro ao carregar atividades:', error)
      set({ error: error.message || 'Erro ao carregar atividades', loading: false })
    }
  },

  adicionarAtividade: async (novaAtividade) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('atividades')
        .insert({
          user_id: user.id,
          titulo: novaAtividade.nome,
          categoria: novaAtividade.categoria,
          duracao_minutos: novaAtividade.duracao,
          observacoes: novaAtividade.observacoes || null,
          data: novaAtividade.data,
        })
        .select()
        .single()

      if (error) throw error

      const atividade = mapRowToAtividade(data)
      set((state) => ({
        atividades: [atividade, ...state.atividades],
      }))
    } catch (error: any) {
      console.error('Erro ao adicionar atividade:', error)
      set({ error: error.message || 'Erro ao adicionar atividade' })
      throw error
    }
  },

  atualizarAtividade: async (id: string, updates: Partial<Omit<Atividade, 'id'>>) => {
    try {
      const supabase = createSupabaseClient()

      const dbUpdates: any = {}
      if (updates.nome !== undefined) dbUpdates.titulo = updates.nome
      if (updates.categoria !== undefined) dbUpdates.categoria = updates.categoria
      if (updates.duracao !== undefined) dbUpdates.duracao_minutos = updates.duracao
      if (updates.observacoes !== undefined) dbUpdates.observacoes = updates.observacoes || null
      if (updates.data !== undefined) dbUpdates.data = updates.data

      const { data, error } = await supabase
        .from('atividades')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const atividade = mapRowToAtividade(data)
      set((state) => ({
        atividades: state.atividades.map((a) =>
          a.id === id ? atividade : a
        ),
      }))
    } catch (error: any) {
      console.error('Erro ao atualizar atividade:', error)
      set({ error: error.message || 'Erro ao atualizar atividade' })
      throw error
    }
  },

  removerAtividade: async (id: string) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('atividades')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        atividades: state.atividades.filter((a) => a.id !== id),
      }))
    } catch (error: any) {
      console.error('Erro ao remover atividade:', error)
      set({ error: error.message || 'Erro ao remover atividade' })
      throw error
    }
  },

  // Legacy method - kept for backward compatibility
  // Note: The database doesn't have a 'concluida' field, so this is a no-op
  marcarConcluida: async (id: string) => {
    console.warn('marcarConcluida is deprecated - atividades table does not have a concluida field')
    // Update the local state for backward compatibility
    set((state) => ({
      atividades: state.atividades.map((a) =>
        a.id === id ? { ...a, concluida: true } : a
      ),
    }))
  },

  setupRealtimeSync: (userId: string) => {
    return supabaseSync.subscribeToUserData<AtividadeRow>(
      'atividades',
      userId,
      (newRow) => {
        const atividade = mapRowToAtividade(newRow)
        set((state) => ({
          atividades: [atividade, ...state.atividades],
        }))
      },
      (updatedRow) => {
        const atividade = mapRowToAtividade(updatedRow)
        set((state) => ({
          atividades: state.atividades.map((a) =>
            a.id === updatedRow.id ? atividade : a
          ),
        }))
      },
      (deleted) => {
        set((state) => ({
          atividades: state.atividades.filter((a) => a.id !== deleted.id),
        }))
      }
    )
  },
}))
