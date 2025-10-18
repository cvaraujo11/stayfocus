import { create } from 'zustand'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { supabaseSync } from '@/app/lib/supabase/sync'
import { format, parseISO } from 'date-fns'

// Database types matching sono_registros table
export type RegistroSonoDB = {
  id: string
  user_id: string
  data: string // DATE format (YYYY-MM-DD)
  hora_dormir: string | null // Time format (HH:MM)
  hora_acordar: string | null // Time format (HH:MM)
  qualidade: number | null // 1-5
  observacoes: string | null
  created_at: string
}

// Client-side type for compatibility with existing components
export type RegistroSono = {
  id: string
  inicio: string // ISO date string
  fim: string | null // ISO date string ou null se ainda não acordou
  qualidade: number | null // 1-5, onde 5 é a melhor qualidade
  notas: string
}

// Lembretes remain client-side only (not persisted to database)
export type ConfiguracaoLembrete = {
  id: string
  tipo: 'dormir' | 'acordar'
  horario: string // Formato HH:MM
  diasSemana: number[] // 0-6, onde 0 é domingo
  ativo: boolean
}

export type SonoState = {
  registros: RegistroSono[]
  lembretes: ConfiguracaoLembrete[]
  loading: boolean
  error: string | null

  // Data loading
  carregarRegistros: (userId: string, dataInicio?: string, dataFim?: string) => Promise<void>

  // CRUD operations
  adicionarRegistroSono: (inicio: string, fim?: string | null, qualidade?: number | null, notas?: string) => Promise<void>
  atualizarRegistroSono: (id: string, dados: Partial<Omit<RegistroSono, 'id'>>) => Promise<void>
  removerRegistroSono: (id: string) => Promise<void>

  // Lembretes (client-side only)
  adicionarLembrete: (tipo: 'dormir' | 'acordar', horario: string, diasSemana: number[]) => void
  atualizarLembrete: (id: string, dados: Partial<Omit<ConfiguracaoLembrete, 'id'>>) => void
  removerLembrete: (id: string) => void
  alternarAtivoLembrete: (id: string) => void

  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void
}

// Helper functions to convert between DB and client formats
function dbToClient(dbRecord: RegistroSonoDB): RegistroSono {
  // Combine data + hora_dormir into ISO string
  const inicio = dbRecord.hora_dormir
    ? new Date(`${dbRecord.data}T${dbRecord.hora_dormir}:00`).toISOString()
    : new Date(`${dbRecord.data}T00:00:00`).toISOString()

  // Combine data + hora_acordar into ISO string (or null)
  const fim = dbRecord.hora_acordar
    ? new Date(`${dbRecord.data}T${dbRecord.hora_acordar}:00`).toISOString()
    : null

  return {
    id: dbRecord.id,
    inicio,
    fim,
    qualidade: dbRecord.qualidade,
    notas: dbRecord.observacoes || ''
  }
}

function clientToDb(clientRecord: Partial<RegistroSono>, userId: string): Partial<RegistroSonoDB> {
  const dbRecord: Partial<RegistroSonoDB> = {
    user_id: userId
  }

  if (clientRecord.inicio) {
    const inicioDate = parseISO(clientRecord.inicio)
    dbRecord.data = format(inicioDate, 'yyyy-MM-dd')
    dbRecord.hora_dormir = format(inicioDate, 'HH:mm')
  }

  if (clientRecord.fim !== undefined) {
    if (clientRecord.fim) {
      const fimDate = parseISO(clientRecord.fim)
      dbRecord.hora_acordar = format(fimDate, 'HH:mm')
    } else {
      dbRecord.hora_acordar = null
    }
  }

  if (clientRecord.qualidade !== undefined) {
    dbRecord.qualidade = clientRecord.qualidade
  }

  if (clientRecord.notas !== undefined) {
    dbRecord.observacoes = clientRecord.notas || null
  }

  return dbRecord
}

