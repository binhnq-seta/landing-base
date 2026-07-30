'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Environment } from '@react-three/drei'
import * as THREE from 'three'

// ─── Rectangular-cross-section torus ─────────────────────────────────────────
//
// ExtrudeGeometry extrudes a 2-D shape along a CatmullRom circle.
// Frenet frame for XY-plane circle:
//   Normal  N = (-cos θ, -sin θ, 0) → radially inward (shape X axis)
//   Binormal B = (0, 0, 1)          → Z axis            (shape Y axis)
// So shape.x = radial direction, shape.y = Z "band-width" direction.
//
function buildRectTorusGeo(
  radius: number,
  radialThick: number,   // half-extent in radial dir  (thin edge, shape x)
  bandWidth: number,     // half-extent in Z / band dir (wide face, shape y)
  steps: number,
): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  const hw = radialThick, hh = bandWidth
  shape.moveTo(-hw, -hh)
  shape.lineTo( hw, -hh)
  shape.lineTo( hw,  hh)
  shape.lineTo(-hw,  hh)
  shape.closePath()

  const pts = Array.from({ length: steps }, (_, i) => {
    const a = (i / steps) * Math.PI * 2
    return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0)
  })
  const path = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0)

  const geo = new THREE.ExtrudeGeometry(shape, {
    steps,
    bevelEnabled: false,
    extrudePath: path,
  })
  geo.computeVertexNormals()
  return geo
}

// ─── Ring definitions ─────────────────────────────────────────────────────────

interface RingDef {
  rot0:  [number, number, number]
  spinY: number   // rad/s Y-axis rotation
  spinX: number   // rad/s X-axis precession
  f1:    number   // primary scale frequency
  f2:    number   // secondary scale frequency
  amp:   number   // scale amplitude
  phase: number   // phase offset
}

const RING_DEFS: RingDef[] = [
  { rot0: [ 0.45,  0.00,  0.30], spinY:  0.52, spinX:  0.08, f1: 0.55, f2: 1.10, amp: 0.14, phase: 0.0 },
  { rot0: [ 1.10,  0.85,  0.95], spinY: -0.40, spinX:  0.06, f1: 0.40, f2: 0.85, amp: 0.17, phase: 2.1 },
  { rot0: [-0.50,  1.45, -0.60], spinY:  0.34, spinX: -0.07, f1: 0.72, f2: 1.32, amp: 0.12, phase: 4.2 },
]

function AtomRing({ def }: { def: RingDef }) {
  const groupRef = useRef<THREE.Group>(null!)
  const meshRef  = useRef<THREE.Mesh>(null!)

  // Build geometry once — 3× original thickness (0.038 → ~0.114 equiv)
  // radialThick=0.048 (thin edge), bandWidth=0.02 (wide face)
  const geo = useMemo(
    () => buildRectTorusGeo(2.3, 0.06, 0.04, 180),
    [],
  )

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y += def.spinY * delta
    groupRef.current.rotation.x += def.spinX * delta
    const s = 1.0
      + Math.sin(t * def.f1 + def.phase) * def.amp
      + Math.sin(t * def.f2 + def.phase * 1.7) * def.amp * 0.45
    meshRef.current.scale.setScalar(Math.max(0.72, s))
  })

  return (
    <group ref={groupRef} rotation={def.rot0}>
      <mesh ref={meshRef} geometry={geo}>
        <MeshTransmissionMaterial
          color="#dee7e7"
          transmission={0.65}
          roughness={0.03}
          metalness={0.05}
          thickness={0.30}
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          chromaticAberration={0.10}
          distortion={0.20}
          temporalDistortion={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ─── Pentagon nuclei ──────────────────────────────────────────────────────────
//
// 5 red spheres at the 5 vertices of a regular pentagon, arranged in the XY
// plane. The whole formation rotates as a rigid body around the Z axis only
// (flat planar rotation, as requested).
//
const PENTAGON_RADIUS = 0.78
const PENTAGON_BASE = Array.from({ length: 5 }, (_, i) => {
  const a = (i / 5) * Math.PI * 2 - Math.PI / 2  // start from top vertex
  return new THREE.Vector3(
    Math.cos(a) * PENTAGON_RADIUS,
    Math.sin(a) * PENTAGON_RADIUS,
    0,
  )
})

function Nuclei() {
  const groupRef = useRef<THREE.Group>(null!)

  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color:              new THREE.Color('#cc1a1a'),
    metalness:          0.65,
    roughness:          0.20,
    emissive:           new THREE.Color('#5a0000'),
    emissiveIntensity:  0.45,
    clearcoat:          1.0,
    clearcoatRoughness: 0.06,
  }), [])

  // Angular velocity = compound sine → naturally varies speed & reverses direction
  // ω(t) = 0.55·(sin(0.35t) + 0.55·sin(0.82t + 2.1) + 0.32·sin(1.6t + 0.7))
  // Peak ≈ ±1.03 rad/s (fast), crosses zero → direction reversal, slow near zero.
  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const omega = 0.55 * (
      Math.sin(t * 0.35)
      + 0.55 * Math.sin(t * 0.82 + 2.1)
      + 0.32 * Math.sin(t * 1.60 + 0.7)
    )
    groupRef.current.rotation.z += omega * delta
  })

  return (
    <group ref={groupRef}>
      {PENTAGON_BASE.map((pos, i) => (
        <mesh key={i} position={pos} material={mat}>
          <sphereGeometry args={[0.20, 32, 32]} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────

function AtomicScene() {
  return (
    <>
      <ambientLight intensity={0.55} color="#8090b0" />
      <directionalLight position={[5, 7, 4]}   intensity={2.2} color="#ffffff" />
      <directionalLight position={[-4, -2, -5]} intensity={1.0} color="#4060cc" />
      {/* Red glow from nucleus cluster */}
      <pointLight position={[0, 0, 0]} intensity={9} color="#ff2010" distance={3.5} decay={2} />
      <pointLight position={[0, 2, 3]} intensity={1.8} color="#dadff0" distance={8}   decay={2} />

      {/* Shift the whole atom toward the right side of the extended canvas */}
      <group position={[1.1, 0, 0]}>
        {RING_DEFS.map((def, i) => <AtomRing key={i} def={def} />)}
        <Nuclei />
      </group>

      <Environment preset="studio" />
    </>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────

export function AtomicCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.0], fov: 48 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <AtomicScene />
    </Canvas>
  )
}
