import { create } from 'zustand'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { supabaseSync } from '@/app/lib/supabase/sync'
import type { Database } from '@/app/types/database'

export type PreferenciasVisuais = {
  altoContraste: boolean
  reducaoEstimulos: boolean
  textoGrande: boolean
}

export type MetasDiarias = {
  horasSono: number         // Horas ideais de sono
  tarefasPrioritarias: number // Número de tarefas prioritárias
  coposAgua: number         // Copos de água por dia
  pausasProgramadas: number // Número de pausas programadas
}

export type PerfilState = {
  nome: string
  preferenciasVisuais: PreferenciasVisuais
  metasDiarias: MetasDiarias
  notificacoesAtivas: boolean
  pausasAtivas: boolean
  loading: boolean
  error: string | null
  // Ações
  carregarPerfil: (userId: string) => Promise<void>
  atualizarNome: (nome: string) => Promise<void>
  atualizarPreferenciasVisuais: (preferencias: Partial<PreferenciasVisuais>) => Promise<void>
  atualizarMetasDiarias: (metas: Partial<MetasDiarias>) => Promise<void>
  alternarNotificacoes: () => Promise<void>
  alternarPausas: () => Promise<void>
  setupRealtimeSync: (userId: string) => () => void
  resetarPerfil: () => void
}

const defaultState = {
  nome: 'Usuário',
  preferenciasVisuais: {
    altoContraste: false,
    reducaoEstimulos: false,
    textoGrande: false
  },
  metasDiarias: {
    horasSono: 8,
    tarefasPrioritarias: 3,
    coposAgua: 8,
    pausasProgramadas: 4
  },
  notificacoesAtivas: true,
  pausasAtivas: true,
  loading: false,
  error: null
}

