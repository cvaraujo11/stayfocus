/**
 * Example usage of EstatisticasEstudo component
 * 
 * This file demonstrates how to use the EstatisticasEstudo component
 * and shows the expected behavior with sample data.
 */

'use client'

import { EstatisticasEstudo } from './EstatisticasEstudo'

export default function EstatisticasEstudoExample() {
  // In a real application, you would get the userId from authentication
  const userId = 'example-user-id'

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">EstatisticasEstudo Component</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Dashboard de estatísticas de estudo com gráficos e insights
        </p>
      </div>

      {/* Example 1: Default (monthly view) */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Exemplo 1: Visão Mensal (Padrão)</h2>
        <EstatisticasEstudo userId={userId} periodo="mes" />
      </section>

      {/* Example 2: Weekly view */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Exemplo 2: Visão Semanal</h2>
        <EstatisticasEstudo userId={userId} periodo="semana" />
      </section>

      {/* Example 3: Yearly view */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Exemplo 3: Visão Anual</h2>
        <EstatisticasEstudo userId={userId} periodo="ano" />
      </section>

      {/* Features Documentation */}
      <section className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Funcionalidades Implementadas</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Total de horas estudadas:</strong> Exibe o total de horas no período selecionado</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Média de horas por dia:</strong> Calcula e exibe a média diária de estudo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Gráfico de horas por disciplina:</strong> Barras horizontais mostrando distribuição de tempo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Gráfico de evolução temporal:</strong> Visualização dos últimos 7 dias com barras verticais</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Destaque de disciplinas com menos estudo:</strong> Badge amarelo e insights para disciplinas que precisam de atenção</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Seletor de período:</strong> Botões para alternar entre semana, mês e ano</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Cards de estatísticas:</strong> 4 cards principais com métricas importantes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Insights e recomendações:</strong> Seção com análise automática dos dados</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Estados vazios:</strong> Mensagens informativas quando não há dados</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Loading states:</strong> Spinner durante carregamento de dados</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Error handling:</strong> Tratamento de erros com mensagens claras</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Responsivo:</strong> Layout adaptável para mobile, tablet e desktop</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Dark mode:</strong> Suporte completo para tema escuro</span>
          </li>
        </ul>
      </section>

      {/* Requirements Coverage */}
      <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Requisitos Atendidos</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="font-semibold text-blue-600 dark:text-blue-400">4.6:</span>
            <span>Sistema exibe estatísticas semanais e mensais de horas estudadas por disciplina</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-blue-600 dark:text-blue-400">4.7:</span>
            <span>Sistema gera gráficos de evolução mostrando tendências de estudo ao longo do tempo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-blue-600 dark:text-blue-400">4.8:</span>
            <span>Sistema destaca disciplinas com menos horas de estudo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-blue-600 dark:text-blue-400">6.2:</span>
            <span>Sistema exibe estados vazios informativos quando não houver dados cadastrados</span>
          </li>
        </ul>
      </section>
    </div>
  )
}
