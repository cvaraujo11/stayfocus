import { create } from 'zustand'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { supabaseSync } from '@/app/lib/supabase/sync'
import type { Database } from '@/app/types/database'

type HiperfocoRow = Database['public']['Tables']['hiperfocos']['Row']

// Tipos
export type Tarefa = {
  id: string
  texto: string
  concluida: boolean
  cor?: string
}

export type Hiperfoco = {
  id: string
  titulo: string
  descricao: string
  tarefas: Tarefa[]
  subTarefas: Record<string, Tarefa[]> // Id da tarefa pai -> lista de sub-tarefas
  cor: string
  dataCriacao: string
  tempoLimite?: number // em minutos, opcional
  // New fields from database
  data_inicio: string
  data_fim?: string | null
  intensidade?: number | null
  status: 'ativo' | 'pausado' | 'concluido'
}

export type SessaoAlternancia = {
  id: string
  titulo: string
  hiperfocoAtual: string | null // ID do hiperfoco ativo
  hiperfocoAnterior: string | null // ID do hiperfoco anterior
  tempoInicio: string
  duracaoEstimada: number // em minutos
  concluida: boolean
}

type HiperfocosState = {
  // Hiperfocos
  hiperfocos: Hiperfoco[]
  loading: boolean
  error: string | null
  
  // Data operations
  carregarHiperfocos: (userId: string, statusFilter?: 'ativo' | 'pausado' | 'concluido') => Promise<void>
  adicionarHiperfoco: (titulo: string, descricao: string, cor: string, tempoLimite?: number, intensidade?: number) => Promise<string>
  atualizarHiperfoco: (id: string, titulo: string, descricao: string, cor: string, tempoLimite?: number, intensidade?: number) => Promise<void>
  removerHiperfoco: (id: string) => Promise<void>
  alterarStatus: (id: string, status: 'ativo' | 'pausado' | 'concluido') => Promise<void>
  
  // Tarefas (client-side only, not persisted to database)
  adicionarTarefa: (hiperfocoId: string, texto: string) => string
  atualizarTarefa: (hiperfocoId: string, tarefaId: string, texto: string) => void
  toggleTarefaConcluida: (hiperfocoId: string, tarefaId: string) => void
  removerTarefa: (hiperfocoId: string, tarefaId: string) => void
  
  // Sub-tarefas (client-side only, not persisted to database)
  adicionarSubTarefa: (hiperfocoId: string, tarefaPaiId: string, texto: string) => string
  atualizarSubTarefa: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string, texto: string) => void
  toggleSubTarefaConcluida: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string) => void
  removerSubTarefa: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string) => void
  
  // Alternância (client-side only, not persisted to database)
  sessoes: SessaoAlternancia[]
  adicionarSessao: (titulo: string, hiperfocoId: string, duracaoEstimada: number) => string
  atualizarSessao: (id: string, titulo: string, hiperfocoId: string, duracaoEstimada: number) => void
  concluirSessao: (id: string) => void
  removerSessao: (id: string) => void
  alternarHiperfoco: (sessaoId: string, novoHiperfocoId: string) => void
  
  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void
}

// Cores predefinidas para hiperfocos
export const CORES_HIPERFOCOS = [
  '#FF5252', // Vermelho
  '#4CAF50', // Verde
  '#2196F3', // Azul
  '#FF9800', // Laranja
  '#9C27B0', // Roxo
  '#795548', // Marrom
  '#607D8B'  // Azul acinzentado
]

// Map database row to Hiperfoco type
const mapRowToHiperfoco = (row: HiperfocoRow): Hiperfoco => ({
  id: row.id,
  titulo: row.titulo,
  descricao: row.descricao || '',
  tarefas: [], // Client-side only
  subTarefas: {}, // Client-side only
  cor: '#2196F3', // Default color, not stored in DB
  dataCriacao: row.created_at,
  tempoLimite: undefined, // Not stored in DB
  data_inicio: row.data_inicio,
  data_fim: row.data_fim,
  intensidade: row.intensidade,
  status: row.status as 'ativo' | 'pausado' | 'concluido',
})

