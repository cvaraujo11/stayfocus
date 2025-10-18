import { create } from 'zustand';
import { createSupabaseClient } from '@/app/lib/supabase/client';
import { supabaseSync } from '@/app/lib/supabase/sync';
import type { Database } from '@/app/types/database';
// Importar store e helper do histórico
import { useHistoricoSimuladosStore, criarIdentificadorSimulado } from './historicoSimuladosStore';

// Type for database row
type SimuladoRow = Database['public']['Tables']['estudos_simulados']['Row'];
type QuestaoRow = Database['public']['Tables']['estudos_questoes']['Row'];

// Define a estrutura baseada no psimulado.json e nas necessidades da interface
export interface Questao {
  id: string; // Changed from number to string for UUID
  enunciado: string;
  alternativas: { [key: string]: string };
  gabarito: string;
  assunto?: string;
  dificuldade?: number;
  dicas?: string[];
  explicacao?: string;
  disciplina?: string;
}

export interface SimuladoMetadata {
  titulo: string;
  concurso?: string;
  ano?: number;
  area?: string;
  nivel?: string;
  totalQuestoes: number;
  tempoPrevisto?: number;
  autor?: string;
  dataGeracao?: string;
}

export interface SimuladoData {
  metadata: SimuladoMetadata;
  questoes: Questao[];
}

export type SimuladoStatus = 'idle' | 'loading' | 'reviewing' | 'results';

// Database simulado type
export interface SimuladoDB {
  id: string;
  user_id: string;
  concurso_id: string | null;
  titulo: string;
  questoes_ids: string[];
  data_realizacao: string | null;
  tempo_limite_minutos: number | null;
  acertos: number | null;
  total_questoes: number;
  created_at: string;
}

interface SimuladoState {
  simuladoData: SimuladoData | null;
  simuladoId: string | null; // ID do simulado no banco
  userAnswers: { [questaoId: string]: string }; // Changed from number to string for UUID
  currentQuestionIndex: number;
  status: SimuladoStatus;
  loading: boolean;
  error: string | null;
  
  // Actions
  carregarSimulados: (userId: string) => Promise<SimuladoDB[]>;
  criarSimulado: (titulo: string, questoesIds: string[], concursoId?: string, tempoLimite?: number) => Promise<string>;
  iniciarSimulado: (simuladoId: string) => Promise<void>;
  finalizarSimulado: () => Promise<void>;
  obterQuestoes: (questoesIds: string[]) => Promise<Questao[]>;
  
