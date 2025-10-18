'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { CalendarCheck, ArrowRight } from 'lucide-react';
import { format, differenceInDays, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createSupabaseClient } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/contexts/AuthContext';
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner';
import { ErrorMessage } from '@/app/components/common/ErrorMessage';

type Concurso = {
  id: string
  nome: string
  data_prova: string | null
}

// Função para calcular e formatar a contagem regressiva
const formatCountdown = (dataProva: string): string => {
  const hoje = new Date();
  const provaDate = new Date(dataProva);
  const diasRestantes = differenceInDays(provaDate, hoje);

  if (diasRestantes < 0) {
    return 'Prova realizada';
  } else if (diasRestantes === 0) {
    return 'Prova é hoje!';
  } else if (diasRestantes === 1) {
    return 'Falta 1 dia';
  } else {
    return `Faltam ${diasRestantes} dias`;
  }
};

export function ProximaProvaCard() {
  const { user } = useAuth();
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarProximasProvas = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseClient();
      const hoje = new Date().toISOString().split('T')[0];

      const { data, error: queryError } = await supabase
        .from('estudos_concursos')
        .select('id, nome, data_prova')
        .eq('user_id', user.id)
        .eq('status', 'em_andamento')
        .gte('data_prova', hoje)
        .order('data_prova', { ascending: true })
        .limit(3);

      if (queryError) throw queryError;

      setConcursos(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar próximas provas:', err);
      setError(err.message || 'Erro ao carregar próximas provas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProximasProvas();
  }, [user]);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex justify-center items-center py-4">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <ErrorMessage message={error} onRetry={carregarProximasProvas} />
      </Card>
    );
  }

  if (concursos.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <CalendarCheck size={20} className="text-indigo-600" />
        Próximas Provas
      </h3>
      <div className="space-y-3">
        {concursos.map((prova) => (
          prova.data_prova && (
            <div key={prova.id} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
              <div>
                <p className="font-medium">{prova.nome}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(prova.data_prova), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-indigo-600">{formatCountdown(prova.data_prova)}</p>
                <Link href={`/concursos/${prova.id}`} passHref>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    Ver detalhes <ArrowRight size={12} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )
        ))}
      </div>
    </Card>
  );
}
