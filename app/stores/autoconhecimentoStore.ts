import { create } from 'zustand'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { supabaseSync } from '@/app/lib/supabase/sync'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'

// Database types matching autoconhecimento_registros table
export type RegistroAutoconhecimentoDB = {
  id: string
  user_id: string
  data: string // DATE format (YYYY-MM-DD)
  tipo: 'humor' | 'energia' | 'ansiedade'
  nivel: number | null // 1-5
  gatilhos: string[] | null
  observacoes: string | null
  created_at: string
}

// Client-side type for compatibility
export type RegistroAutoconhecimento = {
  id: string
  data: string // ISO date string
  tipo: 'humor' | 'energia' | 'ansiedade'
  nivel: number | null // 1-5
  gatilhos: string[]
  observacoes: string
}

// Legacy types for backward compatibility with existing components
export type Nota = {
  id: string
  titulo: string
  conteudo: string
  secao: 'quem-sou' | 'meus-porques' | 'meus-padroes'
  tags: string[]
  dataCriacao: string
  dataAtualizacao: string
  imagemUrl?: string
}

// Tendências para analytics
export type Tendencia = {
  tipo: 'humor' | 'energia' | 'ansiedade'
  media: number
  tendencia: 'subindo' | 'descendo' | 'estavel'
  gatilhosFrequentes: { gatilho: string; frequencia: number }[]
}

export type AutoconhecimentoState = {
  registros: RegistroAutoconhecimento[]
  notas: Nota[] // Legacy support
  modoRefugio: boolean
  loading: boolean
  error: string | null

  // Data loading
  carregarRegistros: (userId: string, tipo?: 'humor' | 'energia' | 'ansiedade', dataInicio?: string, dataFim?: string) => Promise<void>

  // CRUD operations
  adicionarRegistro: (tipo: 'humor' | 'energia' | 'ansiedade', nivel: number, gatilhos?: string[], observacoes?: string, data?: string) => Promise<void>
  atualizarRegistro: (id: string, dados: Partial<Omit<RegistroAutoconhecimento, 'id' | 'data' | 'tipo'>>) => Promise<void>
  removerRegistro: (id: string) => Promise<void>

  // Analytics
  obterTendencias: (userId: string, tipo?: 'humor' | 'energia' | 'ansiedade', dias?: number) => Promise<Tendencia[]>

  // Legacy methods for backward compatibility
  adicionarNota: (titulo: string, conteudo: string, secao: 'quem-sou' | 'meus-porques' | 'meus-padroes', tags?: string[], imagemUrl?: string) => string
  atualizarNota: (id: string, dados: Partial<Omit<Nota, 'id' | 'dataCriacao'>>) => void
  removerNota: (id: string) => void
  adicionarTag: (id: string, tag: string) => void
  removerTag: (id: string, tag: string) => void
  adicionarImagem: (id: string, imagemUrl: string) => void
  removerImagem: (id: string) => void
  buscarNotas: (termo: string) => Nota[]

  // UI state
  alternarModoRefugio: () => void

  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void
}

// Helper functions to convert between DB and client formats
function dbToClient(dbRecord: any): RegistroAutoconhecimento {
  return {
    id: dbRecord.id,
    data: new Date(dbRecord.data).toISOString(),
    tipo: dbRecord.tipo as 'humor' | 'energia' | 'ansiedade',
    nivel: dbRecord.nivel,
    gatilhos: dbRecord.gatilhos || [],
    observacoes: dbRecord.observacoes || ''
  }
}

function clientToDb(clientRecord: Partial<RegistroAutoconhecimento>, userId: string): Partial<RegistroAutoconhecimentoDB> {
  const dbRecord: Partial<RegistroAutoconhecimentoDB> = {
    user_id: userId
  }

  if (clientRecord.data) {
    const dataDate = parseISO(clientRecord.data)
    dbRecord.data = format(dataDate, 'yyyy-MM-dd')
  }

  if (clientRecord.tipo !== undefined) {
    dbRecord.tipo = clientRecord.tipo
  }

  if (clientRecord.nivel !== undefined) {
    dbRecord.nivel = clientRecord.nivel
  }

  if (clientRecord.gatilhos !== undefined) {
    dbRecord.gatilhos = clientRecord.gatilhos.length > 0 ? clientRecord.gatilhos : null
  }

  if (clientRecord.observacoes !== undefined) {
    dbRecord.observacoes = clientRecord.observacoes || null
  }

  return dbRecord
}