export const usePerfilStore = create<PerfilState>()((set, get) => ({
  ...defaultState,
  
  carregarPerfil: async (userId: string) => {
    set({ loading: true, error: null })
    const supabase = createSupabaseClient()
    
    try {
      // Fetch users_profile
      const { data: profileData, error: profileError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }
      
      // Fetch preferencias_visuais
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('preferencias_visuais')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw preferencesError
      }
      
      // Fetch metas_diarias
      const { data: metasData, error: metasError } = await supabase
        .from('metas_diarias')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (metasError && metasError.code !== 'PGRST116') {
        throw metasError
      }
      
      // Update state with fetched data or defaults
      set({
        nome: profileData?.nome || defaultState.nome,
        notificacoesAtivas: profileData?.notificacoes_ativas ?? defaultState.notificacoesAtivas,
        pausasAtivas: profileData?.pausas_ativas ?? defaultState.pausasAtivas,
        preferenciasVisuais: {
          altoContraste: preferencesData?.alto_contraste ?? defaultState.preferenciasVisuais.altoContraste,
          reducaoEstimulos: preferencesData?.reducao_estimulos ?? defaultState.preferenciasVisuais.reducaoEstimulos,
          textoGrande: preferencesData?.texto_grande ?? defaultState.preferenciasVisuais.textoGrande
        },
        metasDiarias: {
          horasSono: metasData?.horas_sono ?? defaultState.metasDiarias.horasSono,
          tarefasPrioritarias: metasData?.tarefas_prioritarias ?? defaultState.metasDiarias.tarefasPrioritarias,
          coposAgua: metasData?.copos_agua ?? defaultState.metasDiarias.coposAgua,
          pausasProgramadas: metasData?.pausas_programadas ?? defaultState.metasDiarias.pausasProgramadas
        },
        loading: false
      })
    } catch (error: any) {
      console.error('Error loading profile:', error)
      set({ 
        error: 'Erro ao carregar perfil. Tente novamente.', 
        loading: false 
      })
    }
  },
  
  atualizarNome: async (nome: string) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }
    
    try {
      const { error } = await supabase
        .from('users_profile')
        .upsert({
          user_id: user.id,
          nome
        }, {
          onConflict: 'user_id'
        })
      
      if (error) throw error
      
      set({ nome, error: null })
    } catch (error: any) {
      console.error('Error updating name:', error)
      set({ error: 'Erro ao atualizar nome. Tente novamente.' })
    }
  },
  
  atualizarPreferenciasVisuais: async (preferencias: Partial<PreferenciasVisuais>) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }
    
    const state = get()
    const novasPreferencias = {
      ...state.preferenciasVisuais,
      ...preferencias
    }
    
    try {
      const { error } = await supabase
        .from('preferencias_visuais')
        .upsert({
          user_id: user.id,
          alto_contraste: novasPreferencias.altoContraste,
          reducao_estimulos: novasPreferencias.reducaoEstimulos,
          texto_grande: novasPreferencias.textoGrande
        }, {
          onConflict: 'user_id'
        })
      
      if (error) throw error
      
      set({ preferenciasVisuais: novasPreferencias, error: null })
    } catch (error: any) {
      console.error('Error updating visual preferences:', error)
      set({ error: 'Erro ao atualizar preferências. Tente novamente.' })
    }
  },
  
  atualizarMetasDiarias: async (metas: Partial<MetasDiarias>) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }
    
    const state = get()
    const novasMetas = {
      ...state.metasDiarias,
      ...metas
    }
    
    try {
      const { error } = await supabase
        .from('metas_diarias')
        .upsert({
          user_id: user.id,
          horas_sono: novasMetas.horasSono,
          tarefas_prioritarias: novasMetas.tarefasPrioritarias,
          copos_agua: novasMetas.coposAgua,
          pausas_programadas: novasMetas.pausasProgramadas
        }, {
          onConflict: 'user_id'
        })
      
      if (error) throw error
      
      set({ metasDiarias: novasMetas, error: null })
    } catch (error: any) {
      console.error('Error updating daily goals:', error)
      set({ error: 'Erro ao atualizar metas. Tente novamente.' })
    }
  },
  
  alternarNotificacoes: async () => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }
    
    const state = get()
    const novoValor = !state.notificacoesAtivas
    
    try {
      const { error } = await supabase
        .from('users_profile')
        .upsert({
          user_id: user.id,
          notificacoes_ativas: novoValor,
          nome: state.nome
        }, {
          onConflict: 'user_id'
        })
      
      if (error) throw error
      
      set({ notificacoesAtivas: novoValor, error: null })
    } catch (error: any) {
      console.error('Error toggling notifications:', error)
      set({ error: 'Erro ao atualizar notificações. Tente novamente.' })
    }
  },
  
  alternarPausas: async () => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }
    
    const state = get()
    const novoValor = !state.pausasAtivas
    
    try {
      const { error } = await supabase
        .from('users_profile')
        .upsert({
          user_id: user.id,
          pausas_ativas: novoValor,
          nome: state.nome
        }, {
          onConflict: 'user_id'
        })
      
      if (error) throw error
      
      set({ pausasAtivas: novoValor, error: null })
    } catch (error: any) {
      console.error('Error toggling breaks:', error)
      set({ error: 'Erro ao atualizar pausas. Tente novamente.' })
    }
  },
  
  setupRealtimeSync: (userId: string) => {
    type UsersProfile = Database['public']['Tables']['users_profile']['Row']
    type PreferenciasVisuaisRow = Database['public']['Tables']['preferencias_visuais']['Row']
    type MetasDiariasRow = Database['public']['Tables']['metas_diarias']['Row']
    
    // Subscribe to users_profile changes
    const cleanupProfile = supabaseSync.subscribeToUserData<UsersProfile>(
      'users_profile',
      userId,
      undefined, // No insert handler needed (profile created on signup)
      (updated) => {
        set({
          nome: updated.nome,
          notificacoesAtivas: updated.notificacoes_ativas,
          pausasAtivas: updated.pausas_ativas
        })
      }
    )
    
    // Subscribe to preferencias_visuais changes
    const cleanupPreferences = supabaseSync.subscribeToUserData<PreferenciasVisuaisRow>(
      'preferencias_visuais',
      userId,
      undefined, // No insert handler needed
      (updated) => {
        set({
          preferenciasVisuais: {
            altoContraste: updated.alto_contraste,
            reducaoEstimulos: updated.reducao_estimulos,
            textoGrande: updated.texto_grande
          }
        })
      }
    )
    
    // Subscribe to metas_diarias changes
    const cleanupMetas = supabaseSync.subscribeToUserData<MetasDiariasRow>(
      'metas_diarias',
      userId,
      undefined, // No insert handler needed
      (updated) => {
        set({
          metasDiarias: {
            horasSono: updated.horas_sono,
            tarefasPrioritarias: updated.tarefas_prioritarias,
            coposAgua: updated.copos_agua,
            pausasProgramadas: updated.pausas_programadas
          }
        })
      }
    )
    
    // Return cleanup function that unsubscribes from all channels
    return () => {
      cleanupProfile()
      cleanupPreferences()
      cleanupMetas()
    }
  },
  
  resetarPerfil: () => set(defaultState)
}))
