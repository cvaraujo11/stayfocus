import { create } from 'zustand'
import { supabase } from '@/app/lib/supabase/client'
import { uploadPhoto, deletePhoto } from '@/app/lib/supabase/storage'
import { supabaseSync } from '@/app/lib/supabase/sync'
import type { Database } from '@/app/types/database'

// Database types
type AlimentacaoRefeicaoRow = Database['public']['Tables']['alimentacao_refeicoes']['Row']
type AlimentacaoRefeicaoInsert = Database['public']['Tables']['alimentacao_refeicoes']['Insert']
type AlimentacaoRefeicaoUpdate = Database['public']['Tables']['alimentacao_refeicoes']['Update']

// Tipos temporários para novas tabelas (serão substituídos após executar migrations e regenerar types)
// TODO: Remover após executar migrations e regenerar app/types/database.ts
type SupabaseClient = typeof supabase

// Tipos
export type Refeicao = {
  id: string
  horario: string
  descricao: string
  dia_semana?: number | null
  ativo?: boolean
  created_at?: string
  updated_at?: string
}

export type RegistroRefeicao = {
  id: string
  data: string
  hora: string
  descricao: string
  foto_url: string | null
  created_at: string
}

export type HidratacaoDiaria = {
  id: string
  data: string
  copos_bebidos: number
  meta_diaria: number
  ultimo_registro: string | null
  created_at: string
  updated_at: string
}

type AlimentacaoState = {
  // Planejador de Refeições (persisted to Supabase)
  refeicoes: Refeicao[]
  loadingPlanejamento: boolean
  errorPlanejamento: string | null
  carregarPlanejamento: (userId: string) => Promise<void>
  adicionarRefeicao: (horario: string, descricao: string, diaSemana?: number | null) => Promise<void>
  atualizarRefeicao: (id: string, horario?: string, descricao?: string, diaSemana?: number | null, ativo?: boolean) => Promise<void>
  removerRefeicao: (id: string) => Promise<void>
  setupRealtimeSyncPlanejamento: (userId: string) => () => void
  
  // Registro de Refeições (persisted to Supabase)
  registros: RegistroRefeicao[]
  loading: boolean
  error: string | null
  carregarRefeicoes: (userId: string, dataInicio?: string, dataFim?: string) => Promise<void>
  adicionarRegistro: (descricao: string, hora: string, foto?: File | null, data?: string) => Promise<void>
  atualizarRegistro: (id: string, descricao?: string, hora?: string, foto?: File | null) => Promise<void>
  removerRegistro: (id: string) => Promise<void>
  setupRealtimeSync: (userId: string) => () => void
  
  // Hidratação (persisted to Supabase)
  hidratacaoHoje: HidratacaoDiaria | null
  loadingHidratacao: boolean
  errorHidratacao: string | null
  carregarHidratacaoHoje: (userId: string) => Promise<void>
  adicionarCopo: () => Promise<void>
  removerCopo: () => Promise<void>
  ajustarMeta: (valor: number) => Promise<void>
  resetHidratacao: () => void
  setupRealtimeSyncHidratacao: (userId: string) => () => void
  
  // Computed values para compatibilidade
  coposBebidos: number
  metaDiaria: number
  ultimoRegistro: string | null
}

