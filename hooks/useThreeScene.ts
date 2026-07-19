'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { createScene, type ThreeScene } from '@/lib/three/scene'

interface UseThreeSceneOptions {
  /** Called once after the renderer is created. Add objects to scene here. */
  onInit?: (ctx: ThreeScene) => (() => void) | void
  /** Called every frame. Return false to stop the loop. */
  onFrame?: (ctx: ThreeScene & { delta: number; elapsed: number }) => void
}

/**
 * Mounts a Three.js renderer to a canvas ref and starts a RAF loop.
 *
 * @example
 * const canvasRef = useThreeScene({
 *   onInit: ({ scene }) => { scene.add(myMesh) },
 *   onFrame: ({ renderer, scene, camera }) => { renderer.render(scene, camera) },
 * })
 * return <canvas ref={canvasRef} className="..." />
 */
export function useThreeScene(options: UseThreeSceneOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const threeRef = useRef<ThreeScene | null>(null)
  const rafRef = useRef<number>(0)
  const cleanupRef = useRef<(() => void) | void>(null)

  const { onInit, onFrame } = options

  const start = useCallback(() => {
    if (!threeRef.current) return

    const loop = () => {
      if (!threeRef.current) return
      const { clock, renderer, scene, camera } = threeRef.current
      const delta = clock.getDelta()
      const elapsed = clock.getElapsedTime()

      onFrame?.({ ...threeRef.current, delta, elapsed })

      // Default: render if no custom onFrame provided
      if (!onFrame) renderer.render(scene, camera)

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [onFrame])

  useEffect(() => {
    if (!canvasRef.current) return

    const three = createScene({ canvas: canvasRef.current })
    threeRef.current = three

    // Run user init — capture optional cleanup
    if (onInit) {
      cleanupRef.current = onInit(three)
    }

    start()

    const onResize = () => three.resize()
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      cleanupRef.current?.()
      three.dispose()
      threeRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return canvasRef
}
