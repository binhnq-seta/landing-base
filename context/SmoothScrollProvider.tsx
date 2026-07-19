'use client'

import { createContext, useContext, useEffect, useRef, ReactNode, RefObject } from 'react'
import Lenis from '@studio-freight/lenis'
import { connectLenisToScrollTrigger } from '@/lib/gsap'

interface SmoothScrollContextValue {
  lenisRef: RefObject<Lenis | null>
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenisRef: { current: null },
})

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenisRef.current = lenis
    const disconnectLenis = connectLenisToScrollTrigger(lenis)

    return () => {
      disconnectLenis()
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return (
    <SmoothScrollContext.Provider value={{ lenisRef }}>
      {children}
    </SmoothScrollContext.Provider>
  )
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}
