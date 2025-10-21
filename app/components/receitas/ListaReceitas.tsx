'use client';

import React from 'react';
import Link from 'next/link';
import { Receita } from '../../stores/receitasStore';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { EmptyState } from '../common/EmptyState';

interface ListaReceitasProps {
  receitas: Receita[];
  loading?: boolean;
}

export function ListaReceitas({ receitas, loading = false }: ListaReceitasProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (receitas.length === 0) {
    return (
      <EmptyState
        message="Nenhuma receita encontrada"
        icon="📖"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {receitas.map((receita) => (
        <Link href={`/receitas/${receita.id}`} key={receita.id} legacyBehavior>
          <a className="block group">
            <Card className="h-full flex flex-col transition-shadow duration-200 group-hover:shadow-lg">
              <div className="relative h-40 w-full bg-gradient-to-br from-receitas-light to-receitas-primary/20 rounded-t-lg overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-receitas-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600">
                  {receita.nome}
                </h3>
                {receita.descricao && (
                   <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
                     {receita.descricao}
                   </p>
                )}
                <div className="mt-auto pt-2">
                   {receita.tags?.slice(0, 3).map((tag) => (
                     <Tag key={tag} className="mr-1 mb-1">{tag}</Tag>
                   ))}
                   {receita.tags?.length > 3 && <Tag className="mr-1 mb-1">...</Tag>}
                </div>
              </div>
            </Card>
          </a>
        </Link>
      ))}
    </div>
  );
}
