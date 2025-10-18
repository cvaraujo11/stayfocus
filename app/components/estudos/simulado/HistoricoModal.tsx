'use client';

import React, { useMemo, useEffect } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Button } from '@/app/components/ui/Button';
import { useHistoricoSimuladosStore } from '@/app/stores/historicoSimuladosStore';
import { useSimuladoStore } from '@/app/stores/simuladoStore'; // Para resetar ao clicar em Refazer
import { Badge } from '@/app/components/ui/Badge'; // Para exibir pontuações
import { RefreshCw } from 'lucide-react'; // Ícone para Refazer
import { useAuth } from '@/app/contexts/AuthContext';
import { LoadingSpinner, ErrorMessage } from '@/app/components/common';

interface HistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoricoModal: React.FC<HistoricoModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const {
    historico,
    loading,
    error,
    carregarHistorico,
    obterEstatisticas,
    setupRealtimeSync
  } = useHistoricoSimuladosStore();
  const { resetSimulado } = useSimuladoStore(); // Pegar a função de reset

  // Carregar histórico quando o modal abre
  useEffect(() => {
    if (isOpen && user) {
      carregarHistorico(user.id);
    }
  }, [isOpen, user, carregarHistorico]);

  // Setup real-time sync
  useEffect(() => {
    if (user) {
      const cleanup = setupRealtimeSync(user.id);
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Usa o método obterEstatisticas do store
  const historicoProcessado = useMemo(() => {
    const estatisticas = obterEstatisticas();
    // Já vem ordenado por data mais recente
    return estatisticas;
  }, [historico, obterEstatisticas]);

  const handleRefazer = () => {
    resetSimulado(); // Reseta o estado do simulado atual
    onClose(); // Fecha o modal
    // O usuário precisará carregar o JSON manualmente
    // Poderíamos mostrar um toast/alerta aqui para instruir o usuário, mas vamos manter simples por ora.
  };

  // Formata data para exibição
  const formatarData = (dataIso: string | null): string => {
    if (!dataIso) return 'N/A';
    try {
      return new Date(dataIso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Histórico de Simulados">
      <div className="max-h-[60vh] overflow-y-auto space-y-4 p-1"> {/* Altura máxima e scroll */}
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={() => user && carregarHistorico(user.id)}
          />
        ) : historicoProcessado.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Nenhum simulado no histórico ainda.</p>
        ) : (
          historicoProcessado.map((item) => (
            <div key={item.identificador} className="p-4 border rounded-md bg-background flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-grow">
                <h4 className="font-semibold">{item.titulo}</h4>
                <p className="text-sm text-muted-foreground">
                  {item.totalQuestoes} questões | {item.numeroTentativas} tentativa(s) | Última em: {formatarData(item.ultimaData)}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="secondary">Última: {item.ultimoPercentual.toFixed(1)}%</Badge>
                  <Badge variant="default">Melhor: {item.melhorPercentual.toFixed(1)}%</Badge>
                  <Badge variant="outline">Média: {item.mediaPercentual.toFixed(1)}%</Badge>
                </div>
              </div>
              <Button onClick={handleRefazer} variant="ghost" size="sm" className="mt-2 sm:mt-0 flex-shrink-0">
                <RefreshCw className="mr-1 h-4 w-4" /> Refazer
              </Button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default HistoricoModal;
