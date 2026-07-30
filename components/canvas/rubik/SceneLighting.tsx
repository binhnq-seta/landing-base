'use client'

import { Environment } from '@react-three/drei'

export function SceneLighting() {
  return (
    <>
      {/* Soft blue ambient — dark cube stays dark in shadow, blue tint overall */}
      <ambientLight intensity={0.30} color="#6090d0" />

      {/* Key: upper-right — softened to prevent top-face blowout */}
      <directionalLight position={[6, 9, 5]} intensity={2.2} color="#ddeeff" />

      {/* Blue fill: left front */}
      <directionalLight position={[-4, 2, 5]} intensity={2.0} color="#4070ff" />

      {/* Front point */}
      <pointLight position={[0, 0, 7]} intensity={2.5} color="#70b0ff" distance={16} decay={2} />

      {/* Deep-blue back rim */}
      <directionalLight position={[0, -3, -8]} intensity={1.8} color="#1040b0" />

      {/* Upper specular — reduced to tame top-face highlight */}
      <pointLight position={[2.5, 3.5, 5]} intensity={2.8} color="#90c0ff" distance={18} decay={2} />

      {/* City HDRI — neon reflections suit dark metallic blue */}
      <Environment preset="city" />
    </>
  )
}
