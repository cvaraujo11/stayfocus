'use client';

import React, { useEffect } from 'react';
import { useSimuladoStore } from '@/app/stores/simuladoStore';
import { useAuth } from '@/app/contexts/AuthContext';
import SimuladoReview from '@/app/components/estudos/simulado/SimuladoReview';
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner';

const SimuladoPersonalizadoPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { loadSimulado, simuladoData, setupRealtimeSync } = useSimuladoStore();

  // Setup real-time sync when user is authenticated
  useEffect(() => {
    if (user) {
      const cleanup = setupRealtimeSync(user.id);
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    // Carrega as questões selecionadas do localStorage
    const raw = localStorage.getItem('simulado_personalizado_questoes');
    if (raw) {
      try {
        const questoes = JSON.parse(raw);
        if (Array.isArray(questoes) && questoes.length > 0) {
          // Monta estrutura mínima de simulado
          loadSimulado({
            metadata: {
              titulo: 'Simulado Personalizado',
              totalQuestoes: questoes.length,
              dataGeracao: new Date().toISOString(),
              concurso: questoes[0]?.concursoId || '',
            },
            questoes: questoes.map((q: any, idx: number) => {
              // Adapta para o formato esperado pelo SimuladoReview
              const alternativasObj: Record<string, string> = {};
              q.alternativas.forEach((alt: any, i: number) => {
                const key = String.fromCharCode(97 + i); // a, b, c, d...
                alternativasObj[key] = alt.texto;
              });
              let gabaritoKey = '';
              q.alternativas.forEach((alt: any, i: number) => {
                if (alt.id === q.respostaCorreta) {
                  gabaritoKey = String.fromCharCode(97 + i);
                }
              });
              return {
                id: (idx + 1).toString(),
                enunciado: q.enunciado,
                alternativas: alternativasObj,
                gabarito: gabaritoKey,
                assunto: q.topico || q.disciplina,
                dificuldade: q.nivelDificuldade ? (['facil', 'medio', 'dificil'].indexOf(q.nivelDificuldade) + 1) : undefined,
                explicacao: q.justificativa,
              };
            }),
          });
        }
      } catch (err) {
        // erro de parse, não faz nada
      }
    }
  }, [loadSimulado]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect handled by middleware, but show message just in case
  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>Você precisa estar autenticado para acessar esta página.</p>
      </div>
    );
  }

  if (!simuladoData) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="ml-4">Carregando simulado personalizado...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <SimuladoReview />
    </div>
  );
};

export default SimuladoPersonalizadoPage;