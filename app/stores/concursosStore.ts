import { create } from 'zustand';
import { createSupabaseClient } from '@/app/lib/supabase/client';
import { supabaseSync } from '@/app/lib/supabase/sync';
import type { Database } from '@/app/types/database';

// Type for database row
type ConcursoRow = Database['public']['Tables']['estudos_concursos']['Row'];

// Legacy interface for backward compatibility
export interface ConteudoProgramatico {
  disciplina: string;
  topicos: string[];
  progresso: number;
}

// Client-side interface (matches legacy structure)
export interface Concurso {
  id: string;
  titulo: string;
  organizadora: string;
  dataInscricao: string;
  dataProva: string;
  edital?: string;
  status: 'planejado' | 'inscrito' | 'estudando' | 'realizado' | 'aguardando_resultado';
  conteudoProgramatico: ConteudoProgramatico[];
}

// Map database status to client status
const mapDbStatusToClient = (dbStatus: 'em_andamento' | 'concluido' | 'cancelado'): Concurso['status'] => {
  switch (dbStatus) {
    case 'em_andamento':
      return 'estudando';
    case 'concluido':
      return 'realizado';
    case 'cancelado':
      return 'planejado';
    default:
      return 'planejado';
  }
};

// Map client status to database status
const mapClientStatusToDb = (clientStatus: Concurso['status']): 'em_andamento' | 'concluido' | 'cancelado' => {
  switch (clientStatus) {
    case 'estudando':
    case 'inscrito':
      return 'em_andamento';
    case 'realizado':
    case 'aguardando_resultado':
      return 'concluido';
    case 'planejado':
    default:
      return 'em_andamento';
  }
};

// Transform database row to client Concurso
const transformDbToConcurso = (row: ConcursoRow): Concurso => {
  // Parse conteudoProgramatico from disciplinas array
  const disciplinas = row.disciplinas || [];
  const conteudoProgramatico: ConteudoProgramatico[] = disciplinas.map(d => ({
    disciplina: d,
    topicos: [],
    progresso: 0
  }));

  return {
    id: row.id,
    titulo: row.nome,
    organizadora: row.instituicao || '',
    dataInscricao: row.created_at.split('T')[0], // Use created_at as fallback
    dataProva: row.data_prova || '',
    edital: undefined, // Not stored in database
    status: mapDbStatusToClient(row.status as 'em_andamento' | 'concluido' | 'cancelado'),
    conteudoProgramatico
  };
};

interface ConcursosStore {
  concursos: Concurso[];
  loading: boolean;
  error: string | null;

  // Actions
  carregarConcursos: (userId: string, statusFilter?: 'em_andamento' | 'concluido' | 'cancelado') => Promise<void>;
  adicionarConcurso: (concurso: Omit<Concurso, 'id'>) => Promise<void>;
  removerConcurso: (id: string) => Promise<void>;
  atualizarConcurso: (id: string, concurso: Partial<Concurso>) => Promise<void>;
  alterarStatus: (id: string, status: Concurso['status']) => Promise<void>;
  atualizarProgresso: (concursoId: string, disciplina: string, novoProgresso: number) => void;

  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void;
}