export const useAutoconhecimentoStore = create<AutoconhecimentoState>((set, get) => ({
  registros: [],
  notas: [], // Legacy support
  modoRefugio: false,
  loading: false,
  error: null,

  carregarRegistros: async (userId: string, tipo?: 'humor' | 'energia' | 'ansiedade', dataInicio?: string, dataFim?: string) => {
    set({ loading: true, error: null })

    try {
      const supabase = createSupabaseClient()

      let query = supabase
        .from('autoconhecimento_registros')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })

      // Apply type filter if provided
      if (tipo) {
        query = query.eq('tipo', tipo)
      }

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
      console.error('Erro ao carregar registros de autoconhecimento:', error)
      set({
        error: error.message || 'Erro ao carregar registros de autoconhecimento',
        loading: false
      })
    }
  },

  adicionarRegistro: async (tipo: 'humor' | 'energia' | 'ansiedade', nivel: number, gatilhos = [], observacoes = '', data?: string) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Validate nivel is between 1-5
      if (nivel < 1 || nivel > 5) {
        throw new Error('Nível deve estar entre 1 e 5')
      }

      const clientRecord: Partial<RegistroAutoconhecimento> = {
        data: data || new Date().toISOString(),
        tipo,
        nivel,
        gatilhos,
        observacoes
      }

      const dbRecord = clientToDb(clientRecord, user.id)

      const { data: insertedData, error } = await supabase
        .from('autoconhecimento_registros')
        .insert(dbRecord as any)
        .select()
        .single()

      if (error) {
        // Handle CHECK constraint violation
        if (error.code === '23514') {
          throw new Error('Nível deve estar entre 1 e 5')
        }
        throw error
      }

      // Optimistically update local state
      const newRegistro = dbToClient(insertedData)
      set((state) => ({
        registros: [newRegistro, ...state.registros]
      }))
    } catch (error: any) {
      console.error('Erro ao adicionar registro de autoconhecimento:', error)
      set({ error: error.message || 'Erro ao adicionar registro de autoconhecimento' })
      throw error
    }
  },

  atualizarRegistro: async (id: string, dados: Partial<Omit<RegistroAutoconhecimento, 'id' | 'data' | 'tipo'>>) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Validate nivel if provided
      if (dados.nivel !== undefined && dados.nivel !== null && (dados.nivel < 1 || dados.nivel > 5)) {
        throw new Error('Nível deve estar entre 1 e 5')
      }

      const dbUpdates = clientToDb(dados, user.id)

      const { data: updatedData, error } = await supabase
        .from('autoconhecimento_registros')
        .update(dbUpdates as any)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        // Handle CHECK constraint violation
        if (error.code === '23514') {
          throw new Error('Nível deve estar entre 1 e 5')
        }
        throw error
      }

      // Update local state
      const updatedRegistro = dbToClient(updatedData)
      set((state) => ({
        registros: state.registros.map((registro) =>
          registro.id === id ? updatedRegistro : registro
        )
      }))
    } catch (error: any) {
      console.error('Erro ao atualizar registro de autoconhecimento:', error)
      set({ error: error.message || 'Erro ao atualizar registro de autoconhecimento' })
      throw error
    }
  },

  removerRegistro: async (id: string) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { error } = await supabase
        .from('autoconhecimento_registros')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      set((state) => ({
        registros: state.registros.filter((registro) => registro.id !== id)
      }))
    } catch (error: any) {
      console.error('Erro ao remover registro de autoconhecimento:', error)
      set({ error: error.message || 'Erro ao remover registro de autoconhecimento' })
      throw error
    }
  },

  obterTendencias: async (userId: string, tipo?: 'humor' | 'energia' | 'ansiedade', dias = 30) => {
    try {
      const supabase = createSupabaseClient()

      // Calculate date range
      const dataFim = format(new Date(), 'yyyy-MM-dd')
      const dataInicio = format(new Date(Date.now() - dias * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')

      let query = supabase
        .from('autoconhecimento_registros')
        .select('*')
        .eq('user_id', userId)
        .gte('data', dataInicio)
        .lte('data', dataFim)
        .order('data', { ascending: true })

      if (tipo) {
        query = query.eq('tipo', tipo)
      }

      const { data, error } = await query

      if (error) throw error

      // Calculate tendencies for each type
      const tipos: Array<'humor' | 'energia' | 'ansiedade'> = tipo ? [tipo] : ['humor', 'energia', 'ansiedade']
      const tendencias: Tendencia[] = []

      for (const tipoAtual of tipos) {
        const registrosTipo = (data || []).filter(r => r.tipo === tipoAtual && r.nivel !== null)

        if (registrosTipo.length === 0) continue

        // Calculate average
        const soma = registrosTipo.reduce((acc, r) => acc + (r.nivel || 0), 0)
        const media = soma / registrosTipo.length

        // Calculate trend (compare first half vs second half)
        const metade = Math.floor(registrosTipo.length / 2)
        const primeiraMetade = registrosTipo.slice(0, metade)
        const segundaMetade = registrosTipo.slice(metade)

        const mediaPrimeira = primeiraMetade.reduce((acc, r) => acc + (r.nivel || 0), 0) / primeiraMetade.length
        const mediaSegunda = segundaMetade.reduce((acc, r) => acc + (r.nivel || 0), 0) / segundaMetade.length

        let tendencia: 'subindo' | 'descendo' | 'estavel' = 'estavel'
        if (mediaSegunda > mediaPrimeira + 0.3) {
          tendencia = 'subindo'
        } else if (mediaSegunda < mediaPrimeira - 0.3) {
          tendencia = 'descendo'
        }

        // Count frequent triggers
        const gatilhosMap = new Map<string, number>()
        registrosTipo.forEach(r => {
          if (r.gatilhos) {
            r.gatilhos.forEach((g: string) => {
              gatilhosMap.set(g, (gatilhosMap.get(g) || 0) + 1)
            })
          }
        })

        const gatilhosFrequentes = Array.from(gatilhosMap.entries())
          .map(([gatilho, frequencia]) => ({ gatilho, frequencia }))
          .sort((a, b) => b.frequencia - a.frequencia)
          .slice(0, 5)

        tendencias.push({
          tipo: tipoAtual,
          media: Math.round(media * 10) / 10,
          tendencia,
          gatilhosFrequentes
        })
      }

      return tendencias
    } catch (error: any) {
      console.error('Erro ao obter tendências:', error)
      set({ error: error.message || 'Erro ao obter tendências' })
      return []
    }
  },

  // Legacy methods for backward compatibility
  adicionarNota: (titulo, conteudo, secao, tags = [], imagemUrl) => {
    const id = Date.now().toString()
    const agora = new Date().toISOString()

    set((state) => ({
      notas: [
        ...state.notas,
        {
          id,
          titulo,
          conteudo,
          secao,
          tags,
          dataCriacao: agora,
          dataAtualizacao: agora,
          imagemUrl
        }
      ]
    }))

    return id
  },

  atualizarNota: (id, dados) => set((state) => ({
    notas: state.notas.map((nota) =>
      nota.id === id
        ? {
          ...nota,
          ...dados,
          dataAtualizacao: new Date().toISOString()
        }
        : nota
    )
  })),

  removerNota: (id) => set((state) => ({
    notas: state.notas.filter((nota) => nota.id !== id)
  })),

  adicionarTag: (id, tag) => set((state) => ({
    notas: state.notas.map((nota) =>
      nota.id === id && !nota.tags.includes(tag)
        ? {
          ...nota,
          tags: [...nota.tags, tag],
          dataAtualizacao: new Date().toISOString()
        }
        : nota
    )
  })),

  removerTag: (id, tag) => set((state) => ({
    notas: state.notas.map((nota) =>
      nota.id === id
        ? {
          ...nota,
          tags: nota.tags.filter((t) => t !== tag),
          dataAtualizacao: new Date().toISOString()
        }
        : nota
    )
  })),

  adicionarImagem: (id, imagemUrl) => set((state) => ({
    notas: state.notas.map((nota) =>
      nota.id === id
        ? {
          ...nota,
          imagemUrl,
          dataAtualizacao: new Date().toISOString()
        }
        : nota
    )
  })),

  removerImagem: (id) => set((state) => ({
    notas: state.notas.map((nota) =>
      nota.id === id
        ? {
          ...nota,
          imagemUrl: undefined,
          dataAtualizacao: new Date().toISOString()
        }
        : nota
    )
  })),

  buscarNotas: (termo) => {
    const { notas } = get()
    if (!termo.trim()) return notas

    const termoBusca = termo.toLowerCase()
    return notas.filter((nota) =>
      nota.titulo.toLowerCase().includes(termoBusca) ||
      nota.conteudo.toLowerCase().includes(termoBusca) ||
      nota.tags.some((tag) => tag.toLowerCase().includes(termoBusca))
    )
  },

  alternarModoRefugio: () => set((state) => ({
    modoRefugio: !state.modoRefugio
  })),

  setupRealtimeSync: (userId: string) => {
    return supabaseSync.subscribeToUserData<RegistroAutoconhecimentoDB>(
      'autoconhecimento_registros',
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
