'use client'

import { useThreeScene } from '@/hooks/useThreeScene'
import { createParticleField, createAmbientLight } from '@/lib/three/scene'

interface ParticleCanvasProps {
  className?: string
  count?: number
  color?: number
}

export function ParticleCanvas({
  className = '',
  count = 600,
  color = 0x8b5cf6,
}: ParticleCanvasProps) {
  const canvasRef = useThreeScene({
    onInit: ({ scene, renderer }) => {
      const particles = createParticleField(count, 12, 0.025, color)
      const light = createAmbientLight(1)
      scene.add(particles, light)

      renderer.setClearColor(0x000000, 0)

      return () => {
        particles.geometry.dispose()
        const material = particles.material as THREE.PointsMaterial
        material.map?.dispose()
        material.alphaMap?.dispose()
        material.dispose()
      }
    },
    onFrame: ({ renderer, scene, camera, elapsed }) => {
      // Gentle drift
      scene.rotation.y = elapsed * 0.04
      scene.rotation.x = Math.sin(elapsed * 0.02) * 0.08
      renderer.render(scene, camera)
    },
  })

  return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />
}

// Needed for THREE import in this file
import * as THREE from 'three'
void THREE
