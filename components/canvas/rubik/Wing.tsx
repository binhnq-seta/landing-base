'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { WingDef } from './config'

// ─── Icon drawing ─────────────────────────────────────────────────────────────
// SVG-style line-art icons, drawn on canvas and used as textures.

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
      ctx.beginPath()
      ctx.moveTo(cx + r * 0.12, cy + r * 0.6)
      ctx.lineTo(cx + r * 0.55, cy + r)
      ctx.moveTo(cx - r * 0.12, cy + r * 0.6)
      ctx.lineTo(cx - r * 0.55, cy + r)
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

// ─── Panel canvas texture ─────────────────────────────────────────────────────

function buildPanelTexture(def: WingDef): THREE.CanvasTexture {
  const W = 512
  const H = 320
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, 'rgba(215, 232, 255, 0.18)')
  bg.addColorStop(1, 'rgba(180, 208, 255, 0.09)')
  ctx.fillStyle = bg
  roundRectPath(ctx, 6, 6, W - 12, H - 12, 22)
  ctx.fill()

  ctx.strokeStyle = 'rgba(200, 222, 255, 0.50)'
  ctx.lineWidth   = 1.5
  roundRectPath(ctx, 6, 6, W - 12, H - 12, 22)
  ctx.stroke()

  // Shimmer line along top edge
  const shimmer = ctx.createLinearGradient(0, 0, W, 0)
  shimmer.addColorStop(0,   'rgba(180, 210, 255, 0)')
  shimmer.addColorStop(0.5, 'rgba(210, 232, 255, 0.65)')
  shimmer.addColorStop(1,   'rgba(180, 210, 255, 0)')
  ctx.strokeStyle = shimmer
  ctx.lineWidth   = 1.2
  ctx.beginPath()
  ctx.moveTo(32, 18)
  ctx.lineTo(W - 32, 18)
  ctx.stroke()

  ctx.save()
  drawIcon(ctx, def.iconType, W / 2, 82, 26)
  ctx.restore()

  ctx.font          = `bold 54px "Arial", sans-serif`
  ctx.textAlign     = 'center'
  ctx.textBaseline  = 'middle'
  ctx.fillStyle     = 'rgba(232, 245, 255, 0.98)'
  ctx.shadowColor   = 'rgba(140, 195, 255, 0.55)'
  ctx.shadowBlur    = 10
  ctx.fillText(def.line1, W / 2, def.line2 ? 192 : 210)

  if (def.line2) {
    ctx.font      = '43px "Arial", sans-serif'
    ctx.fillStyle = 'rgba(200, 224, 255, 0.86)'
    ctx.shadowBlur = 7
    ctx.fillText(def.line2, W / 2, 252)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

// ─── Shared metallic arm material ─────────────────────────────────────────────

const ARM_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0x4870a8),
  metalness: 0.8,
  roughness: 0.25,
  transparent: true,
  opacity: 0.80,
})

const HINGE_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0x5888c0),
  metalness: 0.85,
  roughness: 0.20,
  emissive: new THREE.Color(0x102848),
  emissiveIntensity: 0.35,
})

// ─── Component ────────────────────────────────────────────────────────────────

interface WingProps {
  def: WingDef
  /** Shared ref: which wing id is hovered, or null */
  hoveredIdRef: React.MutableRefObject<string | null>
  /**
   * Global wing open state (0 = all folded, 1 = all deployed).
   * Written by RubikScene (scroll + assembly animation).
   * Each Wing independently spring-interpolates toward this value.
   */
  wingsOpenRef: React.MutableRefObject<number>
  onHover?: (id: string | null) => void
  onClick?: (id: string) => void
}

