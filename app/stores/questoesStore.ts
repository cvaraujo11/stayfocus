import { create } from 'zustand';
import { createSupabaseClient } from '@/app/lib/supabase/client';
import { supabaseSync } from '@/app/lib/supabase/sync';
import type { Database } from '@/app/types/database';

// Type for database row
type QuestaoRow = Database['public']['Tables']['estudos_questoes']['Row'];

export interface Alternativa {
  id: string;
  texto: string;
  correta: boolean;
}

export interface Questao {
  id: string;
  concursoId?: string; // Para vincular a um concurso específico, se aplicável
  disciplina: string;
  topico: string;
  enunciado: string;
  alternativas: Alternativa[];
  respostaCorreta: string; // ID da alternativa correta
  justificativa?: string;
  nivelDificuldade?: 'facil' | 'medio' | 'dificil';
  ano?: number;
  banca?: string;
  tags?: string[];
  respondida?: boolean; // Para controle em simulados
  respostaUsuario?: string; // ID da alternativa escolhida pelo usuário
  acertou?: boolean; // Resultado da resposta do usuário
}

// Transform database row to client Questao
const transformDbToQuestao = (row: QuestaoRow): Questao => {
  // Parse alternativas from JSONB
  const alternativas = (row.alternativas as any) as Alternativa[];
  
  return {
    id: row.id,
    concursoId: row.concurso_id || undefined,
    disciplina: row.disciplina,
    topico: '', // Not stored in database, kept for backward compatibility
    enunciado: row.enunciado,
    alternativas: alternativas,
    respostaCorreta: row.resposta_correta,
    justificativa: row.explicacao || undefined,
    nivelDificuldade: undefined, // Not stored in database
    ano: undefined, // Not stored in database
    banca: undefined, // Not stored in database
    tags: row.tags || [],
    respondida: false, // Client-side only
    respostaUsuario: undefined, // Client-side only
    acertou: undefined // Client-side only
  };
};

interface QuestoesStore {
  questoes: Questao[];
  loading: boolean;
  error: string | null;
  
  // Actions
  carregarQuestoes: (userId: string, concursoId?: string, disciplina?: string) => Promise<void>;
  adicionarQuestao: (questao: Omit<Questao, 'id'>) => Promise<string>; // Retorna o ID da nova questão
  adicionarQuestoes: (concursoId: string, questoes: Omit<Questao, 'id'>[]) => Promise<void>;
  removerQuestao: (id: string) => Promise<void>;
  atualizarQuestao: (id: string, questao: Partial<Questao>) => Promise<void>;
  importarQuestoes: (novasQuestoes: Omit<Questao, 'id'>[]) => Promise<void>;
  buscarQuestoesPorConcurso: (concursoId: string) => Questao[];
  buscarQuestoesPorDisciplina: (disciplina: string) => Questao[];
  buscarPorTags: (tags: string[]) => Questao[];
  
  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void;
}

