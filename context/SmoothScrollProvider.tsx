'use client'

import { createContext, useCallback, useContext, useEffect, useRef, ReactNode, RefObject } from 'react'
import Lenis from '@studio-freight/lenis'
import { connectLenisToScrollTrigger } from '@/lib/gsap'

interface SmoothScrollContextValue {
  lenisRef: RefObject<Lenis | null>
  stopLenis: () => void
  startLenis: () => void
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenisRef: { current: null },
  stopLenis: () => {},
  startLenis: () => {},
})

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef     = useRef<Lenis | null>(null)
  // If stopLenis() is called before Lenis is created (child effect before parent effect),
  // record the pending request so the effect can honour it at creation time.
  const pendingStopRef = useRef(false)

  const stopLenis = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.stop()
    } else {
      pendingStopRef.current = true
    }
  }, [])

  const startLenis = useCallback(() => {
    pendingStopRef.current = false
    lenisRef.current?.start()
  }, [])

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    // Honour a pending stop request from a child (e.g. HeroSection) whose effect
    // ran before this one. Child effects always run before parent effects in React.
    if (pendingStopRef.current) lenis.stop()

    lenisRef.current = lenis
    const disconnectLenis = connectLenisToScrollTrigger(lenis)

    return () => {
      disconnectLenis()
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return (
    <SmoothScrollContext.Provider value={{ lenisRef, stopLenis, startLenis }}>
      {children}
    </SmoothScrollContext.Provider>
  )
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}
