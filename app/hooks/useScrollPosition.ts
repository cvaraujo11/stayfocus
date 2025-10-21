import { useState, useEffect, useRef } from 'react'
import { throttle } from '@/app/lib/utils'

interface ScrollPosition {
  x: number
  y: number
}

/**
 * Hook personalizado para rastrear a posição do scroll com throttle
 * 
 * Usa throttle para limitar a frequência de atualizações durante o scroll,
 * melhorando a performance ao evitar re-renders excessivos.
 * 
 * @param throttleMs - Intervalo de throttle em milissegundos (padrão: 100ms)
 * @returns Posição atual do scroll { x, y }
 * 
 * @example
 * const scrollPosition = useScrollPosition(100)
 * console.log('Scroll Y:', scrollPosition.y)
 */
export function useScrollPosition(throttleMs: number = 100): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
  })

  // Criar função throttled usando useRef para manter a mesma instância
  const throttledSetScrollPosition = useRef(
    throttle((x: number, y: number) => {
      setScrollPosition({ x, y })
    }, throttleMs)
  ).current

  useEffect(() => {
    // Handler de scroll que usa a função throttled
    const handleScroll = () => {
      throttledSetScrollPosition(window.scrollX, window.scrollY)
    }

    // Definir posição inicial
    setScrollPosition({
      x: window.scrollX,
      y: window.scrollY,
    })

    // Adicionar listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [throttledSetScrollPosition])

  return scrollPosition
}

/**
 * Hook para detectar se o usuário rolou além de um certo ponto
 * 
 * Útil para mostrar/esconder elementos baseado na posição do scroll,
 * como botões "voltar ao topo" ou headers sticky.
 * 
 * @param threshold - Posição Y em pixels para considerar como "scrolled" (padrão: 100)
 * @param throttleMs - Intervalo de throttle em milissegundos (padrão: 100ms)
 * @returns true se scrollY > threshold
 * 
 * @example
 * const hasScrolled = useScrollThreshold(100)
 * return hasScrolled && <BackToTopButton />
 */
export function useScrollThreshold(
  threshold: number = 100,
  throttleMs: number = 100
): boolean {
  const [hasScrolled, setHasScrolled] = useState(false)

  const throttledCheckScroll = useRef(
    throttle(() => {
      const scrolled = window.scrollY > threshold
      setHasScrolled(scrolled)
    }, throttleMs)
  ).current

  useEffect(() => {
    // Verificar posição inicial
    setHasScrolled(window.scrollY > threshold)

    // Handler de scroll
    const handleScroll = () => {
      throttledCheckScroll()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [threshold, throttledCheckScroll])

  return hasScrolled
}

/**
 * Hook para detectar direção do scroll (up/down)
 * 
 * Útil para implementar comportamentos como esconder/mostrar navbar
 * baseado na direção do scroll.
 * 
 * @param throttleMs - Intervalo de throttle em milissegundos (padrão: 100ms)
 * @returns 'up' | 'down' | null
 * 
 * @example
 * const scrollDirection = useScrollDirection()
 * return <Navbar hidden={scrollDirection === 'down'} />
 */
export function useScrollDirection(
  throttleMs: number = 100
): 'up' | 'down' | null {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const lastScrollY = useRef(0)

  const throttledCheckDirection = useRef(
    throttle(() => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down')
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up')
      }

      lastScrollY.current = currentScrollY
    }, throttleMs)
  ).current

  useEffect(() => {
    lastScrollY.current = window.scrollY

    const handleScroll = () => {
      throttledCheckDirection()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [throttledCheckDirection])

  return scrollDirection
}
