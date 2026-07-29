'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { WingDef } from './config'

// ─── Wing geometry (from GLTF) ────────────────────────────────────────────────
//
// The GLTF contains TriangleGeometry nodes (Spline.design "Triangle" shape with
// spikes=5, cornerRadius=40) — a rounded 5-sided polygon used as the wing/petal.
// All 6 wing nodes are named "Triangle" in the GLTF; useGLTF returns the last
// traversed one, but they all share the same shape.
//
// GLTF geometry is ~343×299×12 local units.
// Scale 0.01 → ~3.44×2.99×0.12 scene units — similar to the old hand-drawn petal.
//
// Orientation note: the geometry's natural orientation in local space is unknown
// (Spline.design may create shapes flat in XZ rather than XY). The wing's visual
// angle is therefore controlled by:
//   1. An optional geometry pre-rotation below (adjust if wings appear sideways)
//   2. The Wing group rotation (rotX, rotY, rotZ from config) for each direction
//

// ─── Icon drawing (canvas fallback) ──────────────────────────────────────────

function drawIcon(
  ctx: CanvasRenderingContext2D,
  iconType: string,
  cx: number, cy: number, r: number,
) {
  ctx.strokeStyle = 'rgba(255, 220, 120, 0.92)'
  ctx.fillStyle   = 'rgba(255, 220, 120, 0.92)'
  ctx.lineWidth   = r / 9
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'

  switch (iconType) {
    case 'shield': {
      ctx.beginPath()
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx + r, cy - r * 0.42)
      ctx.lineTo(cx + r, cy + r * 0.18)
      ctx.quadraticCurveTo(cx + r * 0.52, cy + r, cx, cy + r)
      ctx.quadraticCurveTo(cx - r * 0.52, cy + r, cx - r, cy + r * 0.18)
      ctx.lineTo(cx - r, cy - r * 0.42)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - r * 0.32, cy + r * 0.08)
      ctx.lineTo(cx - r * 0.06, cy + r * 0.35)
      ctx.lineTo(cx + r * 0.38, cy - r * 0.22)
      ctx.stroke()
      break
    }
    case 'layers': {
      const bar = (yOff: number, w: number) => {
        roundRectPath(ctx, cx - w, cy + yOff - r * 0.12, w * 2, r * 0.24, r * 0.07)
        ctx.stroke()
      }
      bar(-r * 0.48, r * 0.82)
      bar(0,          r * 0.96)
      bar( r * 0.48,  r * 0.82)
      break
    }
    case 'signal': {
      for (let i = 0; i < 3; i++) {
        const rad = r * (0.26 + i * 0.38)
        ctx.beginPath()
        ctx.arc(cx, cy + r * 0.28, rad, Math.PI + 0.45, Math.PI * 2 - 0.45)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(cx, cy + r * 0.28, r * 0.09, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'bolt': {
      ctx.beginPath()
      ctx.moveTo(cx + r * 0.18, cy - r)
      ctx.lineTo(cx - r * 0.1,  cy + r * 0.06)
      ctx.lineTo(cx + r * 0.14, cy + r * 0.06)
      ctx.lineTo(cx - r * 0.18, cy + r)
      ctx.stroke()
      break
    }
    case 'lock': {
      roundRectPath(ctx, cx - r * 0.58, cy + r * 0.06, r * 1.16, r * 0.78, r * 0.12)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, cy - r * 0.06, r * 0.4, Math.PI, 0)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, cy + r * 0.44, r * 0.11, 0, Math.PI * 2)
      ctx.stroke()
      break
    }
    case 'plane':
    default: {
      ctx.beginPath()
      ctx.moveTo(cx, cy - r)
      ctx.bezierCurveTo(cx + r * 0.22, cy - r * 0.4, cx + r * 0.22, cy + r * 0.5, cx, cy + r)
      ctx.bezierCurveTo(cx - r * 0.22, cy + r * 0.5, cx - r * 0.22, cy - r * 0.4, cx, cy - r)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + r * 0.12, cy - r * 0.08)
      ctx.lineTo(cx + r,        cy + r * 0.45)
      ctx.moveTo(cx - r * 0.12, cy - r * 0.08)
      ctx.lineTo(cx - r,        cy + r * 0.45)
      ctx.stroke()
      break
    }
  }
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ─── Panel texture (async — loads SVG from /assets/wings/) ───────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src     = src
  })
}

