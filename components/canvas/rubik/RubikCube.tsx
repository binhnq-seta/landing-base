'use client'

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '@/lib/gsap'
import { CUBE_ROT_X, CUBE_ROT_Y, CUBE_STEP, PIECE_RADIUS, PIECE_SIZE } from './config'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RubikCubeHandle {
  /** Scatter → assemble GSAP timeline; resolves when done */
  assemble(): Promise<void>
  /** Float pieces at scatter positions — shown during loading */
  startDrift(): void
  /** Start idle breathing loop */
  startIdle(): void
  /** Begin section-2 continuous layer rotation */
  startSection2(): void
  groupRef: React.RefObject<THREE.Group>
  layerRefs: [
    React.RefObject<THREE.Group>,
    React.RefObject<THREE.Group>,
    React.RefObject<THREE.Group>,
  ]
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function buildFinalPositions(): THREE.Vector3[] {
  const positions: THREE.Vector3[] = []
  for (let y = -1; y <= 1; y++) {
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        positions.push(new THREE.Vector3(x * CUBE_STEP, y * CUBE_STEP, z * CUBE_STEP))
      }
    }
  }
  return positions
}

/**
 * Scatter sphere — smaller radius so all pieces remain within the viewport
 * at HERO_SCALE=0.42. Range 3.0–4.6 local = 1.26–1.93 world, within ±2.69.
 */
function buildScatterPositions(count: number): THREE.Vector3[] {
  return Array.from({ length: count }, (_, i) => {
    const theta = i * 2.399963           // golden angle
    const phi   = Math.acos(1 - (2 * (i + 0.5)) / count)
    const r     = 3.0 + (i % 3) * 0.8  // 3.0, 3.8, 4.6
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    )
  })
}

function buildScatterRotations(count: number): THREE.Euler[] {
  return Array.from({ length: count }, (_, i) => {
    const s = i * 1.618
    return new THREE.Euler(
      (s % Math.PI) * 2,
      ((s * 1.3) % Math.PI) * 2,
      ((s * 0.7) % Math.PI) * 2,
    )
  })
}

// ─── Crystal material ─────────────────────────────────────────────────────────
//
// Design intent: sapphire-blue luxury crystal against a light (slate-200) background.
//
// Key knobs:
//   transmission=0.82  — nearly transparent; background colour bleeds through
//   ior=2.2            — strong refraction (sapphire is ~1.77, diamond ~2.42)
//   thickness=1.8      — path length for attenuation; longer = deeper blue core
//   attenuationColor   — volumetric absorption colour: deep indigo-blue
//   attenuationDistance — how quickly colour accumulates (smaller = darker interior)
//   envMapIntensity=10 — studio HDRI provides dark-area reflections → contrast
//   clearcoat=1        — second glossy layer for the gem-polish micro-specular
//
function useCrystalMaterial(isMobile: boolean) {
  return useMemo(() => {
    if (isMobile) {
      // Mobile: skip expensive transmission, keep clear-blue tint + clearcoat
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x2060c8),
        roughness: 0.05,
        metalness: 0.0,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        envMapIntensity: 4.0,
        transparent: true,
        opacity: 0.80,
      })
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(1, 1, 1),         // white — attenuation adds the blue
      transmission: 0.82,                       // highly transparent
      roughness: 0.0,                           // mirror-polished
      metalness: 0.0,
      ior: 2.2,                                 // strong refraction / Fresnel
      thickness: 1.8,                           // deep for strong attenuation
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      envMapIntensity: 10.0,                    // max HDRI reflections
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0x8ab5ff), // cool-blue specular highlights
    })

    // Volumetric crystal colour: thin edges clear, thick centre deep blue
    mat.attenuationColor    = new THREE.Color(0x1855d0)
    mat.attenuationDistance = 0.35

    return mat
  }, [isMobile])
}

// ─── Letter texture builder ────────────────────────────────────────────────────

