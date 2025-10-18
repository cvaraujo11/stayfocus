import { create } from 'zustand'
import { supabase } from '@/app/lib/supabase/client'
import { uploadPhoto, deletePhoto } from '@/app/lib/supabase/storage'
import { supabaseSync } from '@/app/lib/supabase/sync'
import type { Database } from '@/app/types/database'

// Database types
type AlimentacaoRefeicaoRow = Database['public']['Tables']['alimentacao_refeicoes']['Row']
type AlimentacaoRefeicaoInsert = Database['public']['Tables']['alimentacao_refeicoes']['Insert']
type AlimentacaoRefeicaoUpdate = Database['public']['Tables']['alimentacao_refeicoes']['Update']

// Tipos
export type Refeicao = {
  id: string
  horario: string
  descricao: string
}

export type RegistroRefeicao = {
  id: string
  data: string
  hora: string
  descricao: string
  foto_url: string | null
  created_at: string
}

type AlimentacaoState = {
  // Planejador de Refeições (client-side only, not persisted to DB)
  refeicoes: Refeicao[]
  adicionarRefeicao: (horario: string, descricao: string) => void
  atualizarRefeicao: (id: string, horario: string, descricao: string) => void
  removerRefeicao: (id: string) => void
  
  // Registro de Refeições (persisted to Supabase)
  registros: RegistroRefeicao[]
  loading: boolean
  error: string | null
  carregarRefeicoes: (userId: string, dataInicio?: string, dataFim?: string) => Promise<void>
  adicionarRegistro: (descricao: string, hora: string, foto?: File | null, data?: string) => Promise<void>
  atualizarRegistro: (id: string, descricao?: string, hora?: string, foto?: File | null) => Promise<void>
  removerRegistro: (id: string) => Promise<void>
  setupRealtimeSync: (userId: string) => () => void
  
  // Hidratação (client-side only, not persisted to DB)
  coposBebidos: number
  metaDiaria: number
  ultimoRegistro: string | null
  adicionarCopo: () => void
  removerCopo: () => void
  ajustarMeta: (valor: number) => void
  resetHidratacao: () => void
}

