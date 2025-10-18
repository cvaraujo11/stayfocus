'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { useReceitasStore, Receita, Ingrediente } from '../../stores/receitasStore';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

// Helper function to validate and transform recipe object for JSONB format
const validarReceita = (obj: any): Omit<Receita, 'id' | 'favorita'> | null => {
  if (typeof obj !== 'object' || obj === null) return null;

  // Check required fields
  if (typeof obj.nome !== 'string' || !obj.nome.trim()) return null;
  if (!Array.isArray(obj.ingredientes) || obj.ingredientes.length === 0) return null;

  // Validate ingredients structure for JSONB
  const ingredientes: Ingrediente[] = [];
  for (const ing of obj.ingredientes) {
    if (typeof ing.nome !== 'string' || !ing.nome.trim()) return null;
    if (typeof ing.quantidade !== 'number') return null;
    if (typeof ing.unidade !== 'string') return null;
    ingredientes.push({
      nome: ing.nome,
      quantidade: ing.quantidade,
      unidade: ing.unidade
    });
  }

  // Build valid receita object
  return {
    nome: obj.nome,
    descricao: obj.descricao || '',
    categorias: Array.isArray(obj.categorias) ? obj.categorias : [],
    tags: Array.isArray(obj.tags) ? obj.tags : [],
    tempoPreparo: typeof obj.tempoPreparo === 'number' ? obj.tempoPreparo : 0,
    porcoes: typeof obj.porcoes === 'number' ? obj.porcoes : 1,
    calorias: obj.calorias || '',
    imagem: null, // Photos need to be uploaded separately
    ingredientes,
    passos: Array.isArray(obj.passos) ? obj.passos.filter((p: any) => typeof p === 'string') : []
  };
};

export function ImportadorReceitas() {
  const { user } = useAuth();
  const { adicionarReceita } = useReceitasStore();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
      setFeedback({ type: 'error', message: 'Você precisa estar autenticado para importar receitas.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      let receitasParaAdicionar: Array<Omit<Receita, 'id' | 'favorita'>> = [];

      // Check if it's an array (multiple recipes) or single object
      if (Array.isArray(jsonData)) {
        jsonData.forEach((item, index) => {
          const validatedItem = validarReceita(item);
          if (validatedItem) {
            receitasParaAdicionar.push(validatedItem);
          } else {
            console.warn(`Item ${index + 1} no JSON inválido ou incompleto. Ignorando.`);
          }
        });
      } else {
        const validatedItem = validarReceita(jsonData);
        if (validatedItem) {
          receitasParaAdicionar.push(validatedItem);
        } else {
          throw new Error('Estrutura do JSON inválida. Esperado um objeto de receita ou um array de objetos de receita.');
        }
      }

      if (receitasParaAdicionar.length === 0) {
         throw new Error('Nenhuma receita válida encontrada no arquivo JSON.');
      }

      // Add recipes to the store (with JSONB ingredientes)
      for (const receita of receitasParaAdicionar) {
        await adicionarReceita(receita);
      }

      setFeedback({ type: 'success', message: `${receitasParaAdicionar.length} receita(s) importada(s) com sucesso!` });

    } catch (error: any) {
      console.error("Erro ao importar receitas:", error);
      setFeedback({ type: 'error', message: `Erro ao importar: ${error.message || 'Verifique o formato do arquivo JSON.'}` });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="my-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
       <h3 className="text-lg font-medium mb-2">Importar Receitas</h3>
       <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
         Selecione um arquivo `.json` contendo uma única receita ou um array de receitas para importar.
         {/* TODO: Add link to documentation/example format */}
       </p>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} // Hide the default input
        disabled={isLoading}
      />
      <Button
        onClick={triggerFileInput}
        disabled={isLoading}
        variant="outline"
      >
        {isLoading ? 'Importando...' : 'Selecionar Arquivo JSON'}
      </Button>

      {feedback && (
        <Alert variant={feedback.type} className="mt-4"> {/* Changed 'type' to 'variant' */}
          {feedback.message}
        </Alert>
      )}
    </div>
  );
}
