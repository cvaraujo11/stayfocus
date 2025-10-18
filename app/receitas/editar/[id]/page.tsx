'use client';

import { useEffect } from 'react';
import { AdicionarReceitaForm } from '../../../components/receitas/AdicionarReceitaForm';
import { useReceitasStore } from '../../../stores/receitasStore';
import { useAuth } from '../../../contexts/AuthContext';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { useParams } from 'next/navigation';

export default function EditarReceitaPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { obterReceitaPorId, carregarReceitas, loading, error } = useReceitasStore();

  const id = params && typeof params.id === 'string' ? params.id : undefined;

  // Load receitas if not already loaded
  useEffect(() => {
    if (user && id) {
      carregarReceitas(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        <ErrorMessage message="Você precisa estar autenticado para editar receitas." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage message={error} onRetry={() => user && carregarReceitas(user.id)} />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="p-4 text-center">
        <ErrorMessage message="ID da receita não encontrado na URL." />
      </div>
    );
  }

  const receitaParaEditar = obterReceitaPorId(id);

  if (!receitaParaEditar) {
    return (
      <div className="p-4 text-center">
        <ErrorMessage message={`Receita com ID '${id}' não encontrada.`} />
      </div>
    );
  }

  return <AdicionarReceitaForm receitaParaEditar={receitaParaEditar} />;
}