  // Legacy methods for backward compatibility
  loadSimulado: (data: SimuladoData) => void;
  selectAnswer: (questaoId: string, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishReview: () => void;
  resetSimulado: () => void;
  setStatus: (status: SimuladoStatus) => void;
  
  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void;
}

export const useSimuladoStore = create<SimuladoState>((set, get) => ({
  simuladoData: null,
  simuladoId: null,
  userAnswers: {},
  currentQuestionIndex: 0,
  status: 'idle',
  loading: false,
  error: null,

  // Supabase methods
  carregarSimulados: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from('estudos_simulados')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ loading: false });
      return data as SimuladoDB[];
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao carregar simulados';
      set({ error: errorMessage, loading: false });
      console.error('Erro ao carregar simulados:', error);
      return [];
    }
  },

  criarSimulado: async (titulo: string, questoesIds: string[], concursoId?: string, tempoLimite?: number) => {
    set({ loading: true, error: null });
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('estudos_simulados')
        .insert({
          user_id: user.id,
          titulo,
          questoes_ids: questoesIds,
          concurso_id: concursoId || null,
          tempo_limite_minutos: tempoLimite || null,
          total_questoes: questoesIds.length,
          data_realizacao: null,
          acertos: null,
        })
        .select()
        .single();

      if (error) throw error;

      set({ loading: false });
      return data.id;
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao criar simulado';
      set({ error: errorMessage, loading: false });
      console.error('Erro ao criar simulado:', error);
      throw error;
    }
  },

  iniciarSimulado: async (simuladoId: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createSupabaseClient();
      
      // Buscar o simulado
      const { data: simulado, error: simuladoError } = await supabase
        .from('estudos_simulados')
        .select('*')
        .eq('id', simuladoId)
        .single();

      if (simuladoError) throw simuladoError;
      if (!simulado) throw new Error('Simulado não encontrado');

      // Buscar as questões
      const questoes = await get().obterQuestoes(simulado.questoes_ids || []);

      // Montar o SimuladoData
      const simuladoData: SimuladoData = {
        metadata: {
          titulo: simulado.titulo,
          totalQuestoes: simulado.total_questoes || questoes.length,
          tempoPrevisto: simulado.tempo_limite_minutos || undefined,
        },
        questoes,
      };

      set({
        simuladoData,
        simuladoId,
        userAnswers: {},
        currentQuestionIndex: 0,
        status: 'reviewing',
        loading: false,
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao iniciar simulado';
      set({ error: errorMessage, loading: false });
      console.error('Erro ao iniciar simulado:', error);
    }
  },

  finalizarSimulado: async () => {
    const { simuladoData, simuladoId, userAnswers } = get();

    if (!simuladoData || !simuladoId) {
      console.error('Não é possível finalizar sem dados do simulado');
      return;
    }

    set({ loading: true, error: null });

    try {
      // Calcular acertos
      let correctCount = 0;
      const totalQuestions = simuladoData.questoes.length;

      simuladoData.questoes.forEach((questao) => {
        const userAnswer = userAnswers[questao.id];
        const correctAnswer = questao.gabarito;
        if (userAnswer === correctAnswer) {
          correctCount++;
        }
      });

      const percentageCorrect = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

      // Atualizar o simulado no banco
      const supabase = createSupabaseClient();
      const { error } = await supabase
        .from('estudos_simulados')
        .update({
          data_realizacao: new Date().toISOString(),
          acertos: correctCount,
        })
        .eq('id', simuladoId);

      if (error) throw error;

      // Adicionar ao histórico (mantém compatibilidade)
      const identificador = criarIdentificadorSimulado(simuladoData.metadata.titulo, totalQuestions);
      useHistoricoSimuladosStore.getState().adicionarTentativa(
        identificador,
        simuladoData.metadata.titulo,
        totalQuestions,
        correctCount,
        percentageCorrect
      );

      set({ status: 'results', loading: false });
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao finalizar simulado';
      set({ error: errorMessage, loading: false });
      console.error('Erro ao finalizar simulado:', error);
    }
  },

  obterQuestoes: async (questoesIds: string[]) => {
    if (!questoesIds || questoesIds.length === 0) {
      return [];
    }

    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from('estudos_questoes')
        .select('*')
        .in('id', questoesIds);

      if (error) throw error;

      // Transformar para o formato esperado
      const questoes: Questao[] = (data || []).map((q: QuestaoRow) => ({
        id: q.id,
        enunciado: q.enunciado,
        alternativas: (q.alternativas as any) || {},
        gabarito: q.resposta_correta,
        explicacao: q.explicacao || undefined,
        disciplina: q.disciplina,
      }));

      return questoes;
    } catch (error: any) {
      console.error('Erro ao obter questões:', error);
      return [];
    }
  },

  // Legacy methods for backward compatibility
  loadSimulado: (data) => {
    // Validação básica dos dados carregados
    if (!data || !data.metadata || !data.questoes || !Array.isArray(data.questoes) || data.questoes.length === 0) {
      console.error('Erro: Dados do simulado inválidos ou vazios.');
      set({ simuladoData: null, userAnswers: {}, currentQuestionIndex: 0, status: 'idle' });
      return;
    }
    set({
      simuladoData: data,
      userAnswers: {},
      currentQuestionIndex: 0,
      status: 'reviewing',
    });
  },

  selectAnswer: (questaoId, answer) => {
    set((state) => ({
      userAnswers: {
        ...state.userAnswers,
        [questaoId]: answer,
      },
    }));
  },

  nextQuestion: () => {
    set((state) => {
      if (state.simuladoData && state.currentQuestionIndex < state.simuladoData.questoes.length - 1) {
        return { currentQuestionIndex: state.currentQuestionIndex + 1 };
      }
      return {};
    });
  },

  prevQuestion: () => {
    set((state) => {
      if (state.currentQuestionIndex > 0) {
        return { currentQuestionIndex: state.currentQuestionIndex - 1 };
      }
      return {};
    });
  },

  finishReview: () => {
    const { simuladoData, userAnswers, simuladoId } = get();

    if (!simuladoData) {
      console.error('Não é possível finalizar a revisão sem dados do simulado.');
      return;
    }

    // Se temos um simuladoId, usar o método novo
    if (simuladoId) {
      get().finalizarSimulado();
      return;
    }

    // Caso contrário, usar o método legado
    let correctCount = 0;
    const totalQuestions = simuladoData.questoes.length;

    simuladoData.questoes.forEach((questao) => {
      const userAnswer = userAnswers[questao.id];
      const correctAnswer = questao.gabarito;
      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    });

    const percentageCorrect = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const identificador = criarIdentificadorSimulado(simuladoData.metadata.titulo, totalQuestions);

    useHistoricoSimuladosStore.getState().adicionarTentativa(
      identificador,
      simuladoData.metadata.titulo,
      totalQuestions,
      correctCount,
      percentageCorrect
    );

    set({ status: 'results' });
  },

  resetSimulado: () => {
    set({
      simuladoData: null,
      simuladoId: null,
      userAnswers: {},
      currentQuestionIndex: 0,
      status: 'idle',
      error: null,
    });
  },

  setStatus: (status) => {
    set({ status });
  },

  // Real-time sync
  setupRealtimeSync: (userId: string) => {
    return supabaseSync.subscribe<SimuladoRow>(
      'estudos_simulados',
      (newSimulado) => {
        // Handle new simulado if needed
        console.log('Novo simulado criado:', newSimulado);
      },
      (updatedSimulado) => {
        // Handle updated simulado
        const { simuladoId } = get();
        if (simuladoId === updatedSimulado.id) {
          // Reload current simulado if it was updated
          console.log('Simulado atual atualizado:', updatedSimulado);
        }
      },
      (deleted) => {
        // Handle deleted simulado
        const { simuladoId } = get();
        if (simuladoId === deleted.id) {
          // Reset if current simulado was deleted
          get().resetSimulado();
        }
      }
    );
  },
}));

// Exemplo de como usar o store em um componente:
// import { useSimuladoStore } from '@/app/stores/simuladoStore';
//
// const MeuComponente = () => {
//   const { simuladoData, currentQuestionIndex, nextQuestion, loadSimulado } = useSimuladoStore();
//   // ... lógica do componente
// }
