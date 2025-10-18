import { create } from 'zustand'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { supabaseSync } from '@/app/lib/supabase/sync'
import type { Database } from '@/app/types/database'

type PomodoroSessaoRow = Database['public']['Tables']['pomodoro_sessoes']['Row']

type CicloPomodoro = 'foco' | 'pausa' | 'longapausa'

interface ConfiguracaoPomodoro {
  tempoFoco: number        // em minutos
  tempoPausa: number       // em minutos
  tempoLongapausa: number  // em minutos
  ciclosAntesLongapausa: number
}

export type PomodoroSessao = {
  id: string
  user_id: string
  data: string // ISO timestamp
  duracao_minutos: number
  tipo: 'foco' | 'pausa'
  tarefa?: string | null
  concluida: boolean
  created_at: string
}

interface EstatisticasPomodoro {
  totalSessoesFoco: number
  totalSessoesPausa: number
  totalMinutosFoco: number
  totalMinutosPausa: number
  sessoesHoje: number
  minutosFocoHoje: number
}

interface PomodoroState {
  // Configuração do pomodoro (mantida em localStorage para performance)
  configuracao: ConfiguracaoPomodoro
  atualizarConfiguracao: (config: Partial<ConfiguracaoPomodoro>) => void
  
  // Sessões registradas
  sessoes: PomodoroSessao[]
  loading: boolean
  error: string | null
  
  // Estatísticas em memória (calculadas do dia atual)
  ciclosCompletos: number
  incrementarCiclosCompletos: () => void
  resetarCiclosCompletos: () => void
  
  // Data operations
  carregarSessoes: (userId: string, dataInicio?: string, dataFim?: string) => Promise<void>
  registrarSessao: (sessao: {
    duracao_minutos: number
    tipo: 'foco' | 'pausa'
    tarefa?: string
    concluida?: boolean
  }) => Promise<void>
  obterEstatisticas: (dataInicio?: string, dataFim?: string) => EstatisticasPomodoro
  
  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void
}

const mapRowToSessao = (row: PomodoroSessaoRow): PomodoroSessao => ({
  id: row.id,
  user_id: row.user_id,
  data: row.data,
  duracao_minutos: row.duracao_minutos,
  tipo: row.tipo as 'foco' | 'pausa',
  tarefa: row.tarefa,
  concluida: row.concluida,
  created_at: row.created_at,
})

// Carregar configuração do localStorage
const loadConfigFromLocalStorage = (): ConfiguracaoPomodoro => {
  if (typeof window === 'undefined') {
    return {
      tempoFoco: 25,
      tempoPausa: 5,
      tempoLongapausa: 15,
      ciclosAntesLongapausa: 4,
    }
  }
  
  try {
    const stored = localStorage.getItem('pomodoro-config')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Erro ao carregar configuração do pomodoro:', error)
  }
  
  return {
    tempoFoco: 25,
    tempoPausa: 5,
    tempoLongapausa: 15,
    ciclosAntesLongapausa: 4,
  }
}

