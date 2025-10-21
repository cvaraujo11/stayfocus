'use client';

import { useState, useEffect } from 'react';
import { useReceitasStore } from '../../stores/receitasStore';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DetalhesReceitaProps {
  id: string;
}

export function DetalhesReceita({ id }: DetalhesReceitaProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { obterReceitaPorId, removerReceita, marcarFavorita, loading, error, adicionarIngredientesNaLista } = useReceitasStore();
  const [porcoes, setPorcoes] = useState(1);
  const [removendo, setRemovendo] = useState(false);

  const receita = obterReceitaPorId(id);

  useEffect(() => {
    if (receita) {
      setPorcoes(receita.porcoes || 1);
    }
  }, [receita]);

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        <ErrorMessage message="Você precisa estar autenticado para visualizar receitas." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!receita) {
    return (
      <div className="p-4 text-center">
        <ErrorMessage message="Receita não encontrada." />
      </div>
    );
  }

  const isFavorito = receita.favorita;

  const ajustarQuantidade = (quantidade: number | undefined) => {
    if (quantidade === undefined || receita.porcoes === undefined || receita.porcoes === 0) return 'N/A';
    // Handle 'a gosto' or similar units where quantity might not scale
    // For simplicity, we scale everything, but real-world might need checks
    const adjusted = (quantidade * porcoes) / receita.porcoes;
    // Format to 1 decimal place, but avoid .0
    return adjusted % 1 === 0 ? adjusted.toFixed(0) : adjusted.toFixed(1);
  };

  const adicionarAListaCompras = async () => {
    try {
      await adicionarIngredientesNaLista(receita, porcoes);
      alert(`Ingredientes de ${receita.nome} adicionados à lista de compras!`);
      router.push('/receitas/lista-compras');
    } catch (error) {
      alert('Erro ao adicionar ingredientes à lista de compras.');
    }
  };

  const handleRemoverReceita = async () => {
    if (window.confirm(`Tem certeza que deseja remover a receita "${receita.nome}"?`)) {
      setRemovendo(true);
      try {
        await removerReceita(id);
        alert('Receita removida com sucesso!');
        router.push('/receitas');
      } catch (error) {
        alert('Erro ao remover receita.');
        setRemovendo(false);
      }
    }
  };

  const handleToggleFavorita = async () => {
    try {
      await marcarFavorita(id, !isFavorito);
    } catch (error) {
      alert('Erro ao atualizar favorita.');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header with Recipe Icon */}
      <div className="relative h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden mb-6 bg-gradient-to-br from-receitas-light to-receitas-primary/20 dark:from-gray-700 dark:to-receitas-primary/30">
        <div className="w-full h-full flex items-center justify-center text-receitas-primary dark:text-receitas-light">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 md:h-40 md:w-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
         {/* Favorite Button Overlay */}
         <button
            onClick={handleToggleFavorita}
            disabled={loading}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors duration-200 ${
              isFavorito ? 'bg-red-500 text-white' : 'bg-white/70 text-gray-700 hover:bg-white'
            } disabled:opacity-50`}
            aria-label={isFavorito ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorito ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isFavorito ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
      </div>

      {/* Title and Tags */}
      <h1 className="text-3xl md:text-4xl font-bold mb-3">{receita.nome}</h1>
      {receita.descricao && <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{receita.descricao}</p>}
      <div className="flex flex-wrap gap-2 mb-6">
        {receita.tags?.map(tag => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>

      {/* Quick Info Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-lg text-center">
          <p className="text-sm text-primary-700 dark:text-primary-300">Tempo de Preparo</p>
          <p className="font-bold text-lg">{receita.tempoPreparo || "N/A"} min</p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-lg text-center">
          <p className="text-sm text-primary-700 dark:text-primary-300">Porções Originais</p>
          <p className="font-bold text-lg">{receita.porcoes || "N/A"}</p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-lg text-center">
          <p className="text-sm text-primary-700 dark:text-primary-300">Calorias (aprox.)</p>
          <p className="font-bold text-lg">{receita.calorias || "N/A"}</p>
        </div>
      </div>

      {/* Ingredients and Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ingredients Section */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Ingredientes</h2>
          <div className="flex items-center gap-4 mb-4">
            <label htmlFor="porcoes-input" className="text-sm font-medium">Ajustar para:</label>
            <div className="flex items-center border rounded">
               <button
                 onClick={() => setPorcoes(Math.max(1, porcoes - 1))}
                 className="px-2 py-1 border-r text-lg"
                 aria-label="Diminuir porções"
               >-</button>
               <input
                 id="porcoes-input"
                 type="number"
                 value={porcoes}
                 onChange={(e) => setPorcoes(Math.max(1, parseInt(e.target.value) || 1))}
                 min={1}
                 className="w-12 text-center py-1 outline-none bg-transparent"
                 aria-label="Número de porções"
               />
               <button
                 onClick={() => setPorcoes(porcoes + 1)}
                 className="px-2 py-1 border-l text-lg"
                 aria-label="Aumentar porções"
               >+</button>
            </div>
             <span className="text-sm">porções</span>
          </div>
          <ul className="space-y-2 text-sm">
            {receita.ingredientes?.map((ing, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="font-medium w-20 text-right">{ajustarQuantidade(ing.quantidade)} {ing.unidade}</span>
                <span>{ing.nome}</span>
              </li>
            ))}
             {!receita.ingredientes || receita.ingredientes.length === 0 && (
                <li className="text-gray-500">Nenhum ingrediente listado.</li>
             )}
          </ul>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <Button onClick={adicionarAListaCompras} color="primary" className="w-full" disabled={loading}>
              Adicionar à Lista de Compras
            </Button>
             <Link href={`/receitas/editar/${id}`} passHref>
                <Button variant="outline" className="w-full">Editar Receita</Button>
             </Link>
            <Button onClick={handleRemoverReceita} variant="danger" className="w-full" disabled={removendo || loading}>
              {removendo ? 'Removendo...' : 'Remover Receita'}
            </Button>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Modo de Preparo</h2>
          {receita.passos && receita.passos.length > 0 ? (
            <ol className="space-y-4 list-decimal list-outside pl-5 marker:font-semibold marker:text-primary-600">
              {receita.passos.map((passo, index) => (
                <li key={index} className="pl-2 leading-relaxed">
                  {passo}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-500">Nenhum passo de preparo listado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
