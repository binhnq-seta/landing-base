'use client'

import { Environment } from '@react-three/drei'

/**
 * Lighting designed for a sapphire-crystal object on a light (slate-200) background.
 *
 * The challenge: without dark surroundings, there's nothing for the crystal to
 * reflect that creates contrast. We solve this with:
 *
 *  1. High envMapIntensity (set on material, 10×) — the studio HDRI has dark
 *     floor areas that appear as dark reflections, giving the cube "depth."
 *
 *  2. Strong deep-blue rim lights from behind/below — these punch a blue edge
 *     highlight around the crystal, making it pop off the gray background.
 *
 *  3. Cold white key from upper-right — creates broad bright specular on one
 *     face and leaves the others in relative shadow (directionality = 3D depth).
 *
 *  4. Very low ambient — prevents the crystal from washing out to flat white.
 */
export function SceneLighting() {
  return (
    <>
      {/* Blue-tinted ambient — crystal needs some base fill on dark background */}
      <ambientLight intensity={0.20} color="#6080c0" />

      {/* Key: upper-right front — strong cold white for crisp specular face */}
      <directionalLight position={[6, 9, 5]} intensity={5.0} color="#e8f4ff" />

      {/* Fill: left front — keeps shadow faces visible on dark bg */}
      <directionalLight position={[-4, 2, 5]} intensity={2.0} color="#c8deff" />

      {/* Front glow: close point for bright crystal transmission highlights */}
      <pointLight position={[0, 0, 7]} intensity={3.5} color="#a0c8ff" distance={14} decay={2} />

      {/* Back-bottom rim: deep-blue edge glow */}
      <directionalLight position={[0, -3, -8]} intensity={3.5} color="#1235b4" />

      {/* Crown: blue top light — separates top face on dark bg */}
      <directionalLight position={[-4, 7, -5]} intensity={2.2} color="#2050c8" />

      {/* Specular sparkle: close point for pin-highlight clarity */}
      <pointLight position={[2.5, 3, 5]} intensity={5.0} color="#ffffff" distance={16} decay={2} />

      {/* Side fill: right point, balances harsh key */}
      <pointLight position={[5, 0, 2]} intensity={1.5} color="#80a8e0" distance={14} decay={2} />

      {/* Cool bounce from below */}
      <pointLight position={[0, -5, 2]} intensity={1.2} color="#1030a0" distance={12} decay={2} />

      {/* Studio HDRI — refraction colouring and reflections */}
      <Environment preset="studio" />
    </>
  )
}
