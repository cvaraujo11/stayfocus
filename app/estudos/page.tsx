'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { TemporizadorPomodoro } from '@/app/components/estudos/TemporizadorPomodoro';
import { RegistroEstudos } from '@/app/components/estudos/RegistroEstudos';
import { useConcursosStore } from '@/app/stores/concursosStore';
import { useRegistroEstudosStore } from '@/app/stores/registroEstudosStore';
import { useAuth } from '@/app/contexts/AuthContext';
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner';
import { ErrorMessage } from '@/app/components/common/ErrorMessage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EstudosPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    concursos,
    loading: concursosLoading,
    error: concursosError,
    carregarConcursos,
    setupRealtimeSync: setupConcursosSync
  } = useConcursosStore();
  const {
    registros,
    loading: registrosLoading,
    error: registrosError,
  } = useRegistroEstudosStore();

  // Load concursos only (registros is loaded by RegistroEstudos component)
  useEffect(() => {
    if (user) {
      carregarConcursos(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Setup real-time sync for concursos only (registros is handled by RegistroEstudos component)
  useEffect(() => {
    if (user) {
      const cleanupConcursos = setupConcursosSync(user.id);

      return () => {
        cleanupConcursos();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Carregando..." />
      </div>
    );
  }

  // Show loading state while data is loading (only on initial load)
  if ((concursosLoading || registrosLoading) && concursos.length === 0 && registros.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Carregando dados de estudos..." />
      </div>
    );
  }

  // Show error state for concursos
  if (concursosError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estudos</h1>
        <ErrorMessage
          message={concursosError}
          onRetry={() => user && carregarConcursos(user.id)}
        />
      </div>
    );
  }

  // Encontrar próximo concurso
  const proximoConcurso = concursos
    .filter(c => c.status !== 'realizado' && c.dataProva && new Date(c.dataProva) > new Date())
    .sort((a, b) => new Date(a.dataProva).getTime() - new Date(b.dataProva).getTime())[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"> {/* Container para título e botão */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estudos</h1>
        <div className="flex gap-2">
          <Link href="/estudos/simulado" passHref>
            <Button variant="outline">Conferir Simulado</Button>
          </Link>
          <Link href="/concursos" passHref>
            <Button variant="default">Ver Todos Concursos</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temporizador Pomodoro Adaptado */}
        <Card title="Temporizador Pomodoro">
          <TemporizadorPomodoro />
        </Card>

        {/* Registro de Sessões de Estudo */}
        <Card title="Registro de Estudos">
          <RegistroEstudos />
        </Card>

        {/* Próximo Concurso */}
        <Card title="Próximo Concurso">
          {concursosLoading && concursos.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" label="Carregando concursos..." />
            </div>
          ) : proximoConcurso ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{proximoConcurso.titulo}</h3>
                {proximoConcurso.organizadora && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{proximoConcurso.organizadora}</p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Data da Prova:</span>
                <span>{format(new Date(proximoConcurso.dataProva), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>

              {proximoConcurso.conteudoProgramatico && proximoConcurso.conteudoProgramatico.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Disciplinas:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {proximoConcurso.conteudoProgramatico.map((item, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded"
                      >
                        {item.disciplina}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Link href={`/concursos/${proximoConcurso.id}`} passHref>
                  <Button variant="link" className="text-indigo-600 dark:text-indigo-400">
                    Ver detalhes
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum concurso planejado</p>
              <Link href="/concursos" passHref>
                <Button variant="outline">Adicionar Concurso</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
