// stores/receitasStore.ts
import { create } from 'zustand';
import { supabase } from '@/app/lib/supabase/client';
import { supabaseSync } from '@/app/lib/supabase/sync';
import type { Database } from '@/app/types/database';

// Database types
type ReceitaRow = Database['public']['Tables']['receitas']['Row'];
type ReceitaInsert = Database['public']['Tables']['receitas']['Insert'];
type ReceitaUpdate = Database['public']['Tables']['receitas']['Update'];
type ListaComprasRow = Database['public']['Tables']['lista_compras']['Row'];
type ListaComprasInsert = Database['public']['Tables']['lista_compras']['Insert'];
type ListaComprasUpdate = Database['public']['Tables']['lista_compras']['Update'];

// Ingrediente interface for JSONB structure
export interface Ingrediente {
  nome: string;
  quantidade: number;
  unidade: string;
}

// Client-side Receita interface (mapped from database)
export interface Receita {
  id: string;
  nome: string;
  descricao: string;
  categorias: string[];
  tags: string[];
  tempoPreparo: number;
  porcoes: number;
  calorias: string;
  imagem: string | null;
  ingredientes: Ingrediente[];
  passos: string[];
  favorita: boolean;
}

// Lista de compras item
export interface ItemListaCompras {
  id: string;
  item: string;
  quantidade: string | null;
  categoria: string | null;
  comprado: boolean;
  created_at: string;
}

interface ReceitasStore {
  // Data
  receitas: Receita[];
  listaCompras: ItemListaCompras[];
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Receitas Actions
  carregarReceitas: (userId: string) => Promise<void>;
  adicionarReceita: (receita: Omit<Receita, 'id' | 'favorita'>) => Promise<void>;
  atualizarReceita: (id: string, updates: Partial<Omit<Receita, 'id'>>) => Promise<void>;
  removerReceita: (id: string) => Promise<void>;
  marcarFavorita: (id: string, favorita: boolean) => Promise<void>;
  obterReceitaPorId: (id: string) => Receita | undefined;
  
  // Lista de Compras Actions
  carregarListaCompras: (userId: string) => Promise<void>;
  adicionarItemLista: (item: Omit<ItemListaCompras, 'id' | 'created_at'>) => Promise<void>;
  atualizarItemLista: (id: string, updates: Partial<Omit<ItemListaCompras, 'id' | 'created_at'>>) => Promise<void>;
  removerItemLista: (id: string) => Promise<void>;
  marcarItemComprado: (id: string, comprado: boolean) => Promise<void>;
  limparItensComprados: () => Promise<void>;
  adicionarIngredientesNaLista: (receita: Receita, porcoes?: number) => Promise<void>;
  
  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void;
}

// Helper function to map database row to client Receita
function mapReceitaFromDB(row: ReceitaRow): Receita {
  const ingredientes = row.ingredientes as Ingrediente[] | null;
  
  return {
    id: row.id,
    nome: row.titulo,
    descricao: row.modo_preparo,
    categorias: row.categoria ? [row.categoria] : [],
    tags: [],
    tempoPreparo: row.tempo_preparo_minutos || 0,
    porcoes: row.porcoes || 1,
    calorias: '',
    imagem: row.foto_url,
    ingredientes: ingredientes || [],
    passos: row.modo_preparo ? row.modo_preparo.split('\n').filter(p => p.trim()) : [],
    favorita: row.favorita,
  };
}

// Helper function to map client Receita to database insert
function mapReceitaToDB(receita: Omit<Receita, 'id' | 'favorita'>, userId: string, fotoUrl?: string | null): ReceitaInsert {
  return {
    user_id: userId,
    titulo: receita.nome,
    ingredientes: receita.ingredientes as any,
    modo_preparo: receita.descricao || receita.passos.join('\n'),
    tempo_preparo_minutos: receita.tempoPreparo,
    porcoes: receita.porcoes,
    categoria: receita.categorias[0] || null,
    foto_url: fotoUrl || null,
    favorita: false,
  };
}

