'use client'

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three-stdlib'
import { gsap } from '@/lib/gsap'
import { CUBE_ROT_X, CUBE_ROT_Y, CUBE_STEP, PIECE_SIZE } from './config'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RubikCubeHandle {
  /** Scatter → assemble GSAP timeline; resolves when done */
  assemble(): Promise<void>
  /** Float pieces at scatter positions — shown during loading */
  startDrift(): void
  /** Start idle breathing loop */
  startIdle(): void
  /** Stop idle breathing loop without changing any other mode */
  stopIdle(): void
  /** Begin section-2 mode */
  startSection2(): void
  /** Scroll-driven layer separation: t=0→together, t=1→fully apart, reversible */
  setLayerScroll(t: number): void
  /** Bloom a corner piece outward along its diagonal */
  bloomCorner(pieceIndex: number): void
  /** Retract a corner piece back to its final position */
  retractCorner(pieceIndex: number): void
  /** Return the current world-space position of a piece (useful for screen projection) */
  getCornerWorldPosition(pieceIndex: number): THREE.Vector3
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

// ─── Piece geometry ───────────────────────────────────────────────────────────
//
// RoundedBoxGeometry(width, height, depth, segments, radius)
// radius=0.07 with segments=3 gives clearly visible chamfered corners while
// keeping the tri count low enough for 27 simultaneous pieces.
//
const PIECE_GEO = new RoundedBoxGeometry(PIECE_SIZE, PIECE_SIZE, PIECE_SIZE, 3, 0.07)

function usePieceGeometry(): THREE.BufferGeometry {
  return PIECE_GEO
}

// ─── Solution icon textures for corner pieces ────────────────────────────────
//
// Each of the 8 corner pieces gets a distinct solution-related icon drawn on a
// 256×256 canvas (bright cyan glow, transparent bg) used as emissiveMap.
//
// Corner piece indices (x=±1, y=±1, z=±1 in buildFinalPositions order):
//   0→shield  2→signal  6→bolt   8→plane
//  18→lock   20→layers 24→gear  26→satellite
//

type CornerIcon = 'shield' | 'signal' | 'bolt' | 'plane' | 'lock' | 'layers' | 'gear' | 'satellite'
type CornerIconAsset =
  | 'airplane'
  | 'lightbulb'
  | 'cloud'
  | 'earth'
  | 'gear'
  | 'guage'
  | 'monitor'
  | 'shield'

const CORNER_ICON_MAP: Array<[number, CornerIconAsset, CornerIcon]> = [
  [0,  'shield',   'shield'],
  [2,  'earth',    'signal'],
  [6,  'guage',    'bolt'],
  [8,  'airplane', 'plane'],
  [18, 'monitor',  'lock'],
  [20, 'lightbulb',     'layers'],
  [24, 'cloud',    'gear'],
  [26, 'gear',     'satellite'],
]
const CORNER_MAT_INDEX = new Map(CORNER_ICON_MAP.map(([idx], matIdx) => [idx, matIdx]))

function drawSolutionIcon(
  ctx: CanvasRenderingContext2D,
  type: CornerIcon,
  cx: number, cy: number, r: number,
) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  switch (type) {
    case 'shield': {
      ctx.beginPath()
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx + r * 0.75, cy - r * 0.38)
      ctx.lineTo(cx + r * 0.75, cy + r * 0.22)
      ctx.quadraticCurveTo(cx + r * 0.42, cy + r, cx, cy + r)
      ctx.quadraticCurveTo(cx - r * 0.42, cy + r, cx - r * 0.75, cy + r * 0.22)
      ctx.lineTo(cx - r * 0.75, cy - r * 0.38)
      ctx.closePath(); ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - r * 0.28, cy + r * 0.15)
      ctx.lineTo(cx - r * 0.04, cy + r * 0.42)
      ctx.lineTo(cx + r * 0.38, cy - r * 0.18)
      ctx.stroke()
      break
    }
    case 'signal': {
      for (let i = 0; i < 3; i++) {
        const rad = r * (0.26 + i * 0.34)
        ctx.beginPath()
        ctx.arc(cx, cy + r * 0.28, rad, Math.PI + 0.42, Math.PI * 2 - 0.42)
        ctx.stroke()
      }
      ctx.beginPath(); ctx.arc(cx, cy + r * 0.28, r * 0.09, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'bolt': {
      ctx.beginPath()
      ctx.moveTo(cx + r * 0.18, cy - r)
      ctx.lineTo(cx - r * 0.10, cy + r * 0.05)
      ctx.lineTo(cx + r * 0.14, cy + r * 0.05)
      ctx.lineTo(cx - r * 0.18, cy + r)
      ctx.stroke()
      break
    }
    case 'plane': {
      ctx.beginPath()
      ctx.moveTo(cx, cy - r)
      ctx.bezierCurveTo(cx + r * 0.22, cy - r * 0.38, cx + r * 0.22, cy + r * 0.50, cx, cy + r)
      ctx.bezierCurveTo(cx - r * 0.22, cy + r * 0.50, cx - r * 0.22, cy - r * 0.38, cx, cy - r)
      ctx.closePath(); ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + r * 0.11, cy - r * 0.06)
      ctx.lineTo(cx + r,         cy + r * 0.44)
      ctx.moveTo(cx - r * 0.11, cy - r * 0.06)
      ctx.lineTo(cx - r,         cy + r * 0.44)
      ctx.stroke()
      break
    }
    case 'lock': {
      ctx.beginPath()
      ctx.arc(cx, cy - r * 0.25, r * 0.36, Math.PI, 0)
      ctx.stroke()
      const bx = cx - r * 0.52, by = cy - r * 0.04
      const bw = r * 1.04, bh = r * 0.76, br = r * 0.10
      ctx.beginPath()
      ctx.moveTo(bx + br, by)
      ctx.lineTo(bx + bw - br, by); ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br)
      ctx.lineTo(bx + bw, by + bh - br); ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh)
      ctx.lineTo(bx + br, by + bh); ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br)
      ctx.lineTo(bx, by + br); ctx.quadraticCurveTo(bx, by, bx + br, by)
      ctx.closePath(); ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy + r * 0.42, r * 0.10, 0, Math.PI * 2); ctx.fill()
      break
    }
    case 'layers': {
      const bar = (yOff: number, hw: number) => {
        const x = cx - hw, y = cy + yOff - r * 0.11, w = hw * 2, h = r * 0.22, br2 = r * 0.07
        ctx.beginPath()
        ctx.moveTo(x + br2, y); ctx.lineTo(x + w - br2, y)
        ctx.quadraticCurveTo(x + w, y, x + w, y + br2)
        ctx.lineTo(x + w, y + h - br2); ctx.quadraticCurveTo(x + w, y + h, x + w - br2, y + h)
        ctx.lineTo(x + br2, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - br2)
        ctx.lineTo(x, y + br2); ctx.quadraticCurveTo(x, y, x + br2, y)
        ctx.closePath(); ctx.stroke()
      }
      bar(-r * 0.50, r * 0.66)
      bar(0,          r * 0.82)
      bar( r * 0.50,  r * 0.66)
      break
    }
    case 'gear': {
      const teeth = 8, outer = r * 0.82, inner = r * 0.58, tw = 0.28
      ctx.beginPath()
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2 - Math.PI / 2
        const b = a + Math.PI / teeth
        ctx.lineTo(cx + Math.cos(a - tw) * inner, cy + Math.sin(a - tw) * inner)
        ctx.lineTo(cx + Math.cos(a - tw) * outer,  cy + Math.sin(a - tw) * outer)
        ctx.lineTo(cx + Math.cos(a + tw) * outer,  cy + Math.sin(a + tw) * outer)
        ctx.lineTo(cx + Math.cos(a + tw) * inner, cy + Math.sin(a + tw) * inner)
        ctx.lineTo(cx + Math.cos(b - tw) * inner, cy + Math.sin(b - tw) * inner)
      }
      ctx.closePath(); ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.26, 0, Math.PI * 2); ctx.stroke()
      break
    }
    case 'satellite': {
      ctx.beginPath()
      ctx.arc(cx - r * 0.18, cy + r * 0.28, r * 0.68, -Math.PI * 0.75, -Math.PI * 0.12)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - r * 0.18, cy + r * 0.28)
      ctx.lineTo(cx + r * 0.24, cy + r)
      ctx.stroke()
      for (let i = 0; i < 2; i++) {
        const rad = r * (0.28 + i * 0.26)
        ctx.beginPath()
        ctx.arc(cx + r * 0.48, cy - r * 0.22, rad, Math.PI * 0.72, Math.PI * 1.28)
        ctx.stroke()
      }
      break
    }
  }
}

