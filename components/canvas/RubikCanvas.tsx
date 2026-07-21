'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { RubikScene } from './rubik/RubikScene'

interface RubikCanvasProps {
  heroSectionId?: string
  onSolutionClick?: (id: string) => void
  onSolutionHover?: (id: string | null) => void
  /** Fires when 3D scene initialises — triggers loading overlay fade to reveal drift */
  onSceneReady?: () => void
  /** Fires after assembly + hero slide — triggers hero text entrance */
  onAssemblyComplete?: () => void
}

export function RubikCanvas({
  heroSectionId = 'home',
  onSolutionClick,
  onSolutionHover,
  onSceneReady,
  onAssemblyComplete,
}: RubikCanvasProps) {
  const mouseRef = useRef<[number, number]>([0, 0])
  const isMobile = useRef(false)

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