export const useSonoStore = create<SonoState>((set, get) => ({
  registros: [],
  lembretes: [],
  loading: false,
  error: null,

  carregarRegistros: async (userId: string, dataInicio?: string, dataFim?: string) => {
    set({ loading: true, error: null })

    try {
      const supabase = createSupabaseClient()

      let query = supabase
        .from('sono_registros')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })

      // Apply date range filters if provided
      if (dataInicio) {
        query = query.gte('data', dataInicio)
      }
      if (dataFim) {
        query = query.lte('data', dataFim)
      }

      const { data, error } = await query

      if (error) throw error

      const registros = (data || []).map(dbToClient)
      set({ registros, loading: false })
    } catch (error: any) {
      console.error('Erro ao carregar registros de sono:', error)
      set({
        error: error.message || 'Erro ao carregar registros de sono',
        loading: false
      })
    }
  },

  adicionarRegistroSono: async (inicio: string, fim = null, qualidade = null, notas = '') => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const clientRecord: Partial<RegistroSono> = {
        inicio,
        fim,
        qualidade,
        notas
      }

      const dbRecord = clientToDb(clientRecord, user.id)

      const { data, error } = await supabase
        .from('sono_registros')
        .insert(dbRecord as any)
        .select()
        .single()

      if (error) {
        // Handle unique constraint violation (user_id, data)
        if (error.code === '23505') {
          throw new Error('Já existe um registro de sono para esta data')
        }
        throw error
      }

      // Optimistically update local state
      const newRegistro = dbToClient(data)
      set((state) => ({
        registros: [newRegistro, ...state.registros]
      }))
    } catch (error: any) {
      console.error('Erro ao adicionar registro de sono:', error)
      set({ error: error.message || 'Erro ao adicionar registro de sono' })
      throw error
    }
  },

  atualizarRegistroSono: async (id: string, dados: Partial<Omit<RegistroSono, 'id'>>) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const dbUpdates = clientToDb(dados, user.id)

      const { data, error } = await supabase
        .from('sono_registros')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          throw new Error('Já existe um registro de sono para esta data')
        }
        throw error
      }

      // Update local state
      const updatedRegistro = dbToClient(data)
      set((state) => ({
        registros: state.registros.map((registro) =>
          registro.id === id ? updatedRegistro : registro
        )
      }))
    } catch (error: any) {
      console.error('Erro ao atualizar registro de sono:', error)
      set({ error: error.message || 'Erro ao atualizar registro de sono' })
      throw error
    }
  },

  removerRegistroSono: async (id: string) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { error } = await supabase
        .from('sono_registros')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      set((state) => ({
        registros: state.registros.filter((registro) => registro.id !== id)
      }))
    } catch (error: any) {
      console.error('Erro ao remover registro de sono:', error)
      set({ error: error.message || 'Erro ao remover registro de sono' })
      throw error
    }
  },

  // Lembretes remain client-side only (localStorage via separate mechanism if needed)
  adicionarLembrete: (tipo, horario, diasSemana) => set((state) => ({
    lembretes: [
      ...state.lembretes,
      {
        id: Date.now().toString(),
        tipo,
        horario,
        diasSemana,
        ativo: true
      }
    ]
  })),

  atualizarLembrete: (id, dados) => set((state) => ({
    lembretes: state.lembretes.map((lembrete) =>
      lembrete.id === id
        ? { ...lembrete, ...dados }
        : lembrete
    )
  })),

  removerLembrete: (id) => set((state) => ({
    lembretes: state.lembretes.filter((lembrete) => lembrete.id !== id)
  })),

  alternarAtivoLembrete: (id) => set((state) => ({
    lembretes: state.lembretes.map((lembrete) =>
      lembrete.id === id
        ? { ...lembrete, ativo: !lembrete.ativo }
        : lembrete
    )
  })),

  setupRealtimeSync: (userId: string) => {
    return supabaseSync.subscribeToUserData<RegistroSonoDB>(
      'sono_registros',
      userId,
      (newRecord) => {
        const newRegistro = dbToClient(newRecord)
        set((state) => ({
          registros: [newRegistro, ...state.registros.filter(r => r.id !== newRegistro.id)]
        }))
      },
      (updatedRecord) => {
        const updatedRegistro = dbToClient(updatedRecord)
        set((state) => ({
          registros: state.registros.map((registro) =>
            registro.id === updatedRegistro.id ? updatedRegistro : registro
          )
        }))
      },
      (deleted) => {
        set((state) => ({
          registros: state.registros.filter((registro) => registro.id !== deleted.id)
        }))
      }
    )
  }
}))
