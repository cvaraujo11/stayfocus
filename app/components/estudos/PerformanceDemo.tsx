'use client'

import { useState, useCallback, useRef } from 'react'
import { Search, ArrowUp } from 'lucide-react'
import { Card } from '@/app/components/ui/Card'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { debounce, throttle } from '@/app/lib/utils'
import { useScrollPosition, useScrollThreshold, useScrollDirection } from '@/app/hooks/useScrollPosition'

/**
 * PerformanceDemo - Componente de demonstração de otimizações de performance
 * 
 * Este componente demonstra o uso de debounce e throttle para melhorar
 * a performance da aplicação:
 * 
 * 1. Debounce: Usado em campos de busca para reduzir requisições
 * 2. Throttle: Usado em scroll events para limitar re-renders
 * 
 * Features:
 * - Contador de chamadas para visualizar a diferença
 * - Exemplos práticos de uso
 * - Hooks customizados com throttle
 */
export function PerformanceDemo() {
  // Estados para demonstração de debounce
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchCallCount, setSearchCallCount] = useState(0)
  const [debouncedCallCount, setDebouncedCallCount] = useState(0)
  
  // Estados para demonstração de throttle
  const [scrollCallCount, setScrollCallCount] = useState(0)
  const [throttledScrollCallCount, setThrottledScrollCallCount] = useState(0)
  
  // Hooks de scroll com throttle
  const scrollPosition = useScrollPosition(100)
  const hasScrolled = useScrollThreshold(100)
  const scrollDirection = useScrollDirection(100)
  
  // Função debounced para busca
  const debouncedSearch = useRef(
    debounce((term: string) => {
      setDebouncedSearchTerm(term)
      setDebouncedCallCount(prev => prev + 1)
    }, 300)
  ).current
  
  // Handler de mudança de busca
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setSearchCallCount(prev => prev + 1)
    debouncedSearch(value)
  }, [debouncedSearch])
  
  // Função throttled para scroll (apenas para demonstração)
  const throttledScrollHandler = useRef(
    throttle(() => {
      setThrottledScrollCallCount(prev => prev + 1)
    }, 100)
  ).current
  
  // Simular scroll handler sem throttle (apenas para contagem)
  const handleScroll = useCallback(() => {
    setScrollCallCount(prev => prev + 1)
    throttledScrollHandler()
  }, [throttledScrollHandler])
  
  // Scroll to top
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  
  return (
    <div className="space-y-6">
      {/* Demonstração de Debounce */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Demonstração de Debounce
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Campo de Busca (com debounce de 300ms)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Digite para buscar..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Chamadas sem debounce
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {searchCallCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Atualiza a cada tecla
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                Chamadas com debounce
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {debouncedCallCount}
              </div>
              <div className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                Atualiza após 300ms de pausa
              </div>
            </div>
          </div>
          
          {debouncedSearchTerm && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="text-sm text-green-700 dark:text-green-300">
                <strong>Termo buscado:</strong> "{debouncedSearchTerm}"
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                Esta busca seria enviada ao servidor
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Benefício:</strong> Reduz requisições ao servidor de {searchCallCount} para {debouncedCallCount}
            {searchCallCount > 0 && (
              <span className="text-green-600 dark:text-green-400 ml-1">
                (economia de {Math.round((1 - debouncedCallCount / searchCallCount) * 100)}%)
              </span>
            )}
          </div>
        </div>
      </Card>
      
      {/* Demonstração de Throttle */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Demonstração de Throttle
        </h3>
        
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Role a página para ver o throttle em ação
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                  Posição Y
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Math.round(scrollPosition.y)}px
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                  Direção
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {scrollDirection === 'down' ? '↓ Baixo' : scrollDirection === 'up' ? '↑ Cima' : '—'}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                  Scrolled?
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {hasScrolled ? '✓ Sim' : '✗ Não'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Benefício:</strong> Limita atualizações durante scroll para no máximo 1 a cada 100ms,
            evitando re-renders excessivos e melhorando a performance.
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Uso prático:</strong> Os hooks useScrollPosition, useScrollThreshold e useScrollDirection
              usam throttle internamente para otimizar a performance.
            </div>
          </div>
        </div>
      </Card>
      
      {/* Botão de voltar ao topo (demonstração prática) */}
      {hasScrolled && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={scrollToTop}
            className="shadow-lg"
            icon={<ArrowUp className="h-4 w-4" />}
            aria-label="Voltar ao topo"
          >
            Topo
          </Button>
        </div>
      )}
      
      {/* Conteúdo extra para permitir scroll */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
              Seção {i}
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Este é um conteúdo de exemplo para permitir scroll na página.
              Role para ver o throttle em ação nos indicadores acima.
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
