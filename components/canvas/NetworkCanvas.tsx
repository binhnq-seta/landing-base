'use client'

import { useEffect, useRef } from 'react'

// ─── Config ──────────────────────────────────────────────────────────────────
const POINT_COUNT   = 90
const MOUSE_RADIUS  = 210   // px — activation radius around cursor
const CONNECT_DIST  = 140   // px — max distance between two points for a line
const DOT_R         = 2.8   // px — dot core radius
const GLOW_R        = 10    // px — soft glow radius around each dot
const DRIFT_SPEED   = 0.22  // px/frame — how fast points drift

// Dot and line color (dark blue — readable on bright sky background)
const DR = 15, DG = 60, DB = 160   // dot RGB
const LR = 30, LG = 90, LB = 200   // line RGB

interface Pt { x: number; y: number; vx: number; vy: number }

// ─── Component ───────────────────────────────────────────────────────────────

export function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let w = 0, h = 0
    let pts: Pt[] = []
    let mx = -99999, my = -99999
    let raf: number

    // ── Resize / init ──────────────────────────────────────────────────────
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr  = window.devicePixelRatio || 1
      w = rect.width;  canvas.width  = w * dpr
      h = rect.height; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
      pts = Array.from({ length: POINT_COUNT }, () => ({
        x:  Math.random() * w,
        y:  Math.random() * h,
        vx: (Math.random() - 0.5) * DRIFT_SPEED * 2,
        vy: (Math.random() - 0.5) * DRIFT_SPEED * 2,
      }))
    }

    // ── Mouse tracking (window-level, unaffected by pointer-events) ────────
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mx = e.clientX - rect.left
      my = e.clientY - rect.top
    }
    const onLeave = () => { mx = -99999; my = -99999 }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    const ro = new ResizeObserver(() => { resize() })
    ro.observe(canvas)
    resize()

    // ── Draw loop ──────────────────────────────────────────────────────────
    const frame = () => {
      ctx.clearRect(0, 0, w, h)

      // Drift
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0)  { p.x = 0; p.vx =  Math.abs(p.vx) }
        if (p.x > w)  { p.x = w; p.vx = -Math.abs(p.vx) }
        if (p.y < 0)  { p.y = 0; p.vy =  Math.abs(p.vy) }
        if (p.y > h)  { p.y = h; p.vy = -Math.abs(p.vy) }
      }

      // Brightness per point: smooth falloff from mouse
      const br = pts.map(p => {
        const d = Math.hypot(p.x - mx, p.y - my)
        return d < MOUSE_RADIUS ? 1 - d / MOUSE_RADIUS : 0
      })

      // Lines first (drawn under dots)
      ctx.lineWidth = 1
      for (let i = 0; i < pts.length; i++) {
        if (br[i] === 0) continue
        for (let j = i + 1; j < pts.length; j++) {
          if (br[j] === 0) continue
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
          if (d > CONNECT_DIST) continue
          // opacity = geometric mean of brightness × distance falloff
          const a = Math.sqrt(br[i] * br[j]) * (1 - d / CONNECT_DIST) * 0.7
          ctx.strokeStyle = `rgba(${LR},${LG},${LB},${a})`
          ctx.beginPath()
          ctx.moveTo(pts[i].x, pts[i].y)
          ctx.lineTo(pts[j].x, pts[j].y)
          ctx.stroke()
        }
      }

      // Dots + glow
      for (let i = 0; i < pts.length; i++) {
        const b = br[i]
        if (b === 0) continue

        // Soft glow halo
        const g = ctx.createRadialGradient(pts[i].x, pts[i].y, 0, pts[i].x, pts[i].y, GLOW_R)
        g.addColorStop(0, `rgba(${DR},${DG},${DB},${b * 0.28})`)
        g.addColorStop(1, `rgba(${DR},${DG},${DB},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(pts[i].x, pts[i].y, GLOW_R, 0, Math.PI * 2)
        ctx.fill()

        // Core dot
        ctx.fillStyle = `rgba(${DR},${DG},${DB},${b})`
        ctx.beginPath()
        ctx.arc(pts[i].x, pts[i].y, DOT_R, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(frame)
    }

    frame()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: 'none' }}
    />
  )
}