export const useHiperfocosStore = create<HiperfocosState>((set, get) => ({
  // Estado inicial
  hiperfocos: [],
  sessoes: [],
  loading: false,
  error: null,
  
  // Carregar hiperfocos do Supabase
  carregarHiperfocos: async (userId: string, statusFilter?: 'ativo' | 'pausado' | 'concluido') => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      let query = supabase
        .from('hiperfocos')
        .select('*')
        .eq('user_id', userId)
        .order('data_inicio', { ascending: false })
      
      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      const hiperfocos = data.map(mapRowToHiperfoco)
      set({ hiperfocos, loading: false })
    } catch (error: any) {
      console.error('Erro ao carregar hiperfocos:', error)
      set({ error: error.message || 'Erro ao carregar hiperfocos', loading: false })
    }
  },
  
  // Adicionar hiperfoco
  adicionarHiperfoco: async (titulo, descricao, cor, tempoLimite, intensidade) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const dataAtual = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('hiperfocos')
        .insert({
          user_id: user.id,
          titulo,
          descricao: descricao || null,
          data_inicio: dataAtual,
          intensidade: intensidade || null,
          status: 'ativo',
        })
        .select()
        .single()
      
      if (error) throw error
      
      const hiperfoco = mapRowToHiperfoco(data)
      // Preserve client-side properties
      hiperfoco.cor = cor
      hiperfoco.tempoLimite = tempoLimite
      
      set((state) => ({
        hiperfocos: [hiperfoco, ...state.hiperfocos],
      }))
      
      return hiperfoco.id
    } catch (error: any) {
      console.error('Erro ao adicionar hiperfoco:', error)
      set({ error: error.message || 'Erro ao adicionar hiperfoco' })
      throw error
    }
  },
  
  // Atualizar hiperfoco
  atualizarHiperfoco: async (id, titulo, descricao, cor, tempoLimite, intensidade) => {
    try {
      const supabase = createSupabaseClient()
      
      const { data, error } = await supabase
        .from('hiperfocos')
        .update({
          titulo,
          descricao: descricao || null,
          intensidade: intensidade || null,
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      const hiperfoco = mapRowToHiperfoco(data)
      // Preserve client-side properties
      hiperfoco.cor = cor
      hiperfoco.tempoLimite = tempoLimite
      
      set((state) => ({
        hiperfocos: state.hiperfocos.map((h) =>
          h.id === id ? { ...h, ...hiperfoco } : h
        ),
      }))
    } catch (error: any) {
      console.error('Erro ao atualizar hiperfoco:', error)
      set({ error: error.message || 'Erro ao atualizar hiperfoco' })
      throw error
    }
  },
  
  // Remover hiperfoco
  removerHiperfoco: async (id) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('hiperfocos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set((state) => ({
        hiperfocos: state.hiperfocos.filter((hiperfoco) => hiperfoco.id !== id),
        // Também remover as sessões associadas a este hiperfoco
        sessoes: state.sessoes.filter(
          (sessao) => sessao.hiperfocoAtual !== id && sessao.hiperfocoAnterior !== id
        )
      }))
    } catch (error: any) {
      console.error('Erro ao remover hiperfoco:', error)
      set({ error: error.message || 'Erro ao remover hiperfoco' })
      throw error
    }
  },
  
  // Alterar status do hiperfoco
  alterarStatus: async (id, status) => {
    try {
      const supabase = createSupabaseClient()
      
      const updates: any = { status }
      
      // Se concluindo, definir data_fim
      if (status === 'concluido') {
        updates.data_fim = new Date().toISOString().split('T')[0]
      }
      
      const { data, error } = await supabase
        .from('hiperfocos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      const hiperfoco = mapRowToHiperfoco(data)
      
      set((state) => ({
        hiperfocos: state.hiperfocos.map((h) =>
          h.id === id ? { ...h, ...hiperfoco } : h
        ),
      }))
    } catch (error: any) {
      console.error('Erro ao alterar status do hiperfoco:', error)
      set({ error: error.message || 'Erro ao alterar status do hiperfoco' })
      throw error
    }
  },
      
  // Ações para tarefas (client-side only)
  adicionarTarefa: (hiperfocoId, texto) => {
    const tarefaId = Date.now().toString()
    
    set((state) => ({
      hiperfocos: state.hiperfocos.map((hiperfoco) => {
        if (hiperfoco.id === hiperfocoId) {
          return {
            ...hiperfoco,
            tarefas: [
              ...hiperfoco.tarefas,
              {
                id: tarefaId,
                texto,
                concluida: false
              }
            ],
            // Inicializar a entrada de subTarefas para esta tarefa
            subTarefas: {
              ...hiperfoco.subTarefas,
              [tarefaId]: []
            }
          }
        }
        return hiperfoco
      })
    }))
    
    return tarefaId
  },
  
  atualizarTarefa: (hiperfocoId, tarefaId, texto) => {
    set((state) => ({
      hiperfocos: state.hiperfocos.map((hiperfoco) => {
        if (hiperfoco.id === hiperfocoId) {
          return {
            ...hiperfoco,
            tarefas: hiperfoco.tarefas.map((tarefa) =>
              tarefa.id === tarefaId ? { ...tarefa, texto } : tarefa
            )
          }
        }
        return hiperfoco
      })
    }))
  },
  
  toggleTarefaConcluida: (hiperfocoId, tarefaId) => {
    set((state) => ({
      hiperfocos: state.hiperfocos.map((hiperfoco) => {
        if (hiperfoco.id === hiperfocoId) {
          return {
            ...hiperfoco,
            tarefas: hiperfoco.tarefas.map((tarefa) =>
              tarefa.id === tarefaId
                ? { ...tarefa, concluida: !tarefa.concluida }
                : tarefa
            )
          }
        }
        return hiperfoco
      })
    }))
  },
  
  removerTarefa: (hiperfocoId, tarefaId) => {
    set((state) => ({
      hiperfocos: state.hiperfocos.map((hiperfoco) => {
        if (hiperfoco.id === hiperfocoId) {
          // Filtrar a tarefa e também remover suas subtarefas
          const { [tarefaId]: subTarefasARemover, ...restoSubTarefas } = hiperfoco.subTarefas
          
          return {
            ...hiperfoco,
            tarefas: hiperfoco.tarefas.filter((tarefa) => tarefa.id !== tarefaId),
            subTarefas: restoSubTarefas
          }
        }
        return hiperfoco
      })
    }))
  },
  
  // Ações para sub-tarefas (client-side only)
  adicionarSubTarefa: (hiperfocoId, tarefaPaiId, texto) => {
    const subTarefaId = Date.now().toString()
    
    set((state) => ({
      hiperfocos: state.hiperfocos.map((hiperfoco) => {
        if (hiperfoco.id === hiperfocoId) {
          return {
            ...hiperfoco,
            subTarefas: {
              ...hiperfoco.subTarefas,
              [tarefaPaiId]: [
                ...(hiperfoco.subTarefas[tarefaPaiId] || []),
                {
                  id: subTarefaId,
                  texto,
                  concluida: false
                }
              ]
            }
          }
        }
        return hiperfoco
      })
    }))
    
    return subTarefaId
  },
  
  atualizarSubTarefa: (hiperfocoId, tarefaPaiId, subTarefaId, texto) => {
    set((state) => ({
      hiperfocos: state.hiperfocos.map((hiperfoco) => {
        if (hiperfoco.id === hiperfocoId) {
          return {
            ...hiperfoco,
            subTarefas: {
              ...hiperfoco.subTarefas,
              [tarefaPaiId]: (hiperfoco.subTarefas[tarefaPaiId] || []).map((subTarefa) =>
                subTarefa.id === subTarefaId ? { ...subTarefa, texto } : subTarefa
              )
            }
          }
        }
        return hiperfoco
      })
    }))
  },
  
  toggleSubTarefaConcluida: (hiperfocoId, tarefaPaiId, subTarefaId) => {
    set((state) => ({
      hiperfocos: state.hiperfocos.map((hiperfoco) => {
        if (hiperfoco.id === hiperfocoId) {
          return {
            ...hiperfoco,
            subTarefas: {
              ...hiperfoco.subTarefas,
              [tarefaPaiId]: (hiperfoco.subTarefas[tarefaPaiId] || []).map((subTarefa) =>
                subTarefa.id === subTarefaId
                  ? { ...subTarefa, concluida: !subTarefa.concluida }
                  : subTarefa
              )
            }
          }
        }
        return hiperfoco
      })
    }))
  },
  
  removerSubTarefa: (hiperfocoId, tarefaPaiId, subTarefaId) => {
    set((state) => ({
      hiperfocos: state.hiperfocos.map((hiperfoco) => {
        if (hiperfoco.id === hiperfocoId) {
          return {
            ...hiperfoco,
            subTarefas: {
              ...hiperfoco.subTarefas,
              [tarefaPaiId]: (hiperfoco.subTarefas[tarefaPaiId] || []).filter(
                (subTarefa) => subTarefa.id !== subTarefaId
              )
            }
          }
        }
        return hiperfoco
      })
    }))
  },
  
  // Ações para sessões de alternância (client-side only)
  adicionarSessao: (titulo, hiperfocoId, duracaoEstimada) => {
    const id = Date.now().toString()
    
    set((state) => ({
      sessoes: [
        ...state.sessoes,
        {
          id,
          titulo,
          hiperfocoAtual: hiperfocoId,
          hiperfocoAnterior: null,
          tempoInicio: new Date().toISOString(),
          duracaoEstimada,
          concluida: false
        }
      ]
    }))
    
    return id
  },
  
  atualizarSessao: (id, titulo, hiperfocoId, duracaoEstimada) => {
    set((state) => ({
      sessoes: state.sessoes.map((sessao) =>
        sessao.id === id
          ? { ...sessao, titulo, hiperfocoAtual: hiperfocoId, duracaoEstimada }
          : sessao
      )
    }))
  },
  
  concluirSessao: (id) => {
    set((state) => ({
      sessoes: state.sessoes.map((sessao) =>
        sessao.id === id ? { ...sessao, concluida: true } : sessao
      )
    }))
  },
  
  removerSessao: (id) => {
    set((state) => ({
      sessoes: state.sessoes.filter((sessao) => sessao.id !== id)
    }))
  },
  
  alternarHiperfoco: (sessaoId, novoHiperfocoId) => {
    set((state) => ({
      sessoes: state.sessoes.map((sessao) => {
        if (sessao.id === sessaoId) {
          return {
            ...sessao,
            hiperfocoAnterior: sessao.hiperfocoAtual,
            hiperfocoAtual: novoHiperfocoId,
            tempoInicio: new Date().toISOString()
          }
        }
        return sessao
      })
    }))
  },
  
  // Real-time sync
  setupRealtimeSync: (userId: string) => {
    return supabaseSync.subscribeToUserData<HiperfocoRow>(
      'hiperfocos',
      userId,
      (newRow) => {
        const hiperfoco = mapRowToHiperfoco(newRow)
        set((state) => ({
          hiperfocos: [hiperfoco, ...state.hiperfocos],
        }))
      },
      (updatedRow) => {
        const hiperfoco = mapRowToHiperfoco(updatedRow)
        set((state) => ({
          hiperfocos: state.hiperfocos.map((h) =>
            h.id === updatedRow.id ? { ...h, ...hiperfoco } : h
          ),
        }))
      },
      (deleted) => {
        set((state) => ({
          hiperfocos: state.hiperfocos.filter((h) => h.id !== deleted.id),
        }))
      }
    )
  },
}))
