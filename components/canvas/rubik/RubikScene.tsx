'use client'

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ContactShadows } from '@react-three/drei'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { CUBE_ROT_Y, WINGS } from './config'
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
const HERO_X     = 2.3    // right-of-centre on page 1  (+1/12 screen from 1.5)
const HERO_Y     = 0      // vertical position on page 1
const SECTION2_X = -2.5   // left-of-centre on page 2   (−1/12 screen from −1.7)
const SECTION2_Y = 0.4    // cube rises slightly as it slides left → diagonal path
const HERO_SCALE = 0.63   // 1.5× original hero size
const SEC2_SCALE = 0.65   // 1.3× original page-2 size

// ─── Easing ───────────────────────────────────────────────────────────────────

function cubicInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RubikSceneProps {
  mouseRef: React.RefObject<[number, number]>
  onSolutionClick?: (id: string) => void
  onSolutionHover?: (id: string | null) => void
  /** Fires when 3D scene initialises — triggers loading overlay fade */
  onSceneReady?: () => void
  /** Fires after assembly + hero slide — triggers hero text entrance */
  onAssemblyComplete?: () => void
  isMobile: boolean
  heroSectionId: string
}

export function RubikScene({
  mouseRef,
  onSolutionClick,
  onSolutionHover,
  onSceneReady,
  onAssemblyComplete,
  isMobile,
  heroSectionId,
}: RubikSceneProps) {
  const { camera } = useThree()

  const cubeRef       = useRef<RubikCubeHandle>(null!)
  const sceneGroupRef = useRef<THREE.Group>(null!)

  // ── Wing control ──────────────────────────────────────────────────────────
  // Single shared ref: 0 = all wings folded, 1 = all wings deployed.
  // Written here (scroll + animation); read by every Wing in useFrame.
  // GSAP can tween wingsOpenRef.current directly as a plain number property.
  const wingsOpenRef    = useRef(0)
  const wingsRevealedRef = useRef(false)  // true once initial open animation ends

  const section2StartedRef = useRef(false)

  // Shared hover ref — Wing reads this in useFrame (no re-renders)
  const hoveredIdRef = useRef<string | null>(null)

  useEffect(() => {
    camera.position.set(0, 0, 6.5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // ── Main animation sequence ──────────────────────────────────────────────
  //
  // Phase 1 (loading):  crystal pieces drift at scatter positions — visible
  // Phase 2 (assembly): pieces snap to form the Rubik cube
  // Phase 3 (hero):     cube slides right, wings open outward
  //
  useEffect(() => {
    if (!cubeRef.current || !sceneGroupRef.current) return

    async function run() {
      await delay(200)

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

      // Assembly — assemble() stops drift internally, then GSAP-drives pieces
      await cubeRef.current.assemble()

      await delay(200)

      // Slide cube to hero position (right 2/3)
      await new Promise<void>((resolve) => {
        gsap.to(sceneGroupRef.current!.position, {
          x: HERO_X,
          duration: 0.9,
          ease: 'power2.inOut',
          onComplete: resolve,
        })
      })

      // Hero is ready — hero text entrance fires
      onAssemblyComplete?.()

      // Wings open outward with a smooth spring-driven animation
      await delay(200)
      openWings()

      await delay(200)
      cubeRef.current.startIdle()
    }

    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          cubeGroup.rotation.y = CUBE_ROT_Y + p * 0.18
        },
      })

      return () => { st.kill() }
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

        {/* ── Internal orange-red glow — GS logo / core heat effect ── */}
        <pointLight position={[0,  0,    0.2]} intensity={18} color="#ff5010" distance={3.0} decay={2} />
        <pointLight position={[0, -0.4,  0  ]} intensity={8}  color="#ff8030" distance={2.8} decay={2} />

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

        {/* ── Soft contact shadow ── */}
        <ContactShadows
          position={[0, -2.0, 0]}
          opacity={0.35}
          scale={6}
          blur={3.2}
          far={3.8}
          resolution={256}
          color="#1a0a00"
        />
      </group>
    </>
  )
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
