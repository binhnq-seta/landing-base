'use client'

import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ContactShadows } from '@react-three/drei'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { CUBE_ROT_X, CUBE_ROT_Y, WINGS, SHOWCASE_CORNERS, type ShowcaseCorner } from './config'
import type { CMSShowcaseCorner } from '@/lib/admin/content'
import { RubikCube } from './RubikCube'
import type { RubikCubeHandle } from './RubikCube'
import { Wing } from './Wing'
import { SceneLighting } from './SceneLighting'
import { CameraRig } from './CameraRig'

// ─── Layout constants ─────────────────────────────────────────────────────────
// Camera fov=45 at z=6.5 → viewport half-width ≈ 2.69 world units.
//
// All positions below are in sceneGroup local space.
// World position = sceneGroup.position.x + local_x × sceneGroup.scale
const HERO_X       = 2.3    // right-of-centre on page 1
const HERO_Y       = 0
const SECTION2_X   = -2.5
const SECTION2_Y   = 0.4
const HERO_SCALE   = 0.63
const SEC2_SCALE   = 0.65
const SHOWCASE_X     = 3.6    // right-aligned with ~20 px margin
const SHOWCASE_Y     = -1.5   // lower half of viewport
const SHOWCASE_SCALE = 0.33   // noticeably smaller than hero

// ─── Easing ───────────────────────────────────────────────────────────────────

function cubicInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ─── Upper-left bloom rotation ────────────────────────────────────────────────
//
// THREE.Object3D.rotation uses 'XYZ' Euler order: R = Rx(rx) · Ry(ry).
// We solve (rx, ry) with no Z-roll such that R · dir = UL_TARGET,
// where UL_TARGET is the world direction of corner 20 at the default viewing
// angle — the cube's visual upper-left position.
//
const _UL_TARGET: THREE.Vector3 = new THREE.Vector3(-1, 1, -0.5)
  .normalize()
  .applyEuler(new THREE.Euler(CUBE_ROT_X, CUBE_ROT_Y, 0))  // 'XYZ' default