function buildFallbackIconTexture(type: CornerIcon): THREE.CanvasTexture {
  const S = 256
  const canvas = document.createElement('canvas')
  canvas.width = S; canvas.height = S
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, S, S)

  const WHITE = 'rgba(255, 255, 255, 0.96)'
  const GLOW  = 'rgba(220, 240, 255, 0.70)'
  const cx = S / 2, cy = S / 2, r = 82

  ctx.strokeStyle = WHITE
  ctx.fillStyle   = WHITE
  ctx.shadowColor = GLOW
  ctx.shadowBlur  = 2
  ctx.lineWidth   = 1

  drawSolutionIcon(ctx, type, cx, cy, r)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function buildSolutionIconTexture(asset: CornerIconAsset, fallback: CornerIcon): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace

  const image = new Image()
  image.onload = () => {
    const iconSize = 174
    const offset = (size - iconSize) / 2

    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(image, offset, offset, iconSize, iconSize)

    // The source SVGs are black. Recolor their non-transparent pixels white so
    // they contribute to the material's emissive map instead of disappearing.
    ctx.globalCompositeOperation = 'source-in'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)'
    ctx.fillRect(0, 0, size, size)
    ctx.globalCompositeOperation = 'source-over'
    texture.needsUpdate = true
  }
  image.onerror = () => {
    const fallbackTexture = buildFallbackIconTexture(fallback)
    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(fallbackTexture.image, 0, 0)
    fallbackTexture.dispose()
    texture.needsUpdate = true
  }
  image.src = `/assets/icon/${asset}.svg`

  return texture
}

