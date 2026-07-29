'use client'

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
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
  /** Begin section-2 mode */
  startSection2(): void
  /** Scroll-driven layer separation: t=0→together, t=1→fully apart, reversible */
  setLayerScroll(t: number): void
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
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x0e38a8),
        roughness: 0.05,
        metalness: 0.05,
        clearcoat: 0.8,
        clearcoatRoughness: 0.05,
        envMapIntensity: 5.0,
        emissive: new THREE.Color(0x040e28),
        emissiveIntensity: 0.2,
      })
    }

    // Desktop: dark glossy blue — solid lacquer finish, no transmission
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x1240b0),
      roughness: 0.02,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 8.0,
      specularIntensity: 1.5,
      specularColor: new THREE.Color(0x99c4ff),
      emissive: new THREE.Color(0x061840),
      emissiveIntensity: 0.2,
    })
  }, [isMobile])
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

    const driftRef        = useRef(false)
    const idleRef         = useRef(false)
    const section2Ref     = useRef(false)
    // -1 = pre-scroll (untouched), ≥0 = scroll driving layers (0→1 linear)
    const layerScrollTRef = useRef<number>(-1)
    // Accumulates during section-2 slow counter-rotation; reset on mode change
    const sec2RotRef = useRef(0)
    // Lerps to (2/3 * CUBE_STEP) in section-2 — visual gap between the 3 layers
    const sec2GapRef = useRef(0)

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
        driftRef.current        = false
        section2Ref.current     = false
        idleRef.current         = true
        layerScrollTRef.current = -1
        sec2RotRef.current      = 0
        sec2GapRef.current      = 0
        // Reset layer groups so scroll-driven animation starts clean
        for (let i = 0; i < 3; i++) {
          const r = layerRefs[i].current
          if (r) { r.position.set(0, 0, 0); r.rotation.set(0, 0, 0) }
        }
      },

      startSection2() {
        driftRef.current        = false
        idleRef.current         = false
        section2Ref.current     = true
        layerScrollTRef.current = -1
        sec2RotRef.current      = 0
        sec2GapRef.current      = 0
      },

      setLayerScroll(t: number) {
        layerScrollTRef.current = t
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

      // ── Layer animation ───────────────────────────────────────────────────────
      const lt = layerScrollTRef.current

      if (lt >= 0) {
        // Scroll-driven: lt is a LINEAR 0→1 parameter from the scroll handler.
        // sep = bell curve  → position spreads and reunites symmetrically
        // rot = monotonic 2π → each layer completes exactly one full turn
        const SPREAD = 2.8
        const sep = Math.sin(lt * Math.PI)   // 0 → 1 → 0
        const rot = lt * Math.PI * 2          // 0 → 2π  (one full 360° turn)

        if (layerRefs[0].current) {
          layerRefs[0].current.position.y = -sep * SPREAD
          layerRefs[0].current.rotation.y =  rot
          layerRefs[0].current.position.z =  sep * 0.5
        }
        if (layerRefs[1].current) {
          layerRefs[1].current.position.y =  0
          layerRefs[1].current.rotation.y = -rot   // CCW — opposite to layers 0 & 2
          layerRefs[1].current.position.z = -sep * 0.3
        }
        if (layerRefs[2].current) {
          layerRefs[2].current.position.y =  sep * SPREAD
          layerRefs[2].current.rotation.y = -rot
          layerRefs[2].current.position.z =  sep * 0.5
        }
      } else if (section2Ref.current) {
        // Section-2 idle: slow counter-rotation + layers spread apart by 2/3 of one layer height
        sec2RotRef.current += 0.005
        const TARGET_GAP = (2 / 3) * CUBE_STEP   // ≈ 0.667 local units
        sec2GapRef.current += (TARGET_GAP - sec2GapRef.current) * 0.04
        const r   = sec2RotRef.current
        const gap = sec2GapRef.current
        if (layerRefs[0].current) {
          layerRefs[0].current.position.set(0, -gap, 0)
          layerRefs[0].current.rotation.y =  r
        }
        if (layerRefs[1].current) {
          layerRefs[1].current.position.set(0, 0, 0)
          layerRefs[1].current.rotation.y = -r   // CCW
        }
        if (layerRefs[2].current) {
          layerRefs[2].current.position.set(0, gap, 0)
          layerRefs[2].current.rotation.y =  r   // CW — same as layer 0
        }
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
      </group>
    )
  },
)

RubikCube.displayName = 'RubikCube'
