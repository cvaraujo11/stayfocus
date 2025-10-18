import { create } from 'zustand'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { supabaseSync } from '@/app/lib/supabase/sync'
import type { Database } from '@/app/types/database'

type BlocoTempoRow = Database['public']['Tables']['blocos_tempo']['Row']

export type BlocoTempo = {
  id: string
  hora: string
  atividade: string
  categoria: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer' | 'nenhuma'
  data: string
}

const mapRowToBloco = (row: BlocoTempoRow): BlocoTempo => ({
  id: row.id,
  hora: row.hora,
  atividade: row.atividade,
  categoria: row.categoria as BlocoTempo['categoria'],
  data: row.data,
})

// Dashboard summary data aggregated from multiple tables
export type DadosDia = {
  prioridades: {
    total: number
    concluidas: number
    pendentes: number
  }
  sono: {
    qualidade: number | null
    horas: number | null
  }
  pomodoro: {
    sessoesFoco: number
    minutosFoco: number
  }
  alimentacao: {
    refeicoes: number
  }
  estudos: {
    minutos: number
    disciplinas: string[]
  }
}

interface PainelDiaState {
  blocos: BlocoTempo[]
  dadosDia: DadosDia | null
  loading: boolean
  error: string | null

  // Data operations
  carregarDadosDia: (userId: string) => Promise<void>
  carregarBlocos: (userId: string, data?: string) => Promise<void>

  // Bloco operations
  editarAtividade: (id: string, atividade: string) => Promise<void>
  editarCategoria: (id: string, categoria: BlocoTempo['categoria']) => Promise<void>
  adicionarBloco: (bloco: Omit<BlocoTempo, 'id' | 'data'>) => Promise<void>
  removerBloco: (id: string) => Promise<void>

  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void
}