// ─── Sky-azure metallic materials ─────────────────────────────────────────────
function useMetallicMaterials(isMobile: boolean) {
  const cornerTextures = useMemo(
    () => CORNER_ICON_MAP.map(([, asset, fallback]) => buildSolutionIconTexture(asset, fallback)),
    [],
  )

  return useMemo(() => {
    const color              = new THREE.Color(0x55c8f5)
    const roughness          = isMobile ? 0.18 : 0.11
    const metalness          = isMobile ? 0.78 : 0.82
    const clearcoat          = isMobile ? 0.75 : 1.0
    const clearcoatRoughness = isMobile ? 0.08 : 0.03
    const envMapIntensity    = isMobile ? 2.0  : 3.0
    const specularIntensity  = isMobile ? 0.5  : 0.90
    const specularColor      = new THREE.Color(0x80d0ff)

    const shared = { color, roughness, metalness, clearcoat, clearcoatRoughness,
                     envMapIntensity, specularIntensity, specularColor }

    const baseMat = new THREE.MeshPhysicalMaterial({
      ...shared,
      emissive:          new THREE.Color(0x003870),
      emissiveIntensity: 0.12,
    })

    const cornerMats = cornerTextures.map(tex =>
      new THREE.MeshPhysicalMaterial({
        ...shared,
        emissive:          new THREE.Color(0xffffff),
        emissiveIntensity: 0.15,
        emissiveMap:       tex,
      })
    )

    return { baseMat, cornerMats }
  }, [isMobile, cornerTextures])
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
    const pieceGeo                      = usePieceGeometry()
    const { baseMat, cornerMats }       = useMetallicMaterials(isMobile)

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

      stopIdle() {
        idleRef.current = false
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

      bloomCorner(pieceIndex: number) {
        const mesh = pieceRefs.current[pieceIndex]
        if (!mesh) return
        const fp = FINAL_POS[pieceIndex]
        const dir = fp.clone().normalize()
        gsap.to(mesh.position, { x: fp.x + dir.x * 0.65, y: fp.y + dir.y * 0.65, z: fp.z + dir.z * 0.65, duration: 0.7, ease: 'back.out(1.4)' })
      },

      retractCorner(pieceIndex: number) {
        const mesh = pieceRefs.current[pieceIndex]
        if (!mesh) return
        const fp = FINAL_POS[pieceIndex]
        gsap.to(mesh.position, { x: fp.x, y: fp.y, z: fp.z, duration: 0.5, ease: 'power2.inOut' })
      },

      getCornerWorldPosition(pieceIndex: number) {
        const mesh = pieceRefs.current[pieceIndex]
        if (!mesh) return new THREE.Vector3()
        const wp = new THREE.Vector3()
        mesh.getWorldPosition(wp)
        return wp
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
            <mesh
              key={i}
              ref={(m) => { pieceRefs.current[i] = m as THREE.Mesh | null }}
              geometry={pieceGeo}
              position={FINAL_POS[i].toArray() as [number, number, number]}
            >
              <primitive
                object={(() => {
                  const ci = CORNER_MAT_INDEX.get(i)
                  return ci !== undefined ? cornerMats[ci] : baseMat
                })()}
                attach="material"
              />
            </mesh>
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