// Helper function to map lista compras from DB
function mapListaComprasFromDB(row: ListaComprasRow): ItemListaCompras {
  return {
    id: row.id,
    item: row.item,
    quantidade: row.quantidade,
    categoria: row.categoria,
    comprado: row.comprado,
    created_at: row.created_at,
  };
}

export const useReceitasStore = create<ReceitasStore>((set, get) => ({
  // Initial state
  receitas: [],
  listaCompras: [],
  loading: false,
  error: null,
  
  // Load receitas from Supabase
  carregarReceitas: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const receitas = (data || []).map(mapReceitaFromDB);
      set({ receitas, loading: false });
    } catch (error) {
      console.error('Error loading receitas:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar receitas',
        loading: false 
      });
    }
  },
  
  // Add new receita
  adicionarReceita: async (receita: Omit<Receita, 'id' | 'favorita'>) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      // Insert receita without photo
      const receitaData = mapReceitaToDB(receita, user.id, null);
      const { data, error } = await supabase
        .from('receitas')
        .insert(receitaData)
        .select()
        .single();
      
      if (error) throw error;
      
      const novaReceita = mapReceitaFromDB(data);
      set(state => ({ 
        receitas: [novaReceita, ...state.receitas],
        loading: false 
      }));
    } catch (error) {
      console.error('Error adding receita:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao adicionar receita',
        loading: false 
      });
      throw error;
    }
  },
  
  // Update receita
  atualizarReceita: async (id: string, updates: Partial<Omit<Receita, 'id'>>) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const receitaAtual = get().receitas.find(r => r.id === id);
      if (!receitaAtual) throw new Error('Receita não encontrada');
      
      // Prepare update data
      const updateData: ReceitaUpdate = {};
      if (updates.nome !== undefined) updateData.titulo = updates.nome;
      if (updates.ingredientes !== undefined) updateData.ingredientes = updates.ingredientes as any;
      if (updates.descricao !== undefined || updates.passos !== undefined) {
        updateData.modo_preparo = updates.descricao || updates.passos?.join('\n');
      }
      if (updates.tempoPreparo !== undefined) updateData.tempo_preparo_minutos = updates.tempoPreparo;
      if (updates.porcoes !== undefined) updateData.porcoes = updates.porcoes;
      if (updates.categorias !== undefined) updateData.categoria = updates.categorias[0] || null;
      if (updates.favorita !== undefined) updateData.favorita = updates.favorita;
      
      const { data, error } = await supabase
        .from('receitas')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      const receitaAtualizada = mapReceitaFromDB(data);
      set(state => ({
        receitas: state.receitas.map(r => r.id === id ? receitaAtualizada : r),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating receita:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar receita',
        loading: false 
      });
      throw error;
    }
  },
  
  // Remove receita
  removerReceita: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      set(state => ({
        receitas: state.receitas.filter(r => r.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error removing receita:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao remover receita',
        loading: false 
      });
      throw error;
    }
  },
  
  // Toggle favorita
  marcarFavorita: async (id, favorita) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('receitas')
        .update({ favorita })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      set(state => ({
        receitas: state.receitas.map(r => 
          r.id === id ? { ...r, favorita } : r
        )
      }));
    } catch (error) {
      console.error('Error toggling favorita:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao marcar favorita' });
      throw error;
    }
  },
  
  // Get receita by ID
  obterReceitaPorId: (id) => {
    return get().receitas.find(r => r.id === id);
  },
  
  // Load lista de compras
  carregarListaCompras: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('lista_compras')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const listaCompras = (data || []).map(mapListaComprasFromDB);
      set({ listaCompras, loading: false });
    } catch (error) {
      console.error('Error loading lista compras:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar lista de compras',
        loading: false 
      });
    }
  },
  
  // Add item to lista de compras
  adicionarItemLista: async (item) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('lista_compras')
        .insert({
          user_id: user.id,
          item: item.item,
          quantidade: item.quantidade,
          categoria: item.categoria,
          comprado: item.comprado,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const novoItem = mapListaComprasFromDB(data);
      set(state => ({ 
        listaCompras: [novoItem, ...state.listaCompras]
      }));
    } catch (error) {
      console.error('Error adding item to lista:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao adicionar item' });
      throw error;
    }
  },
  
  // Update item in lista de compras
  atualizarItemLista: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('lista_compras')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      const itemAtualizado = mapListaComprasFromDB(data);
      set(state => ({
        listaCompras: state.listaCompras.map(item => 
          item.id === id ? itemAtualizado : item
        )
      }));
    } catch (error) {
      console.error('Error updating item:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar item' });
      throw error;
    }
  },
  
  // Remove item from lista de compras
  removerItemLista: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('lista_compras')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      set(state => ({
        listaCompras: state.listaCompras.filter(item => item.id !== id)
      }));
    } catch (error) {
      console.error('Error removing item:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao remover item' });
      throw error;
    }
  },
  
  // Mark item as comprado
  marcarItemComprado: async (id, comprado) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('lista_compras')
        .update({ comprado })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      set(state => ({
        listaCompras: state.listaCompras.map(item => 
          item.id === id ? { ...item, comprado } : item
        )
      }));
    } catch (error) {
      console.error('Error marking item:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao marcar item' });
      throw error;
    }
  },
  
  // Clear completed items
  limparItensComprados: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const itensComprados = get().listaCompras.filter(item => item.comprado);
      const ids = itensComprados.map(item => item.id);
      
      if (ids.length === 0) return;
      
      const { error } = await supabase
        .from('lista_compras')
        .delete()
        .in('id', ids)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      set(state => ({
        listaCompras: state.listaCompras.filter(item => !item.comprado)
      }));
    } catch (error) {
      console.error('Error clearing items:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao limpar itens' });
      throw error;
    }
  },
  
  // Add ingredients from receita to lista de compras
  adicionarIngredientesNaLista: async (receita, porcoes) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const fatorMultiplicacao = porcoes ? porcoes / receita.porcoes : 1;
      
      const itens: ListaComprasInsert[] = receita.ingredientes.map(ing => ({
        user_id: user.id,
        item: ing.nome,
        quantidade: `${(ing.quantidade * fatorMultiplicacao).toFixed(1)} ${ing.unidade}`,
        categoria: receita.categorias[0] || null,
        comprado: false,
      }));
      
      const { data, error } = await supabase
        .from('lista_compras')
        .insert(itens)
        .select();
      
      if (error) throw error;
      
      const novosItens = (data || []).map(mapListaComprasFromDB);
      set(state => ({ 
        listaCompras: [...novosItens, ...state.listaCompras]
      }));
    } catch (error) {
      console.error('Error adding ingredients to lista:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao adicionar ingredientes' });
      throw error;
    }
  },
  
  // Setup real-time sync
  setupRealtimeSync: (userId: string) => {
    const cleanupReceitas = supabaseSync.subscribeToUserData<ReceitaRow>(
      'receitas',
      userId,
      (newReceita) => {
        const receita = mapReceitaFromDB(newReceita);
        set(state => ({ 
          receitas: [receita, ...state.receitas.filter(r => r.id !== receita.id)]
        }));
      },
      (updatedReceita) => {
        const receita = mapReceitaFromDB(updatedReceita);
        set(state => ({
          receitas: state.receitas.map(r => r.id === receita.id ? receita : r)
        }));
      },
      (deleted) => {
        set(state => ({
          receitas: state.receitas.filter(r => r.id !== deleted.id)
        }));
      }
    );
    
    const cleanupLista = supabaseSync.subscribeToUserData<ListaComprasRow>(
      'lista_compras',
      userId,
      (newItem) => {
        const item = mapListaComprasFromDB(newItem);
        set(state => ({ 
          listaCompras: [item, ...state.listaCompras.filter(i => i.id !== item.id)]
        }));
      },
      (updatedItem) => {
        const item = mapListaComprasFromDB(updatedItem);
        set(state => ({
          listaCompras: state.listaCompras.map(i => i.id === item.id ? item : i)
        }));
      },
      (deleted) => {
        set(state => ({
          listaCompras: state.listaCompras.filter(i => i.id !== deleted.id)
        }));
      }
    );
    
    // Return cleanup function
    return () => {
      cleanupReceitas();
      cleanupLista();
    };
  },
}));