export const useAlimentacaoStore = create<AlimentacaoState>((set, get) => ({
  // Planejador de Refeições - Estado Inicial (client-side only)
  refeicoes: [
    { id: '1', horario: '07:30', descricao: 'Café da manhã' },
    { id: '2', horario: '12:00', descricao: 'Almoço' },
    { id: '3', horario: '16:00', descricao: 'Lanche da tarde' },
    { id: '4', horario: '19:30', descricao: 'Jantar' },
  ],
  
  adicionarRefeicao: (horario, descricao) => 
    set((state) => ({
      refeicoes: [
        ...state.refeicoes,
        {
          id: Date.now().toString(),
          horario,
          descricao,
        },
      ],
    })),
  
  atualizarRefeicao: (id, horario, descricao) =>
    set((state) => ({
      refeicoes: state.refeicoes.map((refeicao) =>
        refeicao.id === id ? { ...refeicao, horario, descricao } : refeicao
      ),
    })),
  
  removerRefeicao: (id) =>
    set((state) => ({
      refeicoes: state.refeicoes.filter((refeicao) => refeicao.id !== id),
    })),
  
  // Registro de Refeições - Supabase Integration
  registros: [],
  loading: false,
  error: null,
  
  carregarRefeicoes: async (userId: string, dataInicio?: string, dataFim?: string) => {
    set({ loading: true, error: null })
    try {
      let query = supabase
        .from('alimentacao_refeicoes')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .order('hora', { ascending: false })
      
      // Apply date filters if provided
      if (dataInicio) {
        query = query.gte('data', dataInicio)
      }
      if (dataFim) {
        query = query.lte('data', dataFim)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      set({ 
        registros: data as RegistroRefeicao[], 
        loading: false 
      })
    } catch (error) {
      console.error('Error loading refeicoes:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar refeições',
        loading: false 
      })
    }
  },
  
  adicionarRegistro: async (descricao: string, hora: string, foto?: File | null, data?: string) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      // Upload photo if provided
      let foto_url: string | null = null
      if (foto) {
        try {
          foto_url = await uploadPhoto(user.id, foto)
          if (!foto_url) {
            throw new Error('Erro ao fazer upload da foto')
          }
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError)
          throw new Error(uploadError instanceof Error ? uploadError.message : 'Erro ao fazer upload da foto')
        }
      }
      
      // Use provided date or today's date
      const dataRefeicao = data || new Date().toISOString().split('T')[0]
      
      const novoRegistro: AlimentacaoRefeicaoInsert = {
        user_id: user.id,
        data: dataRefeicao,
        hora,
        descricao,
        foto_url,
      }
      
      const { data: inserted, error } = await supabase
        .from('alimentacao_refeicoes')
        .insert(novoRegistro)
        .select()
        .single()
      
      if (error) throw error
      
      // Add to local state
      set((state) => ({
        registros: [inserted as RegistroRefeicao, ...state.registros],
        loading: false,
      }))
    } catch (error) {
      console.error('Error adding registro:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao adicionar registro',
        loading: false 
      })
      throw error
    }
  },
  
  atualizarRegistro: async (id: string, descricao?: string, hora?: string, foto?: File | null) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      // Get current registro to check for existing photo
      const currentRegistro = get().registros.find(r => r.id === id)
      
      // Handle photo update
      let foto_url: string | null | undefined = undefined
      if (foto !== undefined) {
        if (foto === null) {
          // Delete existing photo if removing
          if (currentRegistro?.foto_url) {
            await deletePhoto(currentRegistro.foto_url)
          }
          foto_url = null
        } else {
          // Upload new photo
          try {
            // Delete old photo first
            if (currentRegistro?.foto_url) {
              await deletePhoto(currentRegistro.foto_url)
            }
            
            foto_url = await uploadPhoto(user.id, foto)
            if (!foto_url) {
              throw new Error('Erro ao fazer upload da foto')
            }
          } catch (uploadError) {
            console.error('Photo upload error:', uploadError)
            throw new Error(uploadError instanceof Error ? uploadError.message : 'Erro ao fazer upload da foto')
          }
        }
      }
      
      const updates: AlimentacaoRefeicaoUpdate = {}
      if (descricao !== undefined) updates.descricao = descricao
      if (hora !== undefined) updates.hora = hora
      if (foto_url !== undefined) updates.foto_url = foto_url
      
      const { data: updated, error } = await supabase
        .from('alimentacao_refeicoes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      
      // Update local state
      set((state) => ({
        registros: state.registros.map((registro) =>
          registro.id === id ? (updated as RegistroRefeicao) : registro
        ),
        loading: false,
      }))
    } catch (error) {
      console.error('Error updating registro:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar registro',
        loading: false 
      })
      throw error
    }
  },
  
  removerRegistro: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      // Get registro to delete photo
      const registro = get().registros.find(r => r.id === id)
      
      // Delete from database
      const { error } = await supabase
        .from('alimentacao_refeicoes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      // Delete photo if exists
      if (registro?.foto_url) {
        await deletePhoto(registro.foto_url)
      }
      
      // Remove from local state
      set((state) => ({
        registros: state.registros.filter((registro) => registro.id !== id),
        loading: false,
      }))
    } catch (error) {
      console.error('Error removing registro:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao remover registro',
        loading: false 
      })
      throw error
    }
  },
  
  setupRealtimeSync: (userId: string) => {
    return supabaseSync.subscribeToUserData<AlimentacaoRefeicaoRow>(
      'alimentacao_refeicoes',
      userId,
      (newRefeicao) => {
        set((state) => ({
          registros: [newRefeicao as RegistroRefeicao, ...state.registros],
        }))
      },
      (updatedRefeicao) => {
        set((state) => ({
          registros: state.registros.map((registro) =>
            registro.id === updatedRefeicao.id ? (updatedRefeicao as RegistroRefeicao) : registro
          ),
        }))
      },
      (deleted) => {
        set((state) => ({
          registros: state.registros.filter((registro) => registro.id !== deleted.id),
        }))
      }
    )
  },
  
  // Hidratação - Estado Inicial (client-side only)
  coposBebidos: 0,
  metaDiaria: 8,
  ultimoRegistro: null,
  
  adicionarCopo: () =>
    set((state) => {
      if (state.coposBebidos < state.metaDiaria) {
        return {
          coposBebidos: state.coposBebidos + 1,
          ultimoRegistro: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      }
      return state
    }),
  
  removerCopo: () =>
    set((state) => ({
      coposBebidos: Math.max(0, state.coposBebidos - 1),
    })),
  
  ajustarMeta: (valor) =>
    set((state) => {
      const novaMeta = state.metaDiaria + valor
      if (novaMeta >= 1 && novaMeta <= 15) {
        return { metaDiaria: novaMeta }
      }
      return state
    }),
  
  resetHidratacao: () =>
    set({
      coposBebidos: 0,
      ultimoRegistro: null,
    }),
}))
