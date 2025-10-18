'use client';

import { useState, useEffect } from 'react';
import { ListaReceitas } from '../components/receitas/ListaReceitas';
import { FiltroCategorias } from '../components/receitas/FiltroCategorias';
import { Pesquisa } from '../components/ui/Pesquisa';
import { useReceitasStore } from '../stores/receitasStore';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import Link from 'next/link';
import { ImportadorReceitas } from '../components/receitas/ImportadorReceitas';

export default function ReceitasPage() {
  const { user, loading: authLoading } = useAuth();
  const { receitas, loading, error, carregarReceitas, setupRealtimeSync } = useReceitasStore();
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [termoPesquisa, setTermoPesquisa] = useState('');

  // Load receitas
  useEffect(() => {
    if (user) {
      carregarReceitas(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Setup real-time sync (separado para evitar loops)
  useEffect(() => {
    if (user) {
      const cleanup = setupRealtimeSync(user.id);
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const receitasFiltradas = receitas
    .filter(receita =>
      filtroCategoria === 'todas' || (receita.categorias && receita.categorias.includes(filtroCategoria))
    )
    .filter(receita => {
      const termo = termoPesquisa.toLowerCase();
      const nomeMatch = receita.nome.toLowerCase().includes(termo);
      const ingredienteMatch = receita.ingredientes?.some(ing =>
        ing.nome.toLowerCase().includes(termo)
      );
      return nomeMatch || ingredienteMatch;
    });

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        <ErrorMessage message="Você precisa estar autenticado para acessar suas receitas." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage
          message={error}
          onRetry={() => user && carregarReceitas(user.id)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Minhas Receitas</h1>
        <Link href="/receitas/adicionar" passHref>
          <Button color="primary">Adicionar Nova Receita</Button>
        </Link>
      </div>

      {/* Import Component Added Here */}
      <ImportadorReceitas />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Pesquisa
          placeholder="Buscar por nome ou ingrediente"
          valor={termoPesquisa}
          aoMudar={setTermoPesquisa}
          className="flex-grow" // Allow search bar to grow
        />
        <FiltroCategorias
          categoriaAtual={filtroCategoria}
          aoSelecionar={setFiltroCategoria}
          className="w-full sm:w-auto sm:min-w-[200px]" // Set min-width on smaller screens
        />
        <Link href="/receitas/lista-compras" passHref>
          <Button variant="outline">Lista de Compras</Button>
        </Link>
      </div>

      <ListaReceitas receitas={receitasFiltradas} loading={loading} />
    </div>
  );
}
