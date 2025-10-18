import { create } from 'zustand';
import { createSupabaseClient } from '@/app/lib/supabase/client';
import { supabaseSync } from '@/app/lib/supabase/sync';
import type { Database } from '@/app/types/database';

// Type for database row
type SimuladoRow = Database['public']['Tables']['estudos_simulados']['Row'];

// --- Tipos ---
interface Tentativa {
  timestamp: string; // ISO string
  acertos: number;
  percentual: number;
}

interface SimuladoHistoricoEntry {
  id: string; // UUID do simulado
  titulo: string;
  totalQuestoes: number;
  concursoId: string | null;
  tentativas: Tentativa[];
}

// O estado principal será um objeto onde a chave é o identificador único
// Ex: "Simulado X|40"
type HistoricoSimuladosStateData = Record<string, SimuladoHistoricoEntry>;

// Estatísticas agregadas
interface EstatisticasSimulado {
  identificador: string;
  titulo: string;
  totalQuestoes: number;
  numeroTentativas: number;
  melhorPercentual: number;
  ultimoPercentual: number;
  mediaPercentual: number;
  ultimaData: string;
}

// Dados de evolução ao longo do tempo
interface EvolucaoData {
  data: string;
  percentual: number;
  acertos: number;
  totalQuestoes: number;
}

interface HistoricoSimuladosState {
  historico: HistoricoSimuladosStateData;
  loading: boolean;
  error: string | null;

  // Actions
  carregarHistorico: (userId: string) => Promise<void>;
  obterEstatisticas: (identificador?: string) => EstatisticasSimulado[];
  obterEvolucao: (identificador: string) => EvolucaoData[];

  // Legacy method for backward compatibility
  adicionarTentativa: (
    identificador: string,
    titulo: string,
    totalQuestoes: number,
    acertos: number,
    percentual: number
  ) => void;

  // Real-time sync
  setupRealtimeSync: (userId: string) => () => void;
}