export function Wing({ def, hoveredIdRef, wingsOpenRef, onHover, onClick }: WingProps) {
  // Current spring value for this wing (tracks wingsOpenRef with lag)
  const currentOpenRef = useRef(0)

  const panelGroupRef = useRef<THREE.Group>(null!)
  const armMeshRef    = useRef<THREE.Mesh>(null!)
  const hingeRef      = useRef<THREE.Mesh>(null!)
  const panelMatRef   = useRef<THREE.MeshBasicMaterial>(null!)

  // Pre-compute hinge/open positions as Vector3 once
  const hingeVec = useMemo(
    () => new THREE.Vector3(def.hingePos[0], def.hingePos[1], def.hingePos[2]),
    [def],
  )
  const openVec = useMemo(
    () => new THREE.Vector3(def.openPos[0], def.openPos[1], def.openPos[2]),
    [def],
  )

  // Pre-compute arm rotation (aligns box local-X with the hinge→open direction)
  const armMeta = useMemo(() => {
    const dir = openVec.clone().sub(hingeVec).normalize()
    const len = openVec.distanceTo(hingeVec)
    const q   = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(1, 0, 0),
      dir,
    )
    const euler = new THREE.Euler().setFromQuaternion(q, 'XYZ')
    return { len, euler }
  }, [hingeVec, openVec])

  const texture = useMemo(() => {
    if (typeof window === 'undefined') return null
    return buildPanelTexture(def)
  }, [def])

  useFrame((state) => {
    if (
      !panelGroupRef.current ||
      !armMeshRef.current    ||
      !hingeRef.current      ||
      !panelMatRef.current
    ) return

    const t = state.clock.getElapsedTime()

    const isHovered      = hoveredIdRef.current === def.id
    const isOtherHovered = hoveredIdRef.current !== null && !isHovered

    // ── Spring toward global open state ────────────────────────────────────
    const baseOpen   = Math.max(0, Math.min(1, wingsOpenRef.current))
    const hoverBoost = isHovered ? 0.11 : 0
    const target     = Math.min(1.12, baseOpen + hoverBoost)
    currentOpenRef.current += (target - currentOpenRef.current) * 0.075
    const f = currentOpenRef.current

    // ── Panel position: lerp hinge → open as f goes 0 → 1 ─────────────────
    // Add a gentle float on top when deployed (f≈1)
    const floatY = Math.sin(t * 0.4 + def.order * 0.7) * 0.06 * Math.min(1, f * 2)
    panelGroupRef.current.position.lerpVectors(hingeVec, openVec, f)
    panelGroupRef.current.position.y += floatY

    // ── Panel scale: 0 (closed) → 1 (open) + hover boost ──────────────────
    const panelS = isHovered ? f * 1.07 : f
    panelGroupRef.current.scale.setScalar(panelS)

    // ── Panel opacity ──────────────────────────────────────────────────────
    const targetOpacity = isHovered ? 1.0 : isOtherHovered ? 0.22 : 0.82
    panelMatRef.current.opacity +=
      (targetOpacity * Math.min(1, f * 1.8) - panelMatRef.current.opacity) * 0.10

    // ── Arm: starts at hinge, extends toward panel as f increases ──────────
    //  box args = [armMeta.len, h, w], centered at local x=0.
    //  scale.x = f  → actual arm reaches 0 to armMeta.len*f in local space.
    //  position.x   → advance the scaled arm so its near end stays at x=0.
    //                 center is at (armMeta.len * f) / 2
    armMeshRef.current.position.x = (armMeta.len * f) / 2
    armMeshRef.current.scale.x    = f
    armMeshRef.current.visible    = f > 0.02

    // ── Hinge glow visibility ──────────────────────────────────────────────
    if (hingeRef.current) {
      hingeRef.current.visible = baseOpen > 0.05
    }
  })

  useEffect(() => {
    return () => { texture?.dispose() }
  }, [texture])

  return (
    <group>
      {/*
        Hinge joint — small metallic sphere anchored just outside the cube.
        This stays in place; the arm extends from it as the wing opens.
      */}
      <mesh ref={hingeRef} position={def.hingePos} visible={false}>
        <sphereGeometry args={[0.065, 10, 8]} />
        <primitive object={HINGE_MATERIAL} attach="material" />
      </mesh>

      {/*
        Mechanical arm — thin rod from hinge toward panel.
        The group is at hingePos and rotated to align local-X with arm direction.
        arm mesh scale.x and position.x are driven in useFrame.
      */}
      <group position={def.hingePos} rotation={armMeta.euler}>
        <mesh ref={armMeshRef} visible={false}>
          <boxGeometry args={[armMeta.len, 0.025, 0.025]} />
          <primitive object={ARM_MATERIAL} attach="material" />
        </mesh>
      </group>

      {/*
        Wing panel — moves from hingePos → openPos as wing opens.
        Position and scale are set in useFrame.
      */}
      <group
        ref={panelGroupRef}
        position={def.hingePos}
        rotation={[0, def.rotY, 0]}
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
          <planeGeometry args={[1.7, 1.06]} />
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
    </group>
  )
}
