import { create } from 'zustand'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { supabaseSync } from '@/app/lib/supabase/sync'
import type { Database } from '@/app/types/database'

type HiperfocoRow = Database['public']['Tables']['hiperfocos']['Row']
type TarefaRow = Database['public']['Tables']['hiperfoco_tarefas']['Row']

// Tipos
export type Tarefa = {
  id: string
  texto: string
  concluida: boolean
  cor?: string
  ordem?: number
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
  
  // Tarefas (persisted to database)
  carregarTarefas: (hiperfocoId: string) => Promise<void>
  adicionarTarefa: (hiperfocoId: string, texto: string) => Promise<string>
  atualizarTarefa: (hiperfocoId: string, tarefaId: string, texto: string) => Promise<void>
  toggleTarefaConcluida: (hiperfocoId: string, tarefaId: string) => Promise<void>
  removerTarefa: (hiperfocoId: string, tarefaId: string) => Promise<void>
  
  // Sub-tarefas (persisted to database)
  adicionarSubTarefa: (hiperfocoId: string, tarefaPaiId: string, texto: string) => Promise<string>
  atualizarSubTarefa: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string, texto: string) => Promise<void>
  toggleSubTarefaConcluida: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string) => Promise<void>
  removerSubTarefa: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string) => Promise<void>
  
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
      
  // Carregar tarefas de um hiperfoco
  carregarTarefas: async (hiperfocoId) => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('hiperfoco_tarefas')
        .select('*')
        .eq('hiperfoco_id', hiperfocoId)
        .order('ordem', { ascending: true })
      
      if (error) throw error
      
      // Separar tarefas principais de sub-tarefas
      const tarefasPrincipais = data.filter(t => !t.tarefa_pai_id)
      const subTarefasData = data.filter(t => t.tarefa_pai_id)
      
      // Organizar sub-tarefas por tarefa pai
      const subTarefasMap: Record<string, Tarefa[]> = {}
      subTarefasData.forEach(st => {
        if (!subTarefasMap[st.tarefa_pai_id!]) {
          subTarefasMap[st.tarefa_pai_id!] = []
        }
        subTarefasMap[st.tarefa_pai_id!].push({
          id: st.id,
          texto: st.texto,
          concluida: st.concluida,
          cor: st.cor || undefined,
          ordem: st.ordem
        })
      })
      
      set((state) => ({
        hiperfocos: state.hiperfocos.map((hiperfoco) => {
          if (hiperfoco.id === hiperfocoId) {
            return {
              ...hiperfoco,
              tarefas: tarefasPrincipais.map(t => ({
                id: t.id,
                texto: t.texto,
                concluida: t.concluida,
                cor: t.cor || undefined,
                ordem: t.ordem
              })),
              subTarefas: subTarefasMap
            }
          }
          return hiperfoco
        })
      }))
    } catch (error: any) {
      console.error('Erro ao carregar tarefas:', error)
      set({ error: error.message || 'Erro ao carregar tarefas' })
    }
  },
  
  // Ações para tarefas (persisted to database)
  adicionarTarefa: async (hiperfocoId, texto) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      // Buscar o número atual de tarefas para definir a ordem
      const { data: tarefasExistentes } = await supabase
        .from('hiperfoco_tarefas')
        .select('ordem')
        .eq('hiperfoco_id', hiperfocoId)
        .is('tarefa_pai_id', null)
        .order('ordem', { ascending: false })
        .limit(1)
      
      const novaOrdem = tarefasExistentes && tarefasExistentes.length > 0 
        ? tarefasExistentes[0].ordem + 1 
        : 0
      
      const { data, error } = await supabase
        .from('hiperfoco_tarefas')
        .insert({
          hiperfoco_id: hiperfocoId,
          user_id: user.id,
          texto,
          concluida: false,
          tarefa_pai_id: null,
          ordem: novaOrdem
        })
        .select()
        .single()
      
      if (error) throw error
      
      const novaTarefa: Tarefa = {
        id: data.id,
        texto: data.texto,
        concluida: data.concluida,
        cor: data.cor || undefined,
        ordem: data.ordem
      }
      
      set((state) => ({
        hiperfocos: state.hiperfocos.map((hiperfoco) => {
          if (hiperfoco.id === hiperfocoId) {
            return {
              ...hiperfoco,
              tarefas: [...hiperfoco.tarefas, novaTarefa],
              // Inicializar a entrada de subTarefas para esta tarefa
              subTarefas: {
                ...hiperfoco.subTarefas,
                [data.id]: []
              }
            }
          }
          return hiperfoco
        })
      }))
      
      return data.id
    } catch (error: any) {
      console.error('Erro ao adicionar tarefa:', error)
      set({ error: error.message || 'Erro ao adicionar tarefa' })
      throw error
    }
  },
  
  atualizarTarefa: async (hiperfocoId, tarefaId, texto) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('hiperfoco_tarefas')
        .update({ texto })
        .eq('id', tarefaId)
      
      if (error) throw error
      
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
    } catch (error: any) {
      console.error('Erro ao atualizar tarefa:', error)
      set({ error: error.message || 'Erro ao atualizar tarefa' })
      throw error
    }
  },
  
  toggleTarefaConcluida: async (hiperfocoId, tarefaId) => {
    try {
      const supabase = createSupabaseClient()
      
      // Buscar o estado atual da tarefa
      const { data: tarefaAtual } = await supabase
        .from('hiperfoco_tarefas')
        .select('concluida')
        .eq('id', tarefaId)
        .single()
      
      if (!tarefaAtual) throw new Error('Tarefa não encontrada')
      
      const { error } = await supabase
        .from('hiperfoco_tarefas')
        .update({ concluida: !tarefaAtual.concluida })
        .eq('id', tarefaId)
      
      if (error) throw error
      
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
    } catch (error: any) {
      console.error('Erro ao alternar tarefa concluída:', error)
      set({ error: error.message || 'Erro ao alternar tarefa concluída' })
      throw error
    }
  },
  
  removerTarefa: async (hiperfocoId, tarefaId) => {
    try {
      const supabase = createSupabaseClient()
      
      // A cascade delete vai remover automaticamente as subtarefas
      const { error } = await supabase
        .from('hiperfoco_tarefas')
        .delete()
        .eq('id', tarefaId)
      
      if (error) throw error
      
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
    } catch (error: any) {
      console.error('Erro ao remover tarefa:', error)
      set({ error: error.message || 'Erro ao remover tarefa' })
      throw error
    }
  },
  
  // Ações para sub-tarefas (persisted to database)
  adicionarSubTarefa: async (hiperfocoId, tarefaPaiId, texto) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      // Buscar o número atual de subtarefas para definir a ordem
      const { data: subTarefasExistentes } = await supabase
        .from('hiperfoco_tarefas')
        .select('ordem')
        .eq('hiperfoco_id', hiperfocoId)
        .eq('tarefa_pai_id', tarefaPaiId)
        .order('ordem', { ascending: false })
        .limit(1)
      
      const novaOrdem = subTarefasExistentes && subTarefasExistentes.length > 0 
        ? subTarefasExistentes[0].ordem + 1 
        : 0
      
      const { data, error } = await supabase
        .from('hiperfoco_tarefas')
        .insert({
          hiperfoco_id: hiperfocoId,
          user_id: user.id,
          texto,
          concluida: false,
          tarefa_pai_id: tarefaPaiId,
          ordem: novaOrdem
        })
        .select()
        .single()
      
      if (error) throw error
      
      const novaSubTarefa: Tarefa = {
        id: data.id,
        texto: data.texto,
        concluida: data.concluida,
        cor: data.cor || undefined,
        ordem: data.ordem
      }
      
      set((state) => ({
        hiperfocos: state.hiperfocos.map((hiperfoco) => {
          if (hiperfoco.id === hiperfocoId) {
            return {
              ...hiperfoco,
              subTarefas: {
                ...hiperfoco.subTarefas,
                [tarefaPaiId]: [
                  ...(hiperfoco.subTarefas[tarefaPaiId] || []),
                  novaSubTarefa
                ]
              }
            }
          }
          return hiperfoco
        })
      }))
      
      return data.id
    } catch (error: any) {
      console.error('Erro ao adicionar subtarefa:', error)
      set({ error: error.message || 'Erro ao adicionar subtarefa' })
      throw error
    }
  },
  
  atualizarSubTarefa: async (hiperfocoId, tarefaPaiId, subTarefaId, texto) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('hiperfoco_tarefas')
        .update({ texto })
        .eq('id', subTarefaId)
      
      if (error) throw error
      
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
    } catch (error: any) {
      console.error('Erro ao atualizar subtarefa:', error)
      set({ error: error.message || 'Erro ao atualizar subtarefa' })
      throw error
    }
  },
  
  toggleSubTarefaConcluida: async (hiperfocoId, tarefaPaiId, subTarefaId) => {
    try {
      const supabase = createSupabaseClient()
      
      // Buscar o estado atual da subtarefa
      const { data: subTarefaAtual } = await supabase
        .from('hiperfoco_tarefas')
        .select('concluida')
        .eq('id', subTarefaId)
        .single()
      
      if (!subTarefaAtual) throw new Error('Subtarefa não encontrada')
      
      const { error } = await supabase
        .from('hiperfoco_tarefas')
        .update({ concluida: !subTarefaAtual.concluida })
        .eq('id', subTarefaId)
      
      if (error) throw error
      
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
    } catch (error: any) {
      console.error('Erro ao alternar subtarefa concluída:', error)
      set({ error: error.message || 'Erro ao alternar subtarefa concluída' })
      throw error
    }
  },
  
  removerSubTarefa: async (hiperfocoId, tarefaPaiId, subTarefaId) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('hiperfoco_tarefas')
        .delete()
        .eq('id', subTarefaId)
      
      if (error) throw error
      
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
    } catch (error: any) {
      console.error('Erro ao remover subtarefa:', error)
      set({ error: error.message || 'Erro ao remover subtarefa' })
      throw error
    }
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