// --- Store ---
export const useHistoricoSimuladosStore = create<HistoricoSimuladosState>((set, get) => ({
  historico: {},
  loading: false,
  error: null,

  carregarHistorico: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createSupabaseClient();

      // Buscar todos os simulados realizados (com data_realizacao não nula)
      const { data, error } = await supabase
        .from('estudos_simulados')
        .select('*')
        .eq('user_id', userId)
        .not('data_realizacao', 'is', null)
        .order('data_realizacao', { ascending: false });

      if (error) throw error;

      // Agrupar por identificador (titulo|totalQuestoes)
      const historicoAgrupado: HistoricoSimuladosStateData = {};

      (data || []).forEach((simulado: SimuladoRow) => {
        const totalQuestoes = simulado.total_questoes || 0;
        const acertos = simulado.acertos || 0;

        const identificador = criarIdentificadorSimulado(
          simulado.titulo,
          totalQuestoes
        );

        const tentativa: Tentativa = {
          timestamp: simulado.data_realizacao || new Date().toISOString(),
          acertos: acertos,
          percentual: totalQuestoes > 0
            ? (acertos / totalQuestoes) * 100
            : 0,
        };

        if (historicoAgrupado[identificador]) {
          historicoAgrupado[identificador].tentativas.push(tentativa);
        } else {
          historicoAgrupado[identificador] = {
            id: simulado.id,
            titulo: simulado.titulo,
            totalQuestoes: totalQuestoes,
            concursoId: simulado.concurso_id,
            tentativas: [tentativa],
          };
        }
      });

      // Ordenar tentativas por data (mais recente primeiro)
      Object.values(historicoAgrupado).forEach((entry) => {
        entry.tentativas.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });

      set({ historico: historicoAgrupado, loading: false });
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao carregar histórico';
      set({ error: errorMessage, loading: false });
      console.error('Erro ao carregar histórico:', error);
    }
  },

  obterEstatisticas: (identificador?: string) => {
    const { historico } = get();

    const entries = identificador
      ? [historico[identificador]].filter(Boolean)
      : Object.values(historico);

    return entries.map((entry) => {
      if (!entry || entry.tentativas.length === 0) {
        return null;
      }

      const percentuais = entry.tentativas.map(t => t.percentual);
      const melhorPercentual = Math.max(...percentuais);
      const ultimoPercentual = entry.tentativas[0].percentual; // Já ordenado
      const mediaPercentual = percentuais.reduce((a, b) => a + b, 0) / percentuais.length;
      const ultimaData = entry.tentativas[0].timestamp;

      return {
        identificador: criarIdentificadorSimulado(entry.titulo, entry.totalQuestoes),
        titulo: entry.titulo,
        totalQuestoes: entry.totalQuestoes,
        numeroTentativas: entry.tentativas.length,
        melhorPercentual,
        ultimoPercentual,
        mediaPercentual,
        ultimaData,
      };
    }).filter((stat): stat is EstatisticasSimulado => stat !== null);
  },

  obterEvolucao: (identificador: string) => {
    const { historico } = get();
    const entry = historico[identificador];

    if (!entry || entry.tentativas.length === 0) {
      return [];
    }

    // Retornar tentativas em ordem cronológica (mais antiga primeiro) para gráficos
    return [...entry.tentativas]
      .reverse()
      .map((tentativa) => ({
        data: tentativa.timestamp,
        percentual: tentativa.percentual,
        acertos: tentativa.acertos,
        totalQuestoes: entry.totalQuestoes,
      }));
  },

  // Legacy method for backward compatibility
  adicionarTentativa: (identificador, titulo, totalQuestoes, acertos, percentual) => {
    set((state) => {
      const historicoAtual = { ...state.historico };
      const novaTentativa: Tentativa = {
        timestamp: new Date().toISOString(),
        acertos,
        percentual,
      };

      // Se o simulado já existe no histórico, adiciona a nova tentativa
      if (historicoAtual[identificador]) {
        historicoAtual[identificador] = {
          ...historicoAtual[identificador],
          tentativas: [novaTentativa, ...historicoAtual[identificador].tentativas],
        };
      } else {
        // Se é a primeira vez, cria a entrada
        historicoAtual[identificador] = {
          id: '', // Será preenchido quando carregar do banco
          titulo,
          totalQuestoes,
          concursoId: null,
          tentativas: [novaTentativa],
        };
      }

      return { historico: historicoAtual };
    });
  },

  // Real-time sync
  setupRealtimeSync: (userId: string) => {
    return supabaseSync.subscribeToUserData<SimuladoRow>(
      'estudos_simulados',
      userId,
      (newSimulado) => {
        // Quando um novo simulado é criado, não fazemos nada
        // Só nos importamos com simulados finalizados
        if (newSimulado.data_realizacao) {
          get().carregarHistorico(userId);
        }
      },
      (updatedSimulado) => {
        // Quando um simulado é atualizado (finalizado)
        if (updatedSimulado.data_realizacao) {
          const totalQuestoes = updatedSimulado.total_questoes || 0;
          const acertos = updatedSimulado.acertos || 0;

          const identificador = criarIdentificadorSimulado(
            updatedSimulado.titulo,
            totalQuestoes
          );

          const tentativa: Tentativa = {
            timestamp: updatedSimulado.data_realizacao,
            acertos: acertos,
            percentual: totalQuestoes > 0
              ? (acertos / totalQuestoes) * 100
              : 0,
          };

          set((state) => {
            const historicoAtual = { ...state.historico };

            if (historicoAtual[identificador]) {
              // Adicionar nova tentativa e reordenar
              const tentativasAtualizadas = [
                tentativa,
                ...historicoAtual[identificador].tentativas,
              ].sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );

              historicoAtual[identificador] = {
                ...historicoAtual[identificador],
                tentativas: tentativasAtualizadas,
              };
            } else {
              // Criar nova entrada
              historicoAtual[identificador] = {
                id: updatedSimulado.id,
                titulo: updatedSimulado.titulo,
                totalQuestoes: totalQuestoes,
                concursoId: updatedSimulado.concurso_id,
                tentativas: [tentativa],
              };
            }

            return { historico: historicoAtual };
          });
        }
      },
      (deleted) => {
        // Quando um simulado é deletado, recarregar o histórico
        get().carregarHistorico(userId);
      }
    );
  },
}));

// --- Helper para criar o identificador ---
export const criarIdentificadorSimulado = (titulo: string, totalQuestoes: number): string => {
  // Simples concatenação, pode ser melhorado se necessário (ex: hash)
  return `${titulo}|${totalQuestoes}`;
};