export const useConcursosStore = create<ConcursosStore>((set, get) => ({
  concursos: [],
  loading: false,
  error: null,

  carregarConcursos: async (userId: string, statusFilter?: 'em_andamento' | 'concluido' | 'cancelado') => {
    set({ loading: true, error: null });
    try {
      const supabase = createSupabaseClient();

      let query = supabase
        .from('estudos_concursos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply status filter if provided
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const concursos = (data || []).map(transformDbToConcurso);
      set({ concursos, loading: false });
    } catch (error: any) {
      console.error('Error loading concursos:', error);
      set({ error: error.message || 'Erro ao carregar concursos', loading: false });
    }
  },

  adicionarConcurso: async (novoConcurso) => {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Extract disciplinas from conteudoProgramatico
      const disciplinas = novoConcurso.conteudoProgramatico.map(c => c.disciplina);

      const { data, error } = await supabase
        .from('estudos_concursos')
        .insert({
          user_id: user.id,
          nome: novoConcurso.titulo,
          instituicao: novoConcurso.organizadora,
          data_prova: novoConcurso.dataProva,
          cargo: null,
          disciplinas: disciplinas,
          status: mapClientStatusToDb(novoConcurso.status || 'planejado')
        })
        .select()
        .single();

      if (error) throw error;

      const concurso = transformDbToConcurso(data);
      set(state => ({ concursos: [concurso, ...state.concursos] }));
    } catch (error: any) {
      console.error('Error adding concurso:', error);
      set({ error: error.message || 'Erro ao adicionar concurso' });
      throw error;
    }
  },

  removerConcurso: async (id: string) => {
    try {
      const supabase = createSupabaseClient();

      // This will cascade delete related questoes
      const { error } = await supabase
        .from('estudos_concursos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        concursos: state.concursos.filter(c => c.id !== id)
      }));
    } catch (error: any) {
      console.error('Error removing concurso:', error);
      set({ error: error.message || 'Erro ao remover concurso' });
      throw error;
    }
  },

  atualizarConcurso: async (id: string, dadosAtualizados: Partial<Concurso>) => {
    try {
      const supabase = createSupabaseClient();

      // Build update object
      const updateData: any = {};

      if (dadosAtualizados.titulo !== undefined) {
        updateData.nome = dadosAtualizados.titulo;
      }
      if (dadosAtualizados.organizadora !== undefined) {
        updateData.instituicao = dadosAtualizados.organizadora;
      }
      if (dadosAtualizados.dataProva !== undefined) {
        updateData.data_prova = dadosAtualizados.dataProva;
      }
      if (dadosAtualizados.status !== undefined) {
        updateData.status = mapClientStatusToDb(dadosAtualizados.status);
      }
      if (dadosAtualizados.conteudoProgramatico !== undefined) {
        updateData.disciplinas = dadosAtualizados.conteudoProgramatico.map(c => c.disciplina);
      }

      const { data, error } = await supabase
        .from('estudos_concursos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const concursoAtualizado = transformDbToConcurso(data);

      set(state => ({
        concursos: state.concursos.map(c =>
          c.id === id ? { ...c, ...concursoAtualizado } : c
        )
      }));
    } catch (error: any) {
      console.error('Error updating concurso:', error);
      set({ error: error.message || 'Erro ao atualizar concurso' });
      throw error;
    }
  },

  alterarStatus: async (id: string, status: Concurso['status']) => {
    try {
      const supabase = createSupabaseClient();

      const { data, error } = await supabase
        .from('estudos_concursos')
        .update({ status: mapClientStatusToDb(status) })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const concursoAtualizado = transformDbToConcurso(data);

      set(state => ({
        concursos: state.concursos.map(c =>
          c.id === id ? { ...c, status: concursoAtualizado.status } : c
        )
      }));
    } catch (error: any) {
      console.error('Error changing status:', error);
      set({ error: error.message || 'Erro ao alterar status' });
      throw error;
    }
  },

  // Note: Progress is stored client-side only for now
  // In a future iteration, this could be stored in a separate table
  atualizarProgresso: (concursoId: string, disciplina: string, novoProgresso: number) => {
    set(state => ({
      concursos: state.concursos.map(concurso =>
        concurso.id === concursoId
          ? {
            ...concurso,
            conteudoProgramatico: concurso.conteudoProgramatico.map(c =>
              c.disciplina === disciplina
                ? { ...c, progresso: novoProgresso }
                : c
            )
          }
          : concurso
      )
    }));
  },

  setupRealtimeSync: (userId: string) => {
    return supabaseSync.subscribeToUserData<ConcursoRow>(
      'estudos_concursos',
      userId,
      (newConcurso) => {
        const concurso = transformDbToConcurso(newConcurso);
        set(state => {
          // Check if already exists
          const exists = state.concursos.some(c => c.id === concurso.id);
          if (exists) return state;
          return { concursos: [concurso, ...state.concursos] };
        });
      },
      (updatedConcurso) => {
        const concurso = transformDbToConcurso(updatedConcurso);
        set(state => ({
          concursos: state.concursos.map(c =>
            c.id === concurso.id ? { ...c, ...concurso } : c
          )
        }));
      },
      (deleted) => {
        set(state => ({
          concursos: state.concursos.filter(c => c.id !== deleted.id)
        }));
      }
    );
  }
}));
