'use client';

import React, { useState, useEffect } from 'react';
import { useSimuladoStore } from '@/app/stores/simuladoStore';
import { useAuth } from '@/app/contexts/AuthContext';
import SimuladoLoader from '@/app/components/estudos/simulado/SimuladoLoader';
import SimuladoReview from '@/app/components/estudos/simulado/SimuladoReview';
import SimuladoResults from '@/app/components/estudos/simulado/SimuladoResults';
import HistoricoModal from '@/app/components/estudos/simulado/HistoricoModal';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner';
import { History } from 'lucide-react';

const SimuladoPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { status, resetSimulado, setupRealtimeSync } = useSimuladoStore();
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(false);

  // Setup real-time sync when user is authenticated
  useEffect(() => {
    if (user) {
      const cleanup = setupRealtimeSync(user.id);
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    );
  }

  // Redirect handled by middleware, but show message just in case
  if (!user) {
    return (
      <Container>
        <div className="text-center py-8">
          <p>Você precisa estar autenticado para acessar esta página.</p>
        </div>
      </Container>
    );
  }

  const renderContent = () => {
    switch (status) {
      case 'reviewing':
        return <SimuladoReview />;
      case 'results':
        return <SimuladoResults />;
      case 'loading': // Poderia ter um estado de loading visual
        return <div>Carregando simulado...</div>;
      case 'idle':
      default:
        return <SimuladoLoader />;
    }
  };

  return (
    <> {/* Usar Fragment para envolver Container e Modal */}
      <Container>
        <div className="flex justify-between items-center mb-6 gap-2"> {/* Adicionado gap */}
          <h1 className="text-2xl font-bold">Conferência de Simulado</h1>
          <div className="flex gap-2"> {/* Agrupar botões */}
            <Button onClick={() => setIsHistoricoOpen(true)} variant="outline" size="sm">
              <History className="mr-1 h-4 w-4" /> Histórico
            </Button>
            {status !== 'idle' && (
              <Button onClick={resetSimulado} variant="outline" size="sm">
                Carregar Novo
              </Button>
            )}
          </div>
        </div>
        {renderContent()}
      </Container>

      {/* Modal do Histórico */}
      <HistoricoModal
        isOpen={isHistoricoOpen}
        onClose={() => setIsHistoricoOpen(false)}
      />
    </>
  );
};

export default SimuladoPage;
