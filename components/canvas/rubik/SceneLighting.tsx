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
      {/* Minimal ambient — let directional / env map carry everything */}
      <ambientLight intensity={0.10} color="#a0bce0" />

      {/* Key: upper-right front — primary highlight face, crisp cold white */}
      <directionalLight position={[6, 9, 5]} intensity={3.5} color="#f0f6ff" />

      {/* Fill: opposite quadrant — softer, keeps shadow face legible */}
      <directionalLight position={[-3, 2, 4]} intensity={0.5} color="#c8deff" />

      {/* Back-bottom rim: strong deep-blue — edge glow visible against light bg */}
      <directionalLight position={[0, -3, -8]} intensity={2.5} color="#1235b4" />

      {/* Upper-back rim: blue crown light on top face, adds depth separation */}
      <directionalLight position={[-4, 7, -5]} intensity={1.4} color="#2050c8" />

      {/* Specular sparkle: close point for the pin-highlight crystal clarity */}
      <pointLight position={[2.5, 3, 5]} intensity={3.0} color="#ffffff" distance={16} decay={2} />

      {/* Cool bounce from below: subtle blue underlight, prevents complete shadow */}
      <pointLight position={[0, -5, 2]} intensity={0.7} color="#1030a0" distance={12} decay={2} />

      {/* Studio HDRI — primary source of refraction colouring and dark reflections */}
      <Environment preset="studio" />
    </>
  )
}
