'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'

interface CameraRigProps {
  /** Normalised mouse coords in [-1, 1] range, updated by parent */
  mouseRef: React.RefObject<[number, number]>
}

/**
 * Applies a subtle mouse-parallax offset to the camera so the scene feels
 * alive. Interpolates smoothly — never teleports.
 */
export function CameraRig({ mouseRef }: CameraRigProps) {
  const { camera } = useThree()
  // Store the base camera Z so we can restore it on scroll
  const baseZ = useRef(camera.position.z)

  useFrame(() => {
    const [mx, my] = mouseRef.current ?? [0, 0]

    // Lerp towards target offset (±0.4 units on each axis)
    camera.position.x += (mx * 0.4 - camera.position.x) * 0.04
    camera.position.y += (my * 0.25 - camera.position.y) * 0.04
    camera.position.z += (baseZ.current - camera.position.z) * 0.04

    camera.lookAt(0, 0, 0)
  })

  return null
}