async function buildPanelTexture(def: WingDef): Promise<THREE.CanvasTexture> {
  const W = 512, H = 320
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, 'rgba(220, 168, 60, 0.38)')
  bg.addColorStop(1, 'rgba(175, 120, 25, 0.22)')
  ctx.fillStyle = bg
  roundRectPath(ctx, 6, 6, W - 12, H - 12, 22)
  ctx.fill()

  ctx.strokeStyle = 'rgba(230, 185, 70, 0.65)'
  ctx.lineWidth   = 1.5
  roundRectPath(ctx, 6, 6, W - 12, H - 12, 22)
  ctx.stroke()

  const shimmer = ctx.createLinearGradient(0, 0, W, 0)
  shimmer.addColorStop(0,   'rgba(200, 160, 60, 0)')
  shimmer.addColorStop(0.5, 'rgba(240, 210, 100, 0.70)')
  shimmer.addColorStop(1,   'rgba(200, 160, 60, 0)')
  ctx.strokeStyle = shimmer
  ctx.lineWidth   = 1.5
  ctx.beginPath(); ctx.moveTo(32, 18); ctx.lineTo(W - 32, 18); ctx.stroke()

  const iconSize = 58
  try {
    const img = await loadImage(`/assets/wings/${def.iconType}.svg`)
    ctx.drawImage(img, W / 2 - iconSize / 2, 48, iconSize, iconSize)
  } catch {
    ctx.save()
    drawIcon(ctx, def.iconType, W / 2, 48 + iconSize / 2, iconSize / 2)
    ctx.restore()
  }

  ctx.font         = `bold 54px "Arial", sans-serif`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle    = 'rgba(255, 248, 210, 0.98)'
  ctx.shadowColor  = 'rgba(200, 140, 30, 0.65)'
  ctx.shadowBlur   = 12
  ctx.fillText(def.line1, W / 2, def.line2 ? 188 : 210)

  if (def.line2) {
    ctx.font      = '43px "Arial", sans-serif'
    ctx.fillStyle = 'rgba(255, 235, 165, 0.88)'
    ctx.shadowBlur = 7
    ctx.fillText(def.line2, W / 2, 250)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

// ─── Component ────────────────────────────────────────────────────────────────

interface WingProps {
  def: WingDef
  hoveredIdRef: React.MutableRefObject<string | null>
  wingsOpenRef: React.MutableRefObject<number>
  onHover?: (id: string | null) => void
  onClick?: (id: string) => void
}

export function Wing({ def, hoveredIdRef, wingsOpenRef, onHover, onClick }: WingProps) {
  const currentOpenRef = useRef(0)
  const panelGroupRef  = useRef<THREE.Group>(null!)
  const panelMatRef    = useRef<THREE.MeshBasicMaterial>(null!)

  // GLTF wing geometry — TriangleGeometry (spikes=5 rounded polygon).
  // Use scene.traverse to find the first Mesh named 'Triangle' — same reason
  // as RubikCube: multiple nodes share the name, last-write-wins gives a Group.
  const { scene: gltfScene } = useGLTF('/models/rubik.gltf')
  const wingGeo = useMemo(() => {
    // The GLTF contains two distinct Triangle mesh shapes:
    //   1st Triangle (mesh 4): wider, compact — used for top/bottom wings
    //   2nd Triangle (mesh 6): taller, elongated — used for diagonal wings
    // shapeType 'triangle' picks the 1st, 'petal' picks the 2nd.
    let geo: THREE.BufferGeometry | null = null
    let count = 0
    const targetCount = def.shapeType === 'triangle' ? 1 : 2
    gltfScene.traverse((child) => {
      if (geo) return
      if (child instanceof THREE.Mesh && child.name === 'Triangle' && child.geometry) {
        count++
        if (count === targetCount) {
          const cloned = child.geometry.clone()
          cloned.scale(0.01, 0.01, 0.01)
          geo = cloned
        }
      }
    })
    // Fallback: pentagon petal if GLTF node not found
    if (!geo) {
      const shape = new THREE.Shape()
      shape.moveTo(0, 2.0)
      shape.lineTo(1.3, 0.2); shape.lineTo(0.5, -1.0)
      shape.lineTo(-0.5, -1.0); shape.lineTo(-1.3, 0.2)
      shape.closePath()
      geo = new THREE.ShapeGeometry(shape)
    }
    return geo
  }, [gltfScene, def.shapeType])

  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let stale = false

    buildPanelTexture(def).then(tex => {
      if (stale) { tex.dispose(); return }
      textureRef.current?.dispose()
      textureRef.current = tex
      setTexture(tex)
    }).catch(() => {})

    return () => {
      stale = true
      textureRef.current?.dispose()
      textureRef.current = null
    }
  }, [def])

  const hingeVec = new THREE.Vector3(...def.hingePos)
  const openVec  = new THREE.Vector3(...def.openPos)

  useFrame((state) => {
    if (!panelGroupRef.current || !panelMatRef.current) return

    const t = state.clock.getElapsedTime()

    const isHovered      = hoveredIdRef.current === def.id
    const isOtherHovered = hoveredIdRef.current !== null && !isHovered

    // Spring toward global open state
    const baseOpen   = Math.max(0, Math.min(1, wingsOpenRef.current))
    const hoverBoost = isHovered ? 0.11 : 0
    const target     = Math.min(1.12, baseOpen + hoverBoost)
    currentOpenRef.current += (target - currentOpenRef.current) * 0.075
    const f = currentOpenRef.current

    // Position: lerp from hingePos (inside cube) → openPos (extended)
    const floatAmp = 0.03
    const floatY   = Math.sin(t * 0.4 + def.order * 0.7) * floatAmp * Math.min(1, f * 2)
    panelGroupRef.current.position.lerpVectors(hingeVec, openVec, f)
    panelGroupRef.current.position.y += floatY

    // Scale: panel grows from 0 as the wing opens
    panelGroupRef.current.scale.setScalar(isHovered ? f * 1.06 : f)

    // Opacity
    const targetOpacity = isHovered ? 1.0 : isOtherHovered ? 0.22 : 0.88
    panelMatRef.current.opacity +=
      (targetOpacity * Math.min(1, f * 1.8) - panelMatRef.current.opacity) * 0.10
  })

  return (
    // rotX: forward lean — outer tip toward viewer, inner base away (same for all wings
    //        because rotZ only rotates in XY and does not affect the Z component).
    // rotZ: direction of apex in the XY plane.
    <group
      ref={panelGroupRef}
      position={def.hingePos}
      rotation={[def.rotX, def.rotY, def.rotZ]}
    >
      <mesh
        onPointerEnter={(e) => {
          e.stopPropagation()
          hoveredIdRef.current = def.id
          onHover?.(def.id)
        }}
        onPointerLeave={() => {
          hoveredIdRef.current = null
          onHover?.(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(def.id)
        }}
      >
        <primitive object={wingGeo} attach="geometry" />
        <meshBasicMaterial
          ref={panelMatRef}
          map={texture ?? undefined}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          opacity={0}
        />
      </mesh>
    </group>
  )
}