function cornerToUpperLeft(dir: [number, number, number]): [number, number] {
  const [dx, dy, dz] = dir
  const { x: tx, y: ty, z: tz } = _UL_TARGET

  // With 'XYZ' R = Rx·Ry, the x-row depends only on ry:
  //   dx·cos(ry) + dz·sin(ry) = tx  → solve ry first
  const Cxz = Math.sqrt(dx * dx + dz * dz)
  if (Cxz < 1e-6) return [CUBE_ROT_X, CUBE_ROT_Y]

  const phi   = Math.atan2(dz, dx)
  const arg   = Math.max(-1, Math.min(1, tx / Cxz))
  const alpha = Math.acos(arg)

  const norm = (a: number) => {
    while (a >  Math.PI) a -= 2 * Math.PI
    while (a < -Math.PI) a += 2 * Math.PI
    return a
  }

  // Then rx from: dy·cos(rx) − bz·sin(rx) = ty  AND  dy·sin(rx) + bz·cos(rx) = tz
  const getRx = (ry: number): number => {
    const bz = -dx * Math.sin(ry) + dz * Math.cos(ry)  // z-component after Ry
    return Math.atan2(-bz * ty + dy * tz, dy * ty + bz * tz)
  }

  const ry1 = norm(phi + alpha)
  const ry2 = norm(phi - alpha)
  const rx1 = getRx(ry1)
  const rx2 = getRx(ry2)

  // Pick the solution with smaller combined rotation (more natural appearance).
  // For bottom corners (dy < 0) the correct flip is BACKWARD (rx < 0 — top tilts
  // away from camera). Any positive rx for a bottom corner is a forward over-flip
  // that makes the piece appear from below, so penalise it heavily.
  const cost = (rx: number, ry: number) => {
    const ryPart = Math.abs(ry)
    const rxPart = dy < 0
      ? (rx > 0 ? rx + 4 * Math.PI : Math.abs(rx))   // bottom: hard-prefer rx < 0
      : Math.abs(rx) + (rx > Math.PI / 2 ? 2 * Math.PI : 0)
    return rxPart + ryPart
  }
  return cost(rx1, ry1) <= cost(rx2, ry2) ? [rx1, ry1] : [rx2, ry2]
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RubikSceneProps {
  mouseRef: React.RefObject<[number, number]>
  onSolutionClick?: (id: string) => void
  onSolutionHover?: (id: string | null) => void
  /** CMS-sourced display data (label/sublabel/image) keyed by id; overrides config defaults */
  showcaseCorners?: CMSShowcaseCorner[]
  /** Fires when 3D scene initialises — triggers loading overlay fade */
  onSceneReady?: () => void
  /** Fires after assembly + hero slide — triggers hero text entrance */
  onAssemblyComplete?: () => void
  /** Fires with corner index + bloomed corner screen % coords when active, null when retracted */
  onCornerShowcase?: (idx: number | null, lineFrom?: { x: number; y: number }) => void
  isMobile: boolean
  heroSectionId: string
}

export function RubikScene({
  mouseRef,
  onSolutionClick,
  onSolutionHover,
  showcaseCorners: cmsCorners,
  onSceneReady,
  onAssemblyComplete,
  onCornerShowcase,
  isMobile,
  heroSectionId,
}: RubikSceneProps) {
  // Merge CMS display data into geometry config, matching by id.
  const showcaseCorners: ShowcaseCorner[] = cmsCorners?.length
    ? SHOWCASE_CORNERS.map((c) => {
        const cms = cmsCorners.find((x) => x.id === c.id)
        return cms ? { ...c, label: cms.label, sublabel: cms.sublabel, image: cms.image } : c
      })
    : SHOWCASE_CORNERS
  const { camera } = useThree()

  const cubeRef       = useRef<RubikCubeHandle>(null!)
  const sceneGroupRef = useRef<THREE.Group>(null!)
  const shadowGroupRef = useRef<THREE.Group>(null!)

  // ── Wing control ──────────────────────────────────────────────────────────
  // Single shared ref: 0 = all wings folded, 1 = all wings deployed.
  // Written here (scroll + animation); read by every Wing in useFrame.
  // GSAP can tween wingsOpenRef.current directly as a plain number property.
  const wingsOpenRef    = useRef(0)
  const wingsRevealedRef = useRef(false)  // true once initial open animation ends

  const section2StartedRef = useRef(false)
  const showcaseRunningRef = useRef(false)
  const currentBloomRef    = useRef<number | null>(null)  // pieceIndex currently bloomed, null if none
  const needsRestartRef    = useRef(false)                 // true after scroll interrupts showcase
  const restartTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Shared hover ref — Wing reads this in useFrame (no re-renders)
  const hoveredIdRef = useRef<string | null>(null)

  useEffect(() => {
    camera.position.set(0, 0, 6.5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Keep shadow group aligned with cube in world X/Z — Y is fixed at floor level
  useFrame(() => {
    if (shadowGroupRef.current && sceneGroupRef.current) {
      shadowGroupRef.current.position.x = sceneGroupRef.current.position.x
      shadowGroupRef.current.position.z = sceneGroupRef.current.position.z
    }
  })

  // ── Main animation sequence ──────────────────────────────────────────────
  //
  // Phase 1 (loading):  crystal pieces drift at scatter positions — visible
  // Phase 2 (assembly): pieces snap to form the Rubik cube
  // Phase 3 (hero):     cube slides right, wings open outward
  //
  useEffect(() => {
    if (!cubeRef.current || !sceneGroupRef.current) return

    // Signals all async sequences to stop on unmount
    let alive = true

    async function run() {
      await delay(200)
      if (!alive || !cubeRef.current || !sceneGroupRef.current) return

      // Set final scale before anything is revealed
      sceneGroupRef.current.scale.setScalar(HERO_SCALE)

      // Trigger loading overlay fade — scatter will now be visible
      onSceneReady?.()

      // Start drift + subtle rise
      cubeRef.current.startDrift()
      gsap.fromTo(
        cubeRef.current.groupRef.current!.position,
        { y: -0.3 },
        { y: 0, duration: 2.0, ease: 'power2.out' },
      )

      await delay(1200)
      if (!alive || !cubeRef.current) return

      // Assembly — assemble() stops drift internally, then GSAP-drives pieces
      await cubeRef.current.assemble()
      if (!alive || !cubeRef.current) return

      await delay(250)
      if (!alive || !cubeRef.current) return

      // ── Cinematic roll → hero position ──────────────────────────────────────
      // Three motions layered on one timeline:
      //   1. Full 360° Y spin with power3.inOut — builds momentum, decelerates into rest
      //   2. Subtle X-axis wobble — gives physicality (rolling vs. spinning-in-place)
      //   3. Rise + spring-land on Y — cube "hops" as it rolls
      //   4. Diagonal slide to HERO_X — overlaps mid-spin for cinematic flow
      const cubeGroup = cubeRef.current.groupRef.current!

      await new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve })

        // Full Y spin — one complete revolution
        tl.to(cubeGroup.rotation, {
          y: CUBE_ROT_Y + Math.PI * 2,
          duration: 1.9,
          ease: 'power3.inOut',
        }, 0)

        // X wobble — forward tilt at spin peak, return to rest
        tl.to(cubeGroup.rotation, {
          x: CUBE_ROT_X + 0.24,
          duration: 0.95,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: 1,
        }, 0.12)

        // Rise at spin start
        tl.to(sceneGroupRef.current!.position, {
          y: 0.32,
          duration: 0.78,
          ease: 'power2.out',
        }, 0)

        // Land with spring bounce
        tl.to(sceneGroupRef.current!.position, {
          y: HERO_Y,
          duration: 1.12,
          ease: 'back.out(2)',
        }, 0.78)

        // Slide to hero X — starts mid-spin, ends just after spin settles
        tl.to(sceneGroupRef.current!.position, {
          x: HERO_X,
          duration: 1.25,
          ease: 'power2.inOut',
        }, 0.50)
      })
      if (!alive || !cubeRef.current) return

      // Hero is ready — hero text entrance fires
      onAssemblyComplete?.()

      // Wings open outward with a smooth spring-driven animation
      await delay(200)
      if (!alive || !cubeRef.current) return
      openWings()

      await delay(200)
      if (!alive || !cubeRef.current) return
      cubeRef.current.startIdle()

      await delay(2500)
      if (!alive) return
      runShowcase()
    }

    run()

    return () => {
      alive = false
      showcaseRunningRef.current = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Corner showcase ───────────────────────────────────────────────────────
  async function runShowcase() {
    if (showcaseRunningRef.current) return
    showcaseRunningRef.current = true

    outer: while (showcaseRunningRef.current) {
      // Stop idle at the start of every cycle — startIdle() is called at the end
      // of each iteration, so on loop 2+ idleRef would still be true here.
      // The idle spring (rotation.x → CUBE_ROT_X) fights bottom-corner tweens
      // (which need rotX ≈ −2.15), so it must be off before any rotation tween.
      if (!cubeRef.current) break
      cubeRef.current.stopIdle()

      // ① Move cube to bottom-right showcase position
      await new Promise<void>((resolve) => {
        gsap.timeline({ onComplete: resolve })
          .to(sceneGroupRef.current.position, { x: SHOWCASE_X, y: SHOWCASE_Y, duration: 1.2, ease: 'power2.inOut' }, 0)
          .to(sceneGroupRef.current.scale,    { x: SHOWCASE_SCALE, y: SHOWCASE_SCALE, z: SHOWCASE_SCALE, duration: 1.2, ease: 'power2.inOut' }, 0)
      })
      if (!showcaseRunningRef.current) break

      // ② Cycle through all 8 corners
      for (let i = 0; i < showcaseCorners.length; i++) {
        if (!showcaseRunningRef.current) break outer

        const corner    = showcaseCorners[i]
        const cubeGroup = cubeRef.current?.groupRef?.current
        if (!cubeGroup) break outer

        // Rotate cube so this corner appears at the upper-left visual position.
        // Normalize targetRy to the shortest angular path from current rotation.y
        // so GSAP never spins 270° when 90° is shorter (which happens when
        // consecutive canonical ry values cross the ±π boundary).
        const [rotX, rotY] = cornerToUpperLeft(corner.dir)
        const fromRy = cubeGroup.rotation.y
        const ryDelta = ((rotY - fromRy) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI
        await new Promise<void>((resolve) =>
          gsap.to(cubeGroup.rotation, { x: rotX, y: fromRy + ryDelta, z: 0, duration: 1.0, ease: 'power2.inOut', onComplete: resolve })
        )
        if (!showcaseRunningRef.current) break outer

        // Bloom the corner piece
        if (!cubeRef.current) break outer
        cubeRef.current.bloomCorner(corner.pieceIndex)
        currentBloomRef.current = corner.pieceIndex

        // Project the bloomed corner world position to screen %
        await delay(720)  // wait for bloom GSAP (0.7 s) to settle
        if (!showcaseRunningRef.current) break outer
        if (!cubeRef.current) break outer

        const wp  = cubeRef.current.getCornerWorldPosition(corner.pieceIndex)
        const ndc = wp.project(camera)
        const lineFrom = {
          x: ((ndc.x + 1) / 2) * 100,
          y: ((1 - ndc.y) / 2) * 100,
        }
        onCornerShowcase?.(i, lineFrom)

        await delay(5500)
        if (!showcaseRunningRef.current) break outer
        if (!cubeRef.current) break outer

        currentBloomRef.current = null
        cubeRef.current.retractCorner(corner.pieceIndex)
        onCornerShowcase?.(null)
        await delay(700)
      }

      if (!showcaseRunningRef.current) break

      // ③ Return cube to hero position
      const cubeGroup = cubeRef.current?.groupRef?.current
      await new Promise<void>((resolve) => {
        gsap.timeline({ onComplete: resolve })
          .to(sceneGroupRef.current.position, { x: HERO_X, y: HERO_Y, duration: 1.5, ease: 'power2.inOut' }, 0)
          .to(sceneGroupRef.current.scale,    { x: HERO_SCALE, y: HERO_SCALE, z: HERO_SCALE, duration: 1.5, ease: 'power2.inOut' }, 0)
          .to(cubeGroup!.rotation,            { x: CUBE_ROT_X, y: CUBE_ROT_Y, duration: 1.5, ease: 'power2.inOut' }, 0)
      })
      if (!showcaseRunningRef.current) break
      if (!cubeRef.current) break

      cubeRef.current.startIdle()

      // ④ Pause before repeating
      await delay(8000)
    }
  }

  // ── Open wings ────────────────────────────────────────────────────────────
  function openWings() {
    // GSAP tweens wingsOpenRef.current from 0 → 1.
    // Each Wing reads this in useFrame and spring-interpolates independently,
    // creating a natural staggered-feel without explicit stagger code.
    gsap.to(wingsOpenRef, {
      current: 1,
      duration: 1.2,
      ease: 'power2.out',
      onComplete: () => { wingsRevealedRef.current = true },
    })
  }

  // ── Scroll transition ──────────────────────────────────────────────────────
  //
  // p = scroll progress [0, 1]:
  //
  //   0.00–0.22 : wings fold inward (wingsOpenRef 1→0)
  //   0.22–0.38 : pause — cube alone, wings retracted at hinge
  //   0.38–0.65 : cube slides HERO_X → SECTION2_X
  //   0.43–0.68 : cube scales HERO_SCALE → SEC2_SCALE
  //   0.65+     : section 2 layer rotation
  //
  useEffect(() => {
    const section = document.getElementById(heroSectionId)
    if (!section) return

    const waitAndBind = () => {
      const sceneGroup = sceneGroupRef.current
      const cubeGroup  = cubeRef.current?.groupRef?.current
      if (!sceneGroup || !cubeGroup) return

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
        onUpdate: (self) => {
          const p = self.progress

          // Stop showcase when user scrolls off the hero
          if (p > 0.08 && showcaseRunningRef.current) {
            showcaseRunningRef.current = false
            needsRestartRef.current    = true
            onCornerShowcase?.(null)

            // Retract any currently bloomed corner immediately
            if (currentBloomRef.current !== null) {
              cubeRef.current?.retractCorner(currentBloomRef.current)
              currentBloomRef.current = null
            }

            // Kill all showcase-owned tweens
            const cg = cubeRef.current?.groupRef?.current
            gsap.killTweensOf(sceneGroup.position)
            gsap.killTweensOf(sceneGroup.scale)
            if (cg) gsap.killTweensOf(cg.rotation)

            // Reset scale + rotation immediately so scroll handler takes over cleanly
            sceneGroup.scale.setScalar(HERO_SCALE)
            if (cg) cg.rotation.set(CUBE_ROT_X, CUBE_ROT_Y, 0)

            cubeRef.current?.startIdle()
            // Position is NOT snapped here — scroll handler writes it directly
            // on the very next frame (slideT=0 at p≈0.08 → x=HERO_X, y=HERO_Y)
          }

          // Schedule showcase restart when user scrolls back to hero
          if (p < 0.04 && needsRestartRef.current && !restartTimerRef.current) {
            restartTimerRef.current = setTimeout(() => {
              restartTimerRef.current = null
              if (needsRestartRef.current && !showcaseRunningRef.current) {
                needsRestartRef.current = false
                runShowcase()
              }
            }, 2500)
          }
          // Cancel the pending restart if user scrolls away again before it fires
          if (p >= 0.04 && restartTimerRef.current) {
            clearTimeout(restartTimerRef.current)
            restartTimerRef.current = null
          }

          // While showcase is running, it owns position / scale / cube rotation
          if (showcaseRunningRef.current) return

          // ── Mode transitions (must run before setLayerScroll) ─────────────
          // Section-2 starts as soon as layers are reunited (p=0.40) + a small
          // buffer. This ensures counter-rotation is visible the moment the
          // user reaches page 2 even without scrolling further.
          if (p >= 0.44 && !section2StartedRef.current) {
            section2StartedRef.current = true
            cubeRef.current?.startSection2()
          }
          // Restore idle when scrolling back (hysteresis gap: 0.44 – 0.41).
          if (p < 0.41 && section2StartedRef.current) {
            section2StartedRef.current = false
            cubeRef.current?.startIdle()
          }

          // ── Wing fold (p: 0.00 → 0.12) ───────────────────────────────────
          if (wingsRevealedRef.current) {
            wingsOpenRef.current = p < 0.12
              ? 1 - cubicInOut(p / 0.12)
              : 0
          }

          // ── Layer separation (p: 0.02 → 0.40) ─────────────────────────────
          // While section2 is active the scroll handler stays silent so the
          // section-2 counter-rotation in useFrame can own the layers.
          // Outside section2: pass a linear 0→1 raw parameter; RubikCube turns
          // it into a bell-curve position spread + monotonic 360° Y rotation.
          if (!section2StartedRef.current) {
            let layerRaw = 0
            if (p >= 0.02 && p <= 0.40) {
              layerRaw = (p - 0.02) / (0.40 - 0.02)
            }
            cubeRef.current?.setLayerScroll(layerRaw)
          }

          // ── Diagonal slide (p: 0.28 → 0.55) ─────────────────────────────
          // Both X and Y use the same eased parameter so the path is a
          // straight diagonal line in world space — right-low → left-high.
          const slideT = p < 0.28 ? 0 : p > 0.55 ? 1 : cubicInOut((p - 0.28) / 0.27)
          sceneGroup.position.x = HERO_X     + (SECTION2_X - HERO_X)     * slideT
          sceneGroup.position.y = HERO_Y     + (SECTION2_Y - HERO_Y)     * slideT

          // ── Scale (p: 0.32 → 0.60) ───────────────────────────────────────
          let targetScale: number
          if (p < 0.32) {
            targetScale = HERO_SCALE
          } else if (p < 0.60) {
            targetScale = HERO_SCALE + (SEC2_SCALE - HERO_SCALE) * cubicInOut((p - 0.32) / 0.28)
          } else {
            targetScale = SEC2_SCALE
          }
          sceneGroup.scale.setScalar(targetScale)

          // ── Cube rotation ─────────────────────────────────────────────────
          cubeGroup.rotation.x = CUBE_ROT_X
          cubeGroup.rotation.y = CUBE_ROT_Y + p * 0.18
        },
      })

      return () => {
        st.kill()
        if (restartTimerRef.current) {
          clearTimeout(restartTimerRef.current)
          restartTimerRef.current = null
        }
      }
    }

    const id = setTimeout(waitAndBind, 0)
    return () => clearTimeout(id)
  }, [heroSectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleWingHover(id: string | null) {
    hoveredIdRef.current = id
    onSolutionHover?.(id)
  }

  return (
    <>
      <SceneLighting />
      <CameraRig mouseRef={mouseRef} />

      {/*
        sceneGroup: single transform node for the entire composition.
        The Rubik and wings are siblings here — neither is a child of the other.
        scale controls perceived size; position.x drives the hero ↔ section-2 slide.
      */}
      <group ref={sceneGroupRef}>
        {/* ── The Rubik ── */}
        <RubikCube ref={cubeRef} isMobile={isMobile} />

        {/* ── Internal white glow — GS logo / illuminated core effect ── */}
        <pointLight position={[0,  0,    0.2]} intensity={18} color="#ffffff" distance={3.0} decay={2} />
        <pointLight position={[0, -0.4,  0  ]} intensity={8}  color="#fff7e6" distance={2.8} decay={2} />

        {/* ── Six wings — hidden ── */}
        {/* {WINGS.map((wing) => (
          <Wing
            key={wing.id}
            def={wing}
            hoveredIdRef={hoveredIdRef}
            wingsOpenRef={wingsOpenRef}
            onHover={handleWingHover}
            onClick={onSolutionClick}
          />
        ))} */}

      </group>

      {/* ── Shadows: outside sceneGroup so scale doesn't distort distances ── */}
      {/* shadowGroupRef.position.x tracks sceneGroup in useFrame              */}
      <group ref={shadowGroupRef}>
        {/* Sharp close shadow — frames=Infinity re-renders every frame */}
        <ContactShadows
          frames={Infinity}
          position={[0, -1.3, 0]}
          opacity={0.70}
          scale={5}
          blur={1.2}
          far={3.5}
          resolution={512}
          color="#04091a"
        />
        {/* Soft wide penumbra */}
        <ContactShadows
          frames={Infinity}
          position={[0, -1.3, 0]}
          opacity={0.28}
          scale={10}
          blur={5}
          far={5}
          resolution={256}
          color="#04091a"
        />
      </group>
    </>
  )
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
