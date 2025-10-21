import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Mescla classes do Tailwind de forma eficiente, evitando conflitos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Debounce - Atrasa a execução de uma função até que um período de tempo tenha passado
 * sem que ela seja chamada novamente. Útil para campos de busca.
 * 
 * @param func - Função a ser executada
 * @param delay - Tempo de espera em milissegundos (padrão: 300ms)
 * @returns Função debounced
 * 
 * @example
 * const debouncedSearch = debounce((term: string) => {
 *   console.log('Searching for:', term)
 * }, 300)
 * 
 * debouncedSearch('test') // Só executa após 300ms sem novas chamadas
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Throttle - Limita a frequência de execução de uma função, garantindo que ela
 * seja executada no máximo uma vez a cada período especificado. Útil para scroll events.
 * 
 * @param func - Função a ser executada
 * @param limit - Intervalo mínimo entre execuções em milissegundos (padrão: 100ms)
 * @returns Função throttled
 * 
 * @example
 * const throttledScroll = throttle(() => {
 *   console.log('Scroll event')
 * }, 100)
 * 
 * window.addEventListener('scroll', throttledScroll)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 100
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  let lastResult: ReturnType<T>

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func(...args)
      inThrottle = true

      setTimeout(() => {
        inThrottle = false
      }, limit)
    }

    return lastResult
  }
}
