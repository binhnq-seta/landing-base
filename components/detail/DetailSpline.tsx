'use client'

import { Application } from '@splinetool/runtime'
import { useEffect, useRef } from 'react'

type DetailSplineProps = {
  sceneUrl: string
}

export function DetailSpline({ sceneUrl }: DetailSplineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const app = new Application(canvas)

    void app.load(sceneUrl).catch((error: unknown) => {
      console.error(`Failed to load Spline scene: ${sceneUrl}`, error)
    })

    return () => app.dispose()
  }, [sceneUrl])

  return <canvas ref={canvasRef} className="block h-full w-full" aria-label="Mô hình 3D tương tác" />
}