// Salvar configuração no localStorage
const saveConfigToLocalStorage = (config: ConfiguracaoPomodoro) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('pomodoro-config', JSON.stringify(config))
    } catch (error) {
      console.error('Erro ao salvar configuração do pomodoro:', error)
    }
  }
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  // Configuração (mantida em localStorage)
  configuracao: loadConfigFromLocalStorage(),
  
  atualizarConfiguracao: (config) => {
    const novaConfig = {
      ...get().configuracao,
      ...config,
    }
    saveConfigToLocalStorage(novaConfig)
    set({ configuracao: novaConfig })
  },
  
  // Sessões
  sessoes: [],
  loading: false,
  error: null,
  
  // Estatísticas em memória
  ciclosCompletos: 0,
  
  incrementarCiclosCompletos: () => set((state) => ({
    ciclosCompletos: state.ciclosCompletos + 1
  })),
  
  resetarCiclosCompletos: () => set({
    ciclosCompletos: 0
  }),

  carregarSessoes: async (userId: string, dataInicio?: string, dataFim?: string) => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      let query = supabase
        .from('pomodoro_sessoes')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })

      // Filtrar por data se fornecido
      if (dataInicio) {
        query = query.gte('data', dataInicio)
      }
      if (dataFim) {
        query = query.lte('data', dataFim)
      }

      const { data, error } = await query

      if (error) throw error
      
      const sessoes = data.map(mapRowToSessao)
      set({ sessoes, loading: false })
      
      // Calcular ciclos completos do dia atual
      const hoje = new Date().toISOString().split('T')[0]
      const sessoesHoje = sessoes.filter(s => s.data.startsWith(hoje) && s.tipo === 'foco' && s.concluida)
      set({ ciclosCompletos: sessoesHoje.length })
    } catch (error: any) {
      console.error('Erro ao carregar sessões do pomodoro:', error)
      set({ error: error.message || 'Erro ao carregar sessões', loading: false })
    }
  },

  registrarSessao: async (sessao) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const agora = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('pomodoro_sessoes')
        .insert({
          user_id: user.id,
          data: agora,
          duracao_minutos: sessao.duracao_minutos,
          tipo: sessao.tipo,
          tarefa: sessao.tarefa || null,
          concluida: sessao.concluida ?? true,
        })
        .select()
        .single()

      if (error) throw error

      const novaSessao = mapRowToSessao(data)
      set((state) => ({
        sessoes: [novaSessao, ...state.sessoes],
      }))
      
      // Se for uma sessão de foco concluída, incrementar contador
      if (sessao.tipo === 'foco' && (sessao.concluida ?? true)) {
        get().incrementarCiclosCompletos()
      }
    } catch (error: any) {
      console.error('Erro ao registrar sessão do pomodoro:', error)
      set({ error: error.message || 'Erro ao registrar sessão' })
      throw error
    }
  },

  obterEstatisticas: (dataInicio?: string, dataFim?: string) => {
    const sessoes = get().sessoes
    
    // Filtrar por data se fornecido
    let sessoesFiltradas = sessoes
    if (dataInicio) {
      sessoesFiltradas = sessoesFiltradas.filter(s => s.data >= dataInicio)
    }
    if (dataFim) {
      sessoesFiltradas = sessoesFiltradas.filter(s => s.data <= dataFim)
    }
    
    const sessoesFoco = sessoesFiltradas.filter(s => s.tipo === 'foco')
    const sessoesPausa = sessoesFiltradas.filter(s => s.tipo === 'pausa')
    
    const hoje = new Date().toISOString().split('T')[0]
    const sessoesHoje = sessoesFiltradas.filter(s => s.data.startsWith(hoje))
    const sessoesFocoHoje = sessoesHoje.filter(s => s.tipo === 'foco')
    
    return {
      totalSessoesFoco: sessoesFoco.length,
      totalSessoesPausa: sessoesPausa.length,
      totalMinutosFoco: sessoesFoco.reduce((acc, s) => acc + s.duracao_minutos, 0),
      totalMinutosPausa: sessoesPausa.reduce((acc, s) => acc + s.duracao_minutos, 0),
      sessoesHoje: sessoesHoje.length,
      minutosFocoHoje: sessoesFocoHoje.reduce((acc, s) => acc + s.duracao_minutos, 0),
    }
  },

  setupRealtimeSync: (userId: string) => {
    return supabaseSync.subscribeToUserData<PomodoroSessaoRow>(
      'pomodoro_sessoes',
      userId,
      (newRow) => {
        const sessao = mapRowToSessao(newRow)
        set((state) => ({
          sessoes: [sessao, ...state.sessoes],
        }))
        
        // Se for uma sessão de foco concluída de hoje, incrementar contador
        const hoje = new Date().toISOString().split('T')[0]
        if (sessao.tipo === 'foco' && sessao.concluida && sessao.data.startsWith(hoje)) {
          get().incrementarCiclosCompletos()
        }
      },
      (updatedRow) => {
        const sessao = mapRowToSessao(updatedRow)
        set((state) => ({
          sessoes: state.sessoes.map((s) =>
            s.id === updatedRow.id ? sessao : s
          ),
        }))
      },
      (deleted) => {
        set((state) => ({
          sessoes: state.sessoes.filter((s) => s.id !== deleted.id),
        }))
      }
    )
  },
}))
