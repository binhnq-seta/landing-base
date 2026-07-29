'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { RubikScene } from './rubik/RubikScene'

// ── WebGL detection ───────────────────────────────────────────────────────────
//
// Called as a lazy useState initialiser so it runs synchronously on the first
// client render (the component is already ssr:false from the dynamic() import).
// The Canvas is never mounted when WebGL fails, which prevents Three.js from
// producing its own "Error creating WebGL context" messages on top of the
// browser-level GPU error.
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

// ── Static fallback (shown when WebGL is unavailable) ────────────────────────
//
// Mirrors the cube's hero position (shifted right) so the layout looks similar.
// Also unblocks the hero loading state so the page stays usable without WebGL.
function CanvasFallback({
  onSceneReady,
  onAssemblyComplete,
}: {
  onSceneReady?: () => void
  onAssemblyComplete?: () => void
}) {
  useEffect(() => {
    // Immediately fade the loading overlay
    onSceneReady?.()
    // Unlock scroll + trigger hero text entrance after a brief pause
    const t = setTimeout(() => onAssemblyComplete?.(), 600)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="absolute inset-0 flex items-center pointer-events-none" aria-hidden="true">
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[min(480px,42vw)] aspect-square">
        {/* Replace /assets/rubik-hero.svg with a screenshot of the actual cube if desired */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/rubik-hero.svg"
          alt=""
          className="h-full w-full object-contain opacity-90 drop-shadow-2xl"
        />
      </div>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface RubikCanvasProps {
  heroSectionId?: string
  onSolutionClick?: (id: string) => void
  onSolutionHover?: (id: string | null) => void
  /** Fires when 3D scene initialises — triggers loading overlay fade to reveal drift */
  onSceneReady?: () => void
  /** Fires after assembly + hero slide — triggers hero text entrance */
  onAssemblyComplete?: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RubikCanvas({
  heroSectionId = 'home',
  onSolutionClick,
  onSolutionHover,
  onSceneReady,
  onAssemblyComplete,
}: RubikCanvasProps) {
  const mouseRef = useRef<[number, number]>([0, 0])
  const isMobile = useRef(false)

  // Lazy init: detectWebGL() runs once synchronously on the first client render.
  // The result is stable for the component lifetime — no useEffect needed.
  const [webglOk] = useState(detectWebGL)

  useEffect(() => {
    isMobile.current = window.innerWidth < 768
    const onResize = () => { isMobile.current = window.innerWidth < 768 }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = e
    const rect = currentTarget.getBoundingClientRect()
    mouseRef.current = [
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -(((clientY - rect.top) / rect.height) * 2 - 1),
    ]
  }, [])

  const handlePointerLeave = useCallback(() => {
    mouseRef.current = [0, 0]
  }, [])

  if (!webglOk) {
    return (
      <CanvasFallback
        onSceneReady={onSceneReady}
        onAssemblyComplete={onAssemblyComplete}
      />
    )
  }

  return (
    <div
      className="absolute inset-0 w-full h-full"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas
        dpr={[1, isMobile.current ? 1.5 : 2]}
        camera={{ fov: 45, near: 0.1, far: 50, position: [0, 0, 6.5] }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: 0,
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <RubikScene
            mouseRef={mouseRef as React.RefObject<[number, number]>}
            onSolutionClick={onSolutionClick}
            onSolutionHover={onSolutionHover}
            onSceneReady={onSceneReady}
            onAssemblyComplete={onAssemblyComplete}
            isMobile={isMobile.current}
            heroSectionId={heroSectionId}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
