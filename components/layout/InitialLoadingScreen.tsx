'use client'

import { useEffect, useRef, useState } from 'react'

const MIN_VISIBLE_MS = 1200
const FADE_DURATION_MS = 500

type InitialLoadingScreenProps = {
  isLoading?: boolean
  eyebrow: string
  title: string
  description: string
}

export function InitialLoadingScreen({ isLoading = true, eyebrow, title, description }: InitialLoadingScreenProps) {
  const mountedAt = useRef(Date.now())
  const [isMounted, setIsMounted] = useState(true)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (isLoading) {
      mountedAt.current = Date.now()
      setIsMounted(true)
      setIsVisible(true)
      return
    }

    const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - mountedAt.current))
    let unmountId: number | undefined
    const fadeId = window.setTimeout(() => {
      setIsVisible(false)
      unmountId = window.setTimeout(() => setIsMounted(false), FADE_DURATION_MS)
    }, remaining)

    return () => {
      window.clearTimeout(fadeId)
      if (unmountId !== undefined) window.clearTimeout(unmountId)
    }
  }, [isLoading])

  if (!isMounted) return null

  return (
    <div
      aria-busy={isLoading}
      aria-live="polite"
      className={`fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-neutral-950 px-6 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_38%),linear-gradient(to_bottom,rgba(17,24,39,1),rgba(9,9,11,1))]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-8 flex items-center justify-center rounded-full border border-blue-400/20 bg-white/5 p-4 shadow-[0_0_80px_rgba(59,130,246,0.22)] backdrop-blur-md">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-r-sky-300 border-t-blue-400" />
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-400 to-sky-300 opacity-90" />
          </div>
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-blue-300/80">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">{description}</p>
        <div className="mt-10 flex items-center gap-2" aria-hidden="true">
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-sky-300 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-200" />
        </div>
      </div>
    </div>
  )
}