export const usePainelDiaStore = create<PainelDiaState>((set, get) => ({
  blocos: [],
  dadosDia: null,
  loading: false,
  error: null,

  carregarDadosDia: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      const hoje = new Date().toISOString().split('T')[0]
      const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Query prioridades for today
      const { data: prioridades, error: prioridadesError } = await supabase
        .from('prioridades')
        .select('id, concluida')
        .eq('user_id', userId)
        .eq('data', hoje)

      if (prioridadesError) throw prioridadesError

      // Query sono_registros for last night
      const { data: sono, error: sonoError } = await supabase
        .from('sono_registros')
        .select('qualidade, hora_dormir, hora_acordar')
        .eq('user_id', userId)
        .eq('data', ontem)
        .maybeSingle()

      // Don't throw error if no sleep record found
      const sonoData = sonoError ? null : sono

      // Query pomodoro_sessoes for today
      const { data: pomodoro, error: pomodoroError } = await supabase
        .from('pomodoro_sessoes')
        .select('tipo, duracao_minutos')
        .eq('user_id', userId)
        .gte('data', `${hoje}T00:00:00`)
        .lte('data', `${hoje}T23:59:59`)

      if (pomodoroError) throw pomodoroError

      // Query alimentacao_refeicoes for today
      const { data: alimentacao, error: alimentacaoError } = await supabase
        .from('alimentacao_refeicoes')
        .select('id')
        .eq('user_id', userId)
        .eq('data', hoje)

      if (alimentacaoError) throw alimentacaoError

      // Query estudos_registros for today
      const { data: estudos, error: estudosError } = await supabase
        .from('estudos_registros')
        .select('duracao_minutos, disciplina')
        .eq('user_id', userId)
        .eq('data', hoje)

      if (estudosError) throw estudosError

      // Calculate sleep hours
      let horasSono = null
      if (sonoData?.hora_dormir && sonoData?.hora_acordar) {
        const [dormirH, dormirM] = sonoData.hora_dormir.split(':').map(Number)
        const [acordarH, acordarM] = sonoData.hora_acordar.split(':').map(Number)

        let minutosDormir = dormirH * 60 + dormirM
        let minutosAcordar = acordarH * 60 + acordarM

        // If acordar time is less than dormir time, it means it's the next day
        if (minutosAcordar < minutosDormir) {
          minutosAcordar += 24 * 60
        }

        horasSono = (minutosAcordar - minutosDormir) / 60
      }

      // Aggregate data
      const dadosDia: DadosDia = {
        prioridades: {
          total: prioridades?.length || 0,
          concluidas: prioridades?.filter(p => p.concluida).length || 0,
          pendentes: prioridades?.filter(p => !p.concluida).length || 0,
        },
        sono: {
          qualidade: sonoData?.qualidade || null,
          horas: horasSono,
        },
        pomodoro: {
          sessoesFoco: pomodoro?.filter(p => p.tipo === 'foco').length || 0,
          minutosFoco: pomodoro?.filter(p => p.tipo === 'foco').reduce((acc, p) => acc + p.duracao_minutos, 0) || 0,
        },
        alimentacao: {
          refeicoes: alimentacao?.length || 0,
        },
        estudos: {
          minutos: estudos?.reduce((acc, e) => acc + e.duracao_minutos, 0) || 0,
          disciplinas: Array.from(new Set(estudos?.map(e => e.disciplina) || [])),
        },
      }

      set({ dadosDia, loading: false })
    } catch (error: any) {
      console.error('Erro ao carregar dados do dia:', error)
      set({ error: error.message || 'Erro ao carregar dados do dia', loading: false })
    }
  },

  carregarBlocos: async (userId: string, data?: string) => {
    try {
      const supabase = createSupabaseClient()
      const dataFiltro = data || new Date().toISOString().split('T')[0]

      const { data: blocos, error } = await supabase
        .from('blocos_tempo')
        .select('*')
        .eq('user_id', userId)
        .eq('data', dataFiltro)
        .order('hora', { ascending: true })

      if (error) throw error

      set({ blocos: blocos.map(mapRowToBloco) })
    } catch (error: any) {
      console.error('Erro ao carregar blocos:', error)
      set({ error: error.message || 'Erro ao carregar blocos' })
    }
  },

  editarAtividade: async (id: string, atividade: string) => {
    try {
      const supabase = createSupabaseClient()

      const { data, error } = await supabase
        .from('blocos_tempo')
        .update({ atividade })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const bloco = mapRowToBloco(data)
      set((state) => ({
        blocos: state.blocos.map(b => b.id === id ? bloco : b)
      }))
    } catch (error: any) {
      console.error('Erro ao editar atividade:', error)
      set({ error: error.message || 'Erro ao editar atividade' })
      throw error
    }
  },

  editarCategoria: async (id: string, categoria: BlocoTempo['categoria']) => {
    try {
      const supabase = createSupabaseClient()

      const { data, error } = await supabase
        .from('blocos_tempo')
        .update({ categoria })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const bloco = mapRowToBloco(data)
      set((state) => ({
        blocos: state.blocos.map(b => b.id === id ? bloco : b)
      }))
    } catch (error: any) {
      console.error('Erro ao editar categoria:', error)
      set({ error: error.message || 'Erro ao editar categoria' })
      throw error
    }
  },

  adicionarBloco: async (novoBloco: Omit<BlocoTempo, 'id' | 'data'>) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const hoje = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('blocos_tempo')
        .insert({
          user_id: user.id,
          hora: novoBloco.hora,
          atividade: novoBloco.atividade,
          categoria: novoBloco.categoria,
          data: hoje,
        })
        .select()
        .single()

      if (error) throw error

      const bloco = mapRowToBloco(data)
      set((state) => ({
        blocos: [...state.blocos, bloco].sort((a, b) => a.hora.localeCompare(b.hora))
      }))
    } catch (error: any) {
      console.error('Erro ao adicionar bloco:', error)
      set({ error: error.message || 'Erro ao adicionar bloco' })
      throw error
    }
  },

  removerBloco: async (id: string) => {
    try {
      const supabase = createSupabaseClient()

      const { error } = await supabase
        .from('blocos_tempo')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        blocos: state.blocos.filter(b => b.id !== id)
      }))
    } catch (error: any) {
      console.error('Erro ao remover bloco:', error)
      set({ error: error.message || 'Erro ao remover bloco' })
      throw error
    }
  },

  setupRealtimeSync: (userId: string) => {
    // Subscribe to blocos_tempo changes
    const cleanup = supabaseSync.subscribeToUserData<BlocoTempoRow>(
      'blocos_tempo',
      userId,
      (newBloco) => {
        const bloco = mapRowToBloco(newBloco)
        set((state) => ({
          blocos: [...state.blocos, bloco].sort((a, b) => a.hora.localeCompare(b.hora))
        }))
      },
      (updatedBloco) => {
        const bloco = mapRowToBloco(updatedBloco)
        set((state) => ({
          blocos: state.blocos.map(b => b.id === bloco.id ? bloco : b)
        }))
      },
      (deleted) => {
        set((state) => ({
          blocos: state.blocos.filter(b => b.id !== deleted.id)
        }))
      }
    )

    // Set up a periodic refresh for dashboard data (every 30 seconds)
    const intervalId = setInterval(() => {
      get().carregarDadosDia(userId)
    }, 30000)

    // Return cleanup function
    return () => {
      cleanup()
      clearInterval(intervalId)
    }
  },
}))