function makeLetterTexture(letter: string, isRed: boolean): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width  = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, size, size)
  ctx.font          = `bold ${size * 0.74}px "Helvetica Neue", Arial, sans-serif`
  ctx.textAlign     = 'center'
  ctx.textBaseline  = 'middle'

  if (isRed) {
    // Brand-red S with soft glow
    ctx.shadowColor = '#c42020'
    ctx.shadowBlur  = 55
    ctx.fillStyle   = '#c42020'
    ctx.fillText(letter, size / 2, size / 2)
    ctx.shadowBlur  = 18
    ctx.fillStyle   = '#e03030'
    ctx.fillText(letter, size / 2, size / 2)
  } else {
    // G — silver-white luminous
    ctx.shadowColor = 'rgba(200, 228, 255, 0.95)'
    ctx.shadowBlur  = 36
    ctx.fillStyle   = 'rgba(235, 246, 255, 0.97)'
    ctx.fillText(letter, size / 2, size / 2)
    ctx.shadowBlur  = 10
    ctx.fillStyle   = 'rgba(255, 255, 255, 0.90)'
    ctx.fillText(letter, size / 2, size / 2)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

// ─── Layer index helper ───────────────────────────────────────────────────────

function layerOf(i: number): number {
  return Math.floor(i / 9)
}

// ─── Component ───────────────────────────────────────────────────────────────

const FINAL_POS   = buildFinalPositions()
const SCATTER_POS = buildScatterPositions(27)
const SCATTER_ROT = buildScatterRotations(27)

interface RubikCubeProps {
  isMobile: boolean
}

export const RubikCube = forwardRef<RubikCubeHandle, RubikCubeProps>(
  ({ isMobile }, ref) => {
    const crystalMat = useCrystalMaterial(isMobile)

    const groupRef = useRef<THREE.Group>(null!)
    const layerRefs: [
      React.RefObject<THREE.Group>,
      React.RefObject<THREE.Group>,
      React.RefObject<THREE.Group>
    ] = [
      useRef<THREE.Group>(null!),
      useRef<THREE.Group>(null!),
      useRef<THREE.Group>(null!),
    ]
    const pieceRefs = useRef<(THREE.Mesh | null)[]>(Array(27).fill(null))

    // Letter textures — state so React re-renders when canvas is ready
    const [gTex, setGTex] = useState<THREE.CanvasTexture | null>(null)
    const [sTex, setSTex] = useState<THREE.CanvasTexture | null>(null)

    const driftRef    = useRef(false)
    const idleRef     = useRef(false)
    const section2Ref = useRef(false)

    useEffect(() => {
      const g = makeLetterTexture('G', false)
      const s = makeLetterTexture('S', true)
      setGTex(g)
      setSTex(s)
      return () => { g.dispose(); s.dispose() }
    }, [])

    // Place pieces at scatter positions on mount (before any animation)
    useEffect(() => {
      pieceRefs.current.forEach((mesh, i) => {
        if (!mesh) return
        mesh.position.copy(SCATTER_POS[i])
        mesh.rotation.copy(SCATTER_ROT[i])
      })
      if (groupRef.current) {
        groupRef.current.rotation.y = CUBE_ROT_Y
        groupRef.current.rotation.x = CUBE_ROT_X
      }
    }, [])

    // ── Imperative handle ──────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      groupRef,
      layerRefs,

      startDrift() {
        section2Ref.current = false
        idleRef.current     = false
        driftRef.current    = true
      },

      assemble() {
        // Stop drift before GSAP takes position control
        driftRef.current = false

        return new Promise<void>((resolve) => {
          const tl = gsap.timeline({ onComplete: resolve })

          pieceRefs.current.forEach((mesh, i) => {
            if (!mesh) return
            const fp    = FINAL_POS[i]
            // Stagger: each piece starts 0.020s after the previous
            // power4.out: fast initial pull then smooth landing — premium feel
            const start = i * 0.020

            tl.to(
              mesh.position,
              { x: fp.x, y: fp.y, z: fp.z, duration: 1.35, ease: 'power4.out' },
              start,
            )
            tl.to(
              mesh.rotation,
              { x: 0, y: 0, z: 0, duration: 1.35, ease: 'power4.out' },
              start,
            )
          })
        })
      },

      startIdle() {
        driftRef.current    = false
        section2Ref.current = false
        idleRef.current     = true
      },

      startSection2() {
        driftRef.current  = false
        idleRef.current   = false
        section2Ref.current = true
      },
    }))

    // ── Per-frame animation ────────────────────────────────────────────────────
    useFrame((state) => {
      const t = state.clock.getElapsedTime()

      // ── Drift: pieces float slowly around scatter positions ──────────────────
      if (driftRef.current) {
        pieceRefs.current.forEach((mesh, i) => {
          if (!mesh) return
          const phase = i * 0.618        // golden-ratio phase offset per piece
          const amp   = 0.18             // drift amplitude
          const sp    = SCATTER_POS[i]
          // Independent sinusoidal motion on each axis
          mesh.position.x = sp.x + Math.sin(t * 0.28 + phase)          * amp
          mesh.position.y = sp.y + Math.cos(t * 0.25 + phase * 1.4)    * amp
          mesh.position.z = sp.z + Math.sin(t * 0.31 + phase * 0.85)   * amp
          // Slow tumble
          mesh.rotation.x += 0.005
          mesh.rotation.y += 0.004
          mesh.rotation.z += 0.003
        })
      }

      // ── Idle: gentle float + ~0.9° lateral breathe (no spin) ────────────────
      if (idleRef.current && groupRef.current) {
        groupRef.current.position.y +=
          (Math.sin(t * 0.4) * 0.07 - groupRef.current.position.y) * 0.03
        groupRef.current.rotation.z  = Math.sin(t * 0.23) * 0.016
        groupRef.current.rotation.x +=
          (CUBE_ROT_X + Math.sin(t * 0.31) * 0.01 - groupRef.current.rotation.x) * 0.015
        // NO rotation.y — corner stays toward the viewer
      }

      // ── Section 2: counter-rotating layers ──────────────────────────────────
      if (section2Ref.current) {
        if (layerRefs[2].current) layerRefs[2].current.rotation.y += 0.0025
        if (layerRefs[1].current) layerRefs[1].current.rotation.y -= 0.0018
        if (layerRefs[0].current) layerRefs[0].current.rotation.y += 0.0025
      }
    })

    // ── Render ─────────────────────────────────────────────────────────────────

    const layers = [0, 1, 2].map((layerIdx) => {
      const layerPieces = FINAL_POS
        .map((pos, i) => ({ pos, i }))
        .filter(({ i }) => layerOf(i) === layerIdx)

      return (
        <group key={layerIdx} ref={layerRefs[layerIdx]}>
          {layerPieces.map(({ i }) => (
            <RoundedBox
              key={i}
              ref={(m) => { pieceRefs.current[i] = m as THREE.Mesh | null }}
              args={[PIECE_SIZE, PIECE_SIZE, PIECE_SIZE]}
              radius={PIECE_RADIUS}
              smoothness={4}
              position={FINAL_POS[i].toArray() as [number, number, number]}
            >
              <primitive object={crystalMat} attach="material" />
            </RoundedBox>
          ))}
        </group>
      )
    })

    return (
      <group ref={groupRef}>
        {layers}

        {/*
          GS logo: two letters meet at the front vertical edge of the cube.
          At CUBE_ROT_Y=π/4 the front corner is at local (-1.5, y, +1.5).

          G — on the -X face, tile at z=+1 (adjacent to the front edge)
            Position: (-1.52, 0, +1.0)  Rotation: [0, -π/2, 0]  → faces right (toward +X)

          S — on the +Z face, tile at x=-1 (adjacent to the same front edge)
            Position: (-1.0, 0, +1.52)  Rotation: [0, 0, 0]     → faces front (+Z)

          Both land on the two tiles that touch the front corner → "GS" split at the edge.
        */}
        {gTex && (
          <mesh position={[-1.52, 0, 1.0]} rotation={[0, -Math.PI / 2, 0]} renderOrder={1}>
            <planeGeometry args={[0.88, 0.88]} />
            <meshBasicMaterial
              map={gTex}
              transparent
              depthWrite={false}
              side={THREE.FrontSide}
            />
          </mesh>
        )}

        {sTex && (
          <mesh position={[-1.0, 0, 1.52]} renderOrder={1}>
            <planeGeometry args={[0.88, 0.88]} />
            <meshBasicMaterial
              map={sTex}
              transparent
              depthWrite={false}
              side={THREE.FrontSide}
            />
          </mesh>
        )}
      </group>
    )
  },
)

RubikCube.displayName = 'RubikCube'
