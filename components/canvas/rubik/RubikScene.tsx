'use client'

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
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
const HERO_X     = 1.5
const SECTION2_X = -1.6
const HERO_SCALE = 0.42
const SEC2_SCALE = 0.30

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

          // ── X position ────────────────────────────────────────────────────
          let targetX: number
          if (p < 0.38) {
            targetX = HERO_X
          } else if (p < 0.65) {
            targetX = HERO_X + (SECTION2_X - HERO_X) * cubicInOut((p - 0.38) / 0.27)
          } else {
            targetX = SECTION2_X
          }
          sceneGroup.position.x = targetX

          // ── Scale ─────────────────────────────────────────────────────────
          let targetScale: number
          if (p < 0.43) {
            targetScale = HERO_SCALE
          } else if (p < 0.68) {
            targetScale = HERO_SCALE + (SEC2_SCALE - HERO_SCALE) * cubicInOut((p - 0.43) / 0.25)
          } else {
            targetScale = SEC2_SCALE
          }
          sceneGroup.scale.setScalar(targetScale)

          // ── Cube rotation ─────────────────────────────────────────────────
          cubeGroup.rotation.y = CUBE_ROT_Y + p * 0.18

          // ── Wing fold ─────────────────────────────────────────────────────
          // Only drive wings after they have been fully revealed once.
          // wingsOpenRef.current is read by Wing.useFrame on every frame.
          if (wingsRevealedRef.current) {
            if (p < 0.22) {
              wingsOpenRef.current = 1 - cubicInOut(p / 0.22)
            } else {
              wingsOpenRef.current = 0
            }
          }

          // ── Section-2 start ───────────────────────────────────────────────
          if (p >= 0.65 && !section2StartedRef.current) {
            section2StartedRef.current = true
            cubeRef.current?.startSection2()
          }

          // ── Restore idle when scrolling back ──────────────────────────────
          if (p < 0.50 && section2StartedRef.current) {
            section2StartedRef.current = false
            cubeRef.current?.startIdle()
            if (wingsRevealedRef.current) {
              // Restore wings when user scrolls back above fold threshold
              wingsOpenRef.current = Math.max(0, 1 - cubicInOut(p / 0.22))
            }
          }
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
        {/* ── The Rubik — the product, never modified by wings ── */}
        <RubikCube ref={cubeRef} isMobile={isMobile} />

        {/* ── Six wings — independent UI modules that orbit the cube ── */}
        {WINGS.map((wing) => (
          <Wing
            key={wing.id}
            def={wing}
            hoveredIdRef={hoveredIdRef}
            wingsOpenRef={wingsOpenRef}
            onHover={handleWingHover}
            onClick={onSolutionClick}
          />
        ))}
      </group>
    </>
  )
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