export const useAlimentacaoStore = create<AlimentacaoState>((set, get) => ({
  // Planejador de Refeições - Supabase Integration
  refeicoes: [],
  loadingPlanejamento: false,
  errorPlanejamento: null,
  
  carregarPlanejamento: async (userId: string) => {
    set({ loadingPlanejamento: true, errorPlanejamento: null })
    try {
      // @ts-ignore - Tabela será criada após executar migration 003
      const { data, error } = await supabase
        .from('alimentacao_planejamento')
        .select('*')
        .eq('user_id', userId)
        .eq('ativo', true)
        .order('horario', { ascending: true })
      
      if (error) throw error
      
      set({ 
        refeicoes: data as Refeicao[], 
        loadingPlanejamento: false 
      })
    } catch (error) {
      console.error('Error loading planejamento:', error)
      set({ 
        errorPlanejamento: error instanceof Error ? error.message : 'Erro ao carregar planejamento',
        loadingPlanejamento: false 
      })
    }
  },
  
  adicionarRefeicao: async (horario: string, descricao: string, diaSemana?: number | null) => {
    set({ loadingPlanejamento: true, errorPlanejamento: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      const novaRefeicao = {
        user_id: user.id,
        horario,
        descricao,
        dia_semana: diaSemana,
        ativo: true,
      }
      
      const { data: inserted, error } = await supabase
        .from('alimentacao_planejamento')
        .insert(novaRefeicao)
        .select()
        .single()
      
      if (error) throw error
      
      set((state) => ({
        refeicoes: [...state.refeicoes, inserted as Refeicao],
        loadingPlanejamento: false,
      }))
    } catch (error) {
      console.error('Error adding refeicao:', error)
      set({ 
        errorPlanejamento: error instanceof Error ? error.message : 'Erro ao adicionar refeição',
        loadingPlanejamento: false 
      })
      throw error
    }
  },
  
  atualizarRefeicao: async (id: string, horario?: string, descricao?: string, diaSemana?: number | null, ativo?: boolean) => {
    set({ loadingPlanejamento: true, errorPlanejamento: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      const updates: any = {}
      if (horario !== undefined) updates.horario = horario
      if (descricao !== undefined) updates.descricao = descricao
      if (diaSemana !== undefined) updates.dia_semana = diaSemana
      if (ativo !== undefined) updates.ativo = ativo
      
      const { data: updated, error } = await supabase
        .from('alimentacao_planejamento')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      
      set((state) => ({
        refeicoes: state.refeicoes.map((refeicao) =>
          refeicao.id === id ? (updated as Refeicao) : refeicao
        ),
        loadingPlanejamento: false,
      }))
    } catch (error) {
      console.error('Error updating refeicao:', error)
      set({ 
        errorPlanejamento: error instanceof Error ? error.message : 'Erro ao atualizar refeição',
        loadingPlanejamento: false 
      })
      throw error
    }
  },
  
  removerRefeicao: async (id: string) => {
    set({ loadingPlanejamento: true, errorPlanejamento: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      const { error } = await supabase
        .from('alimentacao_planejamento')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      set((state) => ({
        refeicoes: state.refeicoes.filter((refeicao) => refeicao.id !== id),
        loadingPlanejamento: false,
      }))
    } catch (error) {
      console.error('Error removing refeicao:', error)
      set({ 
        errorPlanejamento: error instanceof Error ? error.message : 'Erro ao remover refeição',
        loadingPlanejamento: false 
      })
      throw error
    }
  },
  
  setupRealtimeSyncPlanejamento: (userId: string) => {
    return supabaseSync.subscribeToUserData<any>(
      'alimentacao_planejamento',
      userId,
      (newRefeicao) => {
        set((state) => ({
          refeicoes: [...state.refeicoes, newRefeicao as Refeicao],
        }))
      },
      (updatedRefeicao) => {
        set((state) => ({
          refeicoes: state.refeicoes.map((refeicao) =>
            refeicao.id === updatedRefeicao.id ? (updatedRefeicao as Refeicao) : refeicao
          ),
        }))
      },
      (deleted) => {
        set((state) => ({
          refeicoes: state.refeicoes.filter((refeicao) => refeicao.id !== deleted.id),
        }))
      }
    )
  },
  
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
  
  // Hidratação - Supabase Integration
  hidratacaoHoje: null,
  loadingHidratacao: false,
  errorHidratacao: null,
  
  carregarHidratacaoHoje: async (userId: string) => {
    set({ loadingHidratacao: true, errorHidratacao: null })
    try {
      const hoje = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('alimentacao_hidratacao')
        .select('*')
        .eq('user_id', userId)
        .eq('data', hoje)
        .maybeSingle()
      
      if (error && error.code !== 'PGRST116') throw error
      
      // Se não existe registro para hoje, criar um novo
      if (!data) {
        const novoRegistro = {
          user_id: userId,
          data: hoje,
          copos_bebidos: 0,
          meta_diaria: 8,
          ultimo_registro: null,
        }
        
        const { data: created, error: createError } = await supabase
          .from('alimentacao_hidratacao')
          .insert(novoRegistro)
          .select()
          .single()
        
        if (createError) throw createError
        if (!created) throw new Error('Erro ao criar registro de hidratação')
        
        set({ 
          hidratacaoHoje: created,
          loadingHidratacao: false 
        })
      } else {
        set({ 
          hidratacaoHoje: data,
          loadingHidratacao: false 
        })
      }
    } catch (error) {
      console.error('Error loading hidratacao:', error)
      set({ 
        errorHidratacao: error instanceof Error ? error.message : 'Erro ao carregar hidratação',
        loadingHidratacao: false 
      })
    }
  },
  
  adicionarCopo: async () => {
    const state = get()
    if (!state.hidratacaoHoje) return
    if (state.coposBebidos >= state.metaDiaria) return
    
    set({ loadingHidratacao: true, errorHidratacao: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      const novoCopos = state.coposBebidos + 1
      const agora = new Date().toISOString()
      
      const { data: updated, error } = await supabase
        .from('alimentacao_hidratacao')
        .update({
          copos_bebidos: novoCopos,
          ultimo_registro: agora,
        })
        .eq('id', state.hidratacaoHoje.id)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      if (!updated) throw new Error('Erro ao atualizar hidratação')
      
      set({ 
        hidratacaoHoje: updated,
        loadingHidratacao: false 
      })
    } catch (error) {
      console.error('Error adding copo:', error)
      set({ 
        errorHidratacao: error instanceof Error ? error.message : 'Erro ao adicionar copo',
        loadingHidratacao: false 
      })
      throw error
    }
  },
  
  removerCopo: async () => {
    const state = get()
    if (!state.hidratacaoHoje) return
    if (state.coposBebidos <= 0) return
    
    set({ loadingHidratacao: true, errorHidratacao: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      const novoCopos = Math.max(0, state.coposBebidos - 1)
      
      const { data: updated, error } = await supabase
        .from('alimentacao_hidratacao')
        .update({
          copos_bebidos: novoCopos,
        })
        .eq('id', state.hidratacaoHoje.id)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      if (!updated) throw new Error('Erro ao atualizar hidratação')
      
      set({ 
        hidratacaoHoje: updated,
        loadingHidratacao: false 
      })
    } catch (error) {
      console.error('Error removing copo:', error)
      set({ 
        errorHidratacao: error instanceof Error ? error.message : 'Erro ao remover copo',
        loadingHidratacao: false 
      })
      throw error
    }
  },
  
  ajustarMeta: async (valor: number) => {
    const state = get()
    if (!state.hidratacaoHoje) return
    
    const novaMeta = state.metaDiaria + valor
    if (novaMeta < 1 || novaMeta > 20) return
    
    set({ loadingHidratacao: true, errorHidratacao: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      const { data: updated, error } = await supabase
        .from('alimentacao_hidratacao')
        .update({
          meta_diaria: novaMeta,
        })
        .eq('id', state.hidratacaoHoje.id)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      if (!updated) throw new Error('Erro ao atualizar meta diária')
      
      set({ 
        hidratacaoHoje: updated,
        loadingHidratacao: false 
      })
    } catch (error) {
      console.error('Error adjusting meta:', error)
      set({ 
        errorHidratacao: error instanceof Error ? error.message : 'Erro ao ajustar meta',
        loadingHidratacao: false 
      })
      throw error
    }
  },
  
  resetHidratacao: () => {
    set({
      hidratacaoHoje: null,
    })
  },
  
  setupRealtimeSyncHidratacao: (userId: string) => {
    return supabaseSync.subscribeToUserData<any>(
      'alimentacao_hidratacao',
      userId,
      (newHidratacao) => {
        const hoje = new Date().toISOString().split('T')[0]
        if (newHidratacao.data === hoje) {
          set({ hidratacaoHoje: newHidratacao as HidratacaoDiaria })
        }
      },
      (updatedHidratacao) => {
        const state = get()
        if (state.hidratacaoHoje?.id === updatedHidratacao.id) {
          set({ hidratacaoHoje: updatedHidratacao as HidratacaoDiaria })
        }
      },
      (deleted) => {
        const state = get()
        if (state.hidratacaoHoje?.id === deleted.id) {
          set({ hidratacaoHoje: null })
        }
      }
    )
  },
  
  // Computed values para compatibilidade com componentes existentes
  get coposBebidos() {
    return get().hidratacaoHoje?.copos_bebidos ?? 0
  },
  
  get metaDiaria() {
    return get().hidratacaoHoje?.meta_diaria ?? 8
  },
  
  get ultimoRegistro() {
    const ultimo = get().hidratacaoHoje?.ultimo_registro
    if (!ultimo) return null
    return new Date(ultimo).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  },
}))
