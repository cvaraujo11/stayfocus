import { create } from 'zustand'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { supabaseSync } from '@/app/lib/supabase/sync'
import type { Database } from '@/app/types/database'

// Tipos
export type Categoria = {
  id: string
  nome: string
  cor: string
  icone: string
}

export type Transacao = {
  id: string
  data: string
  valor: number
  descricao: string
  categoriaId: string | null
  tipo: 'receita' | 'despesa'
}

export type Envelope = {
  id: string
  nome: string
  cor: string
  valorAlocado: number
  valorUtilizado: number
}

export type PagamentoRecorrente = {
  id: string
  descricao: string
  valor: number
  dataVencimento: string // dia do mês (1-31)
  categoriaId: string | null
  proximoPagamento: string | null // data do próximo pagamento (YYYY-MM-DD)
  pago: boolean
}

type FinancasState = {
  // Data
  categorias: Categoria[]
  transacoes: Transacao[]
  envelopes: Envelope[]
  pagamentosRecorrentes: PagamentoRecorrente[]

  // UI State
  loading: boolean
  error: string | null

  // Data Loading
  carregarDados: (userId: string) => Promise<void>

  // Categorias
  adicionarCategoria: (nome: string, cor: string, icone: string) => Promise<void>
  atualizarCategoria: (id: string, nome: string, cor: string, icone: string) => Promise<void>
  removerCategoria: (id: string) => Promise<void>

  // Transações
  adicionarTransacao: (data: string, valor: number, descricao: string, categoriaId: string | null, tipo: 'receita' | 'despesa') => Promise<void>
  removerTransacao: (id: string) => Promise<void>

  // Envelopes
  adicionarEnvelope: (nome: string, cor: string, valorAlocado: number) => Promise<void>
  atualizarEnvelope: (id: string, nome: string, cor: string, valorAlocado: number) => Promise<void>
  removerEnvelope: (id: string) => Promise<void>
  registrarGastoEnvelope: (id: string, valor: number) => Promise<void>

  // Pagamentos Recorrentes
  adicionarPagamentoRecorrente: (descricao: string, valor: number, dataVencimento: string, categoriaId: string | null) => Promise<void>
  atualizarPagamentoRecorrente: (id: string, descricao: string, valor: number, dataVencimento: string, categoriaId: string | null) => Promise<void>
  removerPagamentoRecorrente: (id: string) => Promise<void>
  marcarPagamentoComoPago: (id: string, pago: boolean) => Promise<void>

  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void
}

const defaultState = {
  categorias: [],
  transacoes: [],
  envelopes: [],
  pagamentosRecorrentes: [],
  loading: false,
  error: null
}