export const useQuestoesStore = create<QuestoesStore>((set, get) => ({
  questoes: [],
  loading: false,
  error: null,

  carregarQuestoes: async (userId: string, concursoId?: string, disciplina?: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createSupabaseClient();
      
      let query = supabase
        .from('estudos_questoes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      // Apply filters if provided
      if (concursoId) {
        query = query.eq('concurso_id', concursoId);
      }
      if (disciplina) {
        query = query.eq('disciplina', disciplina);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const questoes = (data || []).map(transformDbToQuestao);
      set({ questoes, loading: false });
    } catch (error: any) {
      console.error('Error loading questoes:', error);
      set({ error: error.message || 'Erro ao carregar questões', loading: false });
    }
  },

  adicionarQuestao: async (novaQuestao) => {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Validate JSONB alternativas structure
      if (!novaQuestao.alternativas || !Array.isArray(novaQuestao.alternativas)) {
        throw new Error('Alternativas inválidas');
      }
      
      const { data, error } = await supabase
        .from('estudos_questoes')
        .insert({
          user_id: user.id,
          concurso_id: novaQuestao.concursoId || null,
          disciplina: novaQuestao.disciplina,
          enunciado: novaQuestao.enunciado,
          alternativas: novaQuestao.alternativas as any,
          resposta_correta: novaQuestao.respostaCorreta,
          explicacao: novaQuestao.justificativa || null,
          tags: novaQuestao.tags || []
        })
        .select()
        .single();
      
      if (error) {
        // Handle foreign key constraint violation
        if (error.code === '23503') {
          throw new Error('Concurso não encontrado');
        }
        throw error;
      }
      
      const questao = transformDbToQuestao(data);
      set(state => ({ questoes: [questao, ...state.questoes] }));
      
      return data.id;
    } catch (error: any) {
      console.error('Error adding questao:', error);
      set({ error: error.message || 'Erro ao adicionar questão' });
      throw error;
    }
  },

  adicionarQuestoes: async (concursoId: string, questoes: Omit<Questao, 'id'>[]) => {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Prepare bulk insert
      const questoesParaInserir = questoes.map(q => ({
        user_id: user.id,
        concurso_id: concursoId,
        disciplina: q.disciplina,
        enunciado: q.enunciado,
        alternativas: q.alternativas as any,
        resposta_correta: q.respostaCorreta,
        explicacao: q.justificativa || null,
        tags: q.tags || []
      }));
      
      const { data, error } = await supabase
        .from('estudos_questoes')
        .insert(questoesParaInserir)
        .select();
      
      if (error) {
        // Handle foreign key constraint violation
        if (error.code === '23503') {
          throw new Error('Concurso não encontrado');
        }
        throw error;
      }
      
      const novasQuestoes = (data || []).map(transformDbToQuestao);
      set(state => ({ questoes: [...novasQuestoes, ...state.questoes] }));
    } catch (error: any) {
      console.error('Error adding questoes:', error);
      set({ error: error.message || 'Erro ao adicionar questões' });
      throw error;
    }
  },

  removerQuestao: async (id: string) => {
    try {
      const supabase = createSupabaseClient();
      
      const { error } = await supabase
        .from('estudos_questoes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        questoes: state.questoes.filter(q => q.id !== id)
      }));
    } catch (error: any) {
      console.error('Error removing questao:', error);
      set({ error: error.message || 'Erro ao remover questão' });
      throw error;
    }
  },

  atualizarQuestao: async (id: string, dadosAtualizados: Partial<Questao>) => {
    try {
      const supabase = createSupabaseClient();
      
      // Build update object
      const updateData: any = {};
      
      if (dadosAtualizados.concursoId !== undefined) {
        updateData.concurso_id = dadosAtualizados.concursoId || null;
      }
      if (dadosAtualizados.disciplina !== undefined) {
        updateData.disciplina = dadosAtualizados.disciplina;
      }
      if (dadosAtualizados.enunciado !== undefined) {
        updateData.enunciado = dadosAtualizados.enunciado;
      }
      if (dadosAtualizados.alternativas !== undefined) {
        updateData.alternativas = dadosAtualizados.alternativas as any;
      }
      if (dadosAtualizados.respostaCorreta !== undefined) {
        updateData.resposta_correta = dadosAtualizados.respostaCorreta;
      }
      if (dadosAtualizados.justificativa !== undefined) {
        updateData.explicacao = dadosAtualizados.justificativa;
      }
      if (dadosAtualizados.tags !== undefined) {
        updateData.tags = dadosAtualizados.tags;
      }
      
      const { data, error } = await supabase
        .from('estudos_questoes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        // Handle foreign key constraint violation
        if (error.code === '23503') {
          throw new Error('Concurso não encontrado');
        }
        throw error;
      }
      
      const questaoAtualizada = transformDbToQuestao(data);
      
      set(state => ({
        questoes: state.questoes.map(q =>
          q.id === id ? { ...q, ...questaoAtualizada } : q
        )
      }));
    } catch (error: any) {
      console.error('Error updating questao:', error);
      set({ error: error.message || 'Erro ao atualizar questão' });
      throw error;
    }
  },

  importarQuestoes: async (novasQuestoes: Omit<Questao, 'id'>[]) => {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Prepare bulk insert
      const questoesParaInserir = novasQuestoes.map(q => ({
        user_id: user.id,
        concurso_id: q.concursoId || null,
        disciplina: q.disciplina,
        enunciado: q.enunciado,
        alternativas: q.alternativas as any,
        resposta_correta: q.respostaCorreta,
        explicacao: q.justificativa || null,
        tags: q.tags || []
      }));
      
      const { data, error } = await supabase
        .from('estudos_questoes')
        .insert(questoesParaInserir)
        .select();
      
      if (error) throw error;
      
      const questoesImportadas = (data || []).map(transformDbToQuestao);
      set(state => ({ questoes: [...questoesImportadas, ...state.questoes] }));
    } catch (error: any) {
      console.error('Error importing questoes:', error);
      set({ error: error.message || 'Erro ao importar questões' });
      throw error;
    }
  },

  buscarQuestoesPorConcurso: (concursoId: string) => {
    return get().questoes.filter(q => q.concursoId === concursoId);
  },

  buscarQuestoesPorDisciplina: (disciplina: string) => {
    return get().questoes.filter(q => q.disciplina === disciplina);
  },

  buscarPorTags: (tags: string[]) => {
    return get().questoes.filter(q => 
      q.tags && q.tags.some(tag => tags.includes(tag))
    );
  },

  setupRealtimeSync: (userId: string) => {
    return supabaseSync.subscribeToUserData<QuestaoRow>(
      'estudos_questoes',
      userId,
      (newQuestao) => {
        const questao = transformDbToQuestao(newQuestao);
        set(state => {
          // Check if already exists
          const exists = state.questoes.some(q => q.id === questao.id);
          if (exists) return state;
          return { questoes: [questao, ...state.questoes] };
        });
      },
      (updatedQuestao) => {
        const questao = transformDbToQuestao(updatedQuestao);
        set(state => ({
          questoes: state.questoes.map(q =>
            q.id === questao.id ? { ...q, ...questao } : q
          )
        }));
      },
      (deleted) => {
        set(state => ({
          questoes: state.questoes.filter(q => q.id !== deleted.id)
        }));
      }
    );
  }
}));
