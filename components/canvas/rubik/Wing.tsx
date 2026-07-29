'use client'

import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { WingDef } from './config'

// ─── Shared geometry (module-level singletons) ────────────────────────────────
//
// Triangle — top and bottom wings.
//   Narrow and tall so the outer tip is prominent above/below the cube.
//   Inner base (at y = -H/2) is hidden by the cube through depth occlusion.
//
// Petal — four diagonal wings (matching the image reference).
//   Pentagon: one outer tip → two wide shoulder points → two narrow inner base points.
//   The inner base (at y = -H_in) sits inside the cube's silhouette and is
//   depth-occluded by the cube's MeshPhysicalMaterial (which writes depth).
//
// All shapes: local +Y = direction toward the outer tip (apex).
//             rotX = -0.28 tilts the apex toward the viewer (+Z) before rotZ
//             is applied. Because rotZ only rotates in XY, the Z-lean is
//             preserved in every wing orientation.

let _triangleGeom: THREE.ShapeGeometry | null = null
let _petalGeom:    THREE.ShapeGeometry | null = null

function getTriangleGeometry(): THREE.ShapeGeometry {
  if (_triangleGeom) return _triangleGeom
  const W = 2.2, H = 5.5
  const s = new THREE.Shape()
  s.moveTo(-W / 2, -H / 2)   // base left  (inner — occluded by cube)
  s.lineTo( W / 2, -H / 2)   // base right
  s.lineTo( 0,      H / 2)   // apex (outer tip)
  s.closePath()
  _triangleGeom = new THREE.ShapeGeometry(s)
  return _triangleGeom
}

// Pentagon petal — shaped like the reference image:
//   outer tip   (0,         TIP_Y )
//   R shoulder  (SHLD_X,    SHLD_Y)  ← widest point
//   R base      (BASE_X,   -BASE_Y)  ← inner edge, hidden by cube
//   L base      (-BASE_X,  -BASE_Y)
//   L shoulder  (-SHLD_X,   SHLD_Y)
function getPetalGeometry(): THREE.ShapeGeometry {
  if (_petalGeom) return _petalGeom
  const TIP_Y  = 2.0, SHLD_X = 1.3, SHLD_Y = 0.2
  const BASE_X = 0.5, BASE_Y = 1.0   // BASE_Y is depth below local origin
  const s = new THREE.Shape()
  s.moveTo( 0,       TIP_Y )           // outer tip
  s.lineTo( SHLD_X,  SHLD_Y)           // right shoulder
  s.lineTo( BASE_X, -BASE_Y)           // right inner base
  s.lineTo(-BASE_X, -BASE_Y)           // left inner base
  s.lineTo(-SHLD_X,  SHLD_Y)           // left shoulder
  s.closePath()
  _petalGeom = new THREE.ShapeGeometry(s)
  return _petalGeom
}

// ─── Icon drawing (canvas fallback) ──────────────────────────────────────────

function drawIcon(
  ctx: CanvasRenderingContext2D,
  iconType: string,
  cx: number, cy: number, r: number,
) {
  ctx.strokeStyle = 'rgba(190, 218, 255, 0.92)'
  ctx.fillStyle   = 'rgba(190, 218, 255, 0.92)'
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
  bg.addColorStop(0, 'rgba(215, 232, 255, 0.20)')
  bg.addColorStop(1, 'rgba(180, 208, 255, 0.10)')
  ctx.fillStyle = bg
  roundRectPath(ctx, 6, 6, W - 12, H - 12, 22)
  ctx.fill()

  ctx.strokeStyle = 'rgba(200, 222, 255, 0.55)'
  ctx.lineWidth   = 1.5
  roundRectPath(ctx, 6, 6, W - 12, H - 12, 22)
  ctx.stroke()

  const shimmer = ctx.createLinearGradient(0, 0, W, 0)
  shimmer.addColorStop(0,   'rgba(180, 210, 255, 0)')
  shimmer.addColorStop(0.5, 'rgba(210, 232, 255, 0.70)')
  shimmer.addColorStop(1,   'rgba(180, 210, 255, 0)')
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
  ctx.fillStyle    = 'rgba(232, 245, 255, 0.98)'
  ctx.shadowColor  = 'rgba(140, 195, 255, 0.60)'
  ctx.shadowBlur   = 12
  ctx.fillText(def.line1, W / 2, def.line2 ? 188 : 210)

  if (def.line2) {
    ctx.font      = '43px "Arial", sans-serif'
    ctx.fillStyle = 'rgba(200, 224, 255, 0.88)'
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
  const geometry = def.shapeType === 'triangle' ? getTriangleGeometry() : getPetalGeometry()

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
    const floatAmp = def.shapeType === 'triangle' ? 0.04 : 0.025
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
        <primitive object={geometry} attach="geometry" />
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