export const useFinancasStore = create<FinancasState>()((set, get) => ({
  ...defaultState,

  carregarDados: async (userId: string) => {
    set({ loading: true, error: null })
    const supabase = createSupabaseClient()

    try {
      // Fetch categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('financas_categorias')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (categoriasError) throw categoriasError

      // Fetch transacoes
      const { data: transacoesData, error: transacoesError } = await supabase
        .from('financas_transacoes')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })

      if (transacoesError) throw transacoesError

      // Fetch envelopes
      const { data: envelopesData, error: envelopesError } = await supabase
        .from('financas_envelopes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (envelopesError) throw envelopesError

      // Fetch pagamentos recorrentes
      const { data: pagamentosData, error: pagamentosError } = await supabase
        .from('financas_pagamentos_recorrentes')
        .select('*')
        .eq('user_id', userId)
        .order('proximo_pagamento', { ascending: true })

      if (pagamentosError) throw pagamentosError

      // Transform data to match client types
      set({
        categorias: (categoriasData || []).map(cat => ({
          id: cat.id,
          nome: cat.nome,
          cor: cat.cor,
          icone: cat.icone
        })),
        transacoes: (transacoesData || []).map(trans => ({
          id: trans.id,
          data: trans.data,
          valor: trans.valor,
          descricao: trans.descricao,
          categoriaId: trans.categoria_id,
          tipo: trans.tipo as 'receita' | 'despesa'
        })),
        envelopes: (envelopesData || []).map(env => ({
          id: env.id,
          nome: env.nome,
          cor: env.cor,
          valorAlocado: env.valor_alocado,
          valorUtilizado: env.valor_utilizado
        })),
        pagamentosRecorrentes: (pagamentosData || []).map(pag => ({
          id: pag.id,
          descricao: pag.descricao,
          valor: pag.valor,
          dataVencimento: pag.data_vencimento,
          categoriaId: pag.categoria_id,
          proximoPagamento: pag.proximo_pagamento,
          pago: pag.pago
        })),
        loading: false
      })
    } catch (error: any) {
      console.error('Error loading financial data:', error)
      set({
        error: 'Erro ao carregar dados financeiros. Tente novamente.',
        loading: false
      })
    }
  },

  adicionarCategoria: async (nome: string, cor: string, icone: string) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    try {
      const { data, error } = await supabase
        .from('financas_categorias')
        .insert({
          user_id: user.id,
          nome,
          cor,
          icone
        })
        .select()
        .single()

      if (error) throw error

      const novaCategoria: Categoria = {
        id: data.id,
        nome: data.nome,
        cor: data.cor,
        icone: data.icone
      }

      set(state => ({
        categorias: [...state.categorias, novaCategoria],
        error: null
      }))
    } catch (error: any) {
      console.error('Error adding category:', error)
      set({ error: 'Erro ao adicionar categoria. Tente novamente.' })
    }
  },

  atualizarCategoria: async (id: string, nome: string, cor: string, icone: string) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    try {
      const { error } = await supabase
        .from('financas_categorias')
        .update({ nome, cor, icone })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set(state => ({
        categorias: state.categorias.map(cat =>
          cat.id === id ? { ...cat, nome, cor, icone } : cat
        ),
        error: null
      }))
    } catch (error: any) {
      console.error('Error updating category:', error)
      set({ error: 'Erro ao atualizar categoria. Tente novamente.' })
    }
  },

  removerCategoria: async (id: string) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    try {
      // Delete will cascade to transacoes and pagamentos (SET NULL)
      const { error } = await supabase
        .from('financas_categorias')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set(state => ({
        categorias: state.categorias.filter(cat => cat.id !== id),
        // Update transacoes and pagamentos to set categoriaId to null
        transacoes: state.transacoes.map(trans =>
          trans.categoriaId === id ? { ...trans, categoriaId: null } : trans
        ),
        pagamentosRecorrentes: state.pagamentosRecorrentes.map(pag =>
          pag.categoriaId === id ? { ...pag, categoriaId: null } : pag
        ),
        error: null
      }))
    } catch (error: any) {
      console.error('Error removing category:', error)
      set({ error: 'Erro ao remover categoria. Tente novamente.' })
    }
  },

  adicionarTransacao: async (data: string, valor: number, descricao: string, categoriaId: string | null, tipo: 'receita' | 'despesa') => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    try {
      const { data: transacaoData, error } = await supabase
        .from('financas_transacoes')
        .insert({
          user_id: user.id,
          data,
          valor,
          descricao,
          categoria_id: categoriaId,
          tipo
        })
        .select()
        .single()

      if (error) throw error

      const novaTransacao: Transacao = {
        id: transacaoData.id,
        data: transacaoData.data,
        valor: transacaoData.valor,
        descricao: transacaoData.descricao,
        categoriaId: transacaoData.categoria_id,
        tipo: transacaoData.tipo as 'receita' | 'despesa'
      }

      set(state => ({
        transacoes: [novaTransacao, ...state.transacoes],
        error: null
      }))
    } catch (error: any) {
      console.error('Error adding transaction:', error)
      if (error.code === '23503') {
        set({ error: 'Categoria inválida.' })
      } else {
        set({ error: 'Erro ao adicionar transação. Tente novamente.' })
      }
    }
  },

  removerTransacao: async (id: string) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    try {
      const { error } = await supabase
        .from('financas_transacoes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set(state => ({
        transacoes: state.transacoes.filter(trans => trans.id !== id),
        error: null
      }))
    } catch (error: any) {
      console.error('Error removing transaction:', error)
      set({ error: 'Erro ao remover transação. Tente novamente.' })
    }
  },

  adicionarEnvelope: async (nome: string, cor: string, valorAlocado: number) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    try {
      const { data, error } = await supabase
        .from('financas_envelopes')
        .insert({
          user_id: user.id,
          nome,
          cor,
          valor_alocado: valorAlocado,
          valor_utilizado: 0
        })
        .select()
        .single()

      if (error) throw error

      const novoEnvelope: Envelope = {
        id: data.id,
        nome: data.nome,
        cor: data.cor,
        valorAlocado: data.valor_alocado,
        valorUtilizado: data.valor_utilizado
      }

      set(state => ({
        envelopes: [...state.envelopes, novoEnvelope],
        error: null
      }))
    } catch (error: any) {
      console.error('Error adding envelope:', error)
      if (error.code === '23514') {
        set({ error: 'Valores devem ser não-negativos.' })
      } else {
        set({ error: 'Erro ao adicionar envelope. Tente novamente.' })
      }
    }
  },

  atualizarEnvelope: async (id: string, nome: string, cor: string, valorAlocado: number) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    try {
      const { error } = await supabase
        .from('financas_envelopes')
        .update({
          nome,
          cor,
          valor_alocado: valorAlocado
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set(state => ({
        envelopes: state.envelopes.map(env =>
          env.id === id ? { ...env, nome, cor, valorAlocado } : env
        ),
        error: null
      }))
    } catch (error: any) {
      console.error('Error updating envelope:', error)
      if (error.code === '23514') {
        set({ error: 'Valores devem ser não-negativos.' })
      } else {
        set({ error: 'Erro ao atualizar envelope. Tente novamente.' })
      }
    }
  },

  removerEnvelope: async (id: string) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    try {
      const { error } = await supabase
        .from('financas_envelopes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set(state => ({
        envelopes: state.envelopes.filter(env => env.id !== id),
        error: null
      }))
    } catch (error: any) {
      console.error('Error removing envelope:', error)
      set({ error: 'Erro ao remover envelope. Tente novamente.' })
    }
  },

  registrarGastoEnvelope: async (id: string, valor: number) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    const state = get()
    const envelope = state.envelopes.find(env => env.id === id)

    if (!envelope) {
      set({ error: 'Envelope não encontrado' })
      return
    }

    const novoValorUtilizado = envelope.valorUtilizado + valor

    try {
      const { error } = await supabase
        .from('financas_envelopes')
        .update({
          valor_utilizado: novoValorUtilizado
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set(state => ({
        envelopes: state.envelopes.map(env =>
          env.id === id ? { ...env, valorUtilizado: novoValorUtilizado } : env
        ),
        error: null
      }))
    } catch (error: any) {
      console.error('Error registering envelope expense:', error)
      if (error.code === '23514') {
        set({ error: 'Valores devem ser não-negativos.' })
      } else {
        set({ error: 'Erro ao registrar gasto. Tente novamente.' })
      }
    }
  },

  adicionarPagamentoRecorrente: async (descricao: string, valor: number, dataVencimento: string, categoriaId: string | null) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    // Calculate next payment date
    const hoje = new Date()
    const dia = parseInt(dataVencimento)
    const proximoPagamento = new Date(hoje.getFullYear(), hoje.getMonth(), dia)

    // If the day has already passed this month, advance to next month
    if (proximoPagamento.getDate() < hoje.getDate()) {
      proximoPagamento.setMonth(proximoPagamento.getMonth() + 1)
    }

    try {
      const { data, error } = await supabase
        .from('financas_pagamentos_recorrentes')
        .insert({
          user_id: user.id,
          descricao,
          valor,
          data_vencimento: dataVencimento,
          categoria_id: categoriaId,
          proximo_pagamento: proximoPagamento.toISOString().split('T')[0],
          pago: false
        })
        .select()
        .single()

      if (error) throw error

      const novoPagamento: PagamentoRecorrente = {
        id: data.id,
        descricao: data.descricao,
        valor: data.valor,
        dataVencimento: data.data_vencimento,
        categoriaId: data.categoria_id,
        proximoPagamento: data.proximo_pagamento,
        pago: data.pago
      }

      set(state => ({
        pagamentosRecorrentes: [...state.pagamentosRecorrentes, novoPagamento],
        error: null
      }))
    } catch (error: any) {
      console.error('Error adding recurring payment:', error)
      if (error.code === '23503') {
        set({ error: 'Categoria inválida.' })
      } else {
        set({ error: 'Erro ao adicionar pagamento recorrente. Tente novamente.' })
      }
    }
  },

  atualizarPagamentoRecorrente: async (id: string, descricao: string, valor: number, dataVencimento: string, categoriaId: string | null) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    try {
      const { error } = await supabase
        .from('financas_pagamentos_recorrentes')
        .update({
          descricao,
          valor,
          data_vencimento: dataVencimento,
          categoria_id: categoriaId
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set(state => ({
        pagamentosRecorrentes: state.pagamentosRecorrentes.map(pag =>
          pag.id === id ? { ...pag, descricao, valor, dataVencimento, categoriaId } : pag
        ),
        error: null
      }))
    } catch (error: any) {
      console.error('Error updating recurring payment:', error)
      if (error.code === '23503') {
        set({ error: 'Categoria inválida.' })
      } else {
        set({ error: 'Erro ao atualizar pagamento recorrente. Tente novamente.' })
      }
    }
  },

  removerPagamentoRecorrente: async (id: string) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    try {
      const { error } = await supabase
        .from('financas_pagamentos_recorrentes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set(state => ({
        pagamentosRecorrentes: state.pagamentosRecorrentes.filter(pag => pag.id !== id),
        error: null
      }))
    } catch (error: any) {
      console.error('Error removing recurring payment:', error)
      set({ error: 'Erro ao remover pagamento recorrente. Tente novamente.' })
    }
  },

  marcarPagamentoComoPago: async (id: string, pago: boolean) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    const state = get()
    const pagamento = state.pagamentosRecorrentes.find(pag => pag.id === id)

    if (!pagamento) {
      set({ error: 'Pagamento não encontrado' })
      return
    }

    let proximoPagamento = pagamento.proximoPagamento

    if (pago) {
      // Calculate next payment date
      const dataAtual = new Date()
      const dia = parseInt(pagamento.dataVencimento)
      let proximoMes = dataAtual.getMonth() + 1
      let proximoAno = dataAtual.getFullYear()

      if (proximoMes > 11) {
        proximoMes = 0
        proximoAno++
      }

      const proximoPagamentoDate = new Date(proximoAno, proximoMes, dia)
      proximoPagamento = proximoPagamentoDate.toISOString().split('T')[0]
    }

    try {
      const { error } = await supabase
        .from('financas_pagamentos_recorrentes')
        .update({
          pago,
          proximo_pagamento: proximoPagamento
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set(state => ({
        pagamentosRecorrentes: state.pagamentosRecorrentes.map(pag =>
          pag.id === id ? { ...pag, pago, proximoPagamento } : pag
        ),
        error: null
      }))
    } catch (error: any) {
      console.error('Error marking payment as paid:', error)
      set({ error: 'Erro ao atualizar status do pagamento. Tente novamente.' })
    }
  },

  setupRealtimeSync: (userId: string) => {
    type FinancasCategoria = Database['public']['Tables']['financas_categorias']['Row']
    type FinancasTransacao = Database['public']['Tables']['financas_transacoes']['Row']
    type FinancasEnvelope = Database['public']['Tables']['financas_envelopes']['Row']
    type FinancasPagamento = Database['public']['Tables']['financas_pagamentos_recorrentes']['Row']

    // Subscribe to categorias changes
    const cleanupCategorias = supabaseSync.subscribeToUserData<FinancasCategoria>(
      'financas_categorias',
      userId,
      (newCat) => {
        const categoria: Categoria = {
          id: newCat.id,
          nome: newCat.nome,
          cor: newCat.cor,
          icone: newCat.icone
        }
        set(state => ({ categorias: [...state.categorias, categoria] }))
      },
      (updated) => {
        const categoria: Categoria = {
          id: updated.id,
          nome: updated.nome,
          cor: updated.cor,
          icone: updated.icone
        }
        set(state => ({
          categorias: state.categorias.map(cat =>
            cat.id === updated.id ? categoria : cat
          )
        }))
      },
      (deleted) => {
        set(state => ({
          categorias: state.categorias.filter(cat => cat.id !== deleted.id),
          // Update related records
          transacoes: state.transacoes.map(trans =>
            trans.categoriaId === deleted.id ? { ...trans, categoriaId: null } : trans
          ),
          pagamentosRecorrentes: state.pagamentosRecorrentes.map(pag =>
            pag.categoriaId === deleted.id ? { ...pag, categoriaId: null } : pag
          )
        }))
      }
    )

    // Subscribe to transacoes changes
    const cleanupTransacoes = supabaseSync.subscribeToUserData<FinancasTransacao>(
      'financas_transacoes',
      userId,
      (newTrans) => {
        const transacao: Transacao = {
          id: newTrans.id,
          data: newTrans.data,
          valor: newTrans.valor,
          descricao: newTrans.descricao,
          categoriaId: newTrans.categoria_id,
          tipo: newTrans.tipo as 'receita' | 'despesa'
        }
        set(state => ({ transacoes: [transacao, ...state.transacoes] }))
      },
      (updated) => {
        const transacao: Transacao = {
          id: updated.id,
          data: updated.data,
          valor: updated.valor,
          descricao: updated.descricao,
          categoriaId: updated.categoria_id,
          tipo: updated.tipo as 'receita' | 'despesa'
        }
        set(state => ({
          transacoes: state.transacoes.map(trans =>
            trans.id === updated.id ? transacao : trans
          )
        }))
      },
      (deleted) => {
        set(state => ({
          transacoes: state.transacoes.filter(trans => trans.id !== deleted.id)
        }))
      }
    )

    // Subscribe to envelopes changes
    const cleanupEnvelopes = supabaseSync.subscribeToUserData<FinancasEnvelope>(
      'financas_envelopes',
      userId,
      (newEnv) => {
        const envelope: Envelope = {
          id: newEnv.id,
          nome: newEnv.nome,
          cor: newEnv.cor,
          valorAlocado: newEnv.valor_alocado,
          valorUtilizado: newEnv.valor_utilizado
        }
        set(state => ({ envelopes: [...state.envelopes, envelope] }))
      },
      (updated) => {
        const envelope: Envelope = {
          id: updated.id,
          nome: updated.nome,
          cor: updated.cor,
          valorAlocado: updated.valor_alocado,
          valorUtilizado: updated.valor_utilizado
        }
        set(state => ({
          envelopes: state.envelopes.map(env =>
            env.id === updated.id ? envelope : env
          )
        }))
      },
      (deleted) => {
        set(state => ({
          envelopes: state.envelopes.filter(env => env.id !== deleted.id)
        }))
      }
    )

    // Subscribe to pagamentos recorrentes changes
    const cleanupPagamentos = supabaseSync.subscribeToUserData<FinancasPagamento>(
      'financas_pagamentos_recorrentes',
      userId,
      (newPag) => {
        const pagamento: PagamentoRecorrente = {
          id: newPag.id,
          descricao: newPag.descricao,
          valor: newPag.valor,
          dataVencimento: newPag.data_vencimento,
          categoriaId: newPag.categoria_id,
          proximoPagamento: newPag.proximo_pagamento,
          pago: newPag.pago
        }
        set(state => ({ pagamentosRecorrentes: [...state.pagamentosRecorrentes, pagamento] }))
      },
      (updated) => {
        const pagamento: PagamentoRecorrente = {
          id: updated.id,
          descricao: updated.descricao,
          valor: updated.valor,
          dataVencimento: updated.data_vencimento,
          categoriaId: updated.categoria_id,
          proximoPagamento: updated.proximo_pagamento,
          pago: updated.pago
        }
        set(state => ({
          pagamentosRecorrentes: state.pagamentosRecorrentes.map(pag =>
            pag.id === updated.id ? pagamento : pag
          )
        }))
      },
      (deleted) => {
        set(state => ({
          pagamentosRecorrentes: state.pagamentosRecorrentes.filter(pag => pag.id !== deleted.id)
        }))
      }
    )

    // Return cleanup function that unsubscribes from all channels
    return () => {
      cleanupCategorias()
      cleanupTransacoes()
      cleanupEnvelopes()
      cleanupPagamentos()
    }
  }
}))
