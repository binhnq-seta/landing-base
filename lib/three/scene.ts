import * as THREE from 'three'

export interface SceneConfig {
  canvas: HTMLCanvasElement
  antialias?: boolean
  alpha?: boolean
  pixelRatio?: number
}

export interface ThreeScene {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  clock: THREE.Clock
  dispose: () => void
  resize: () => void
}

/**
 * Creates a minimal Three.js scene bound to a canvas.
 * Returns disposers so React can clean up in useEffect.
 */
export function createScene({
  canvas,
  antialias = true,
  alpha = true,
  pixelRatio,
}: SceneConfig): ThreeScene {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    60,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ canvas, antialias, alpha })
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  renderer.setPixelRatio(pixelRatio ?? Math.min(window.devicePixelRatio, 2))

  const clock = new THREE.Clock()

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  function dispose() {
    renderer.dispose()
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose())
        } else {
          obj.material.dispose()
        }
      }
    })
  }

  return { scene, camera, renderer, clock, dispose, resize }
}

// ─── Common geometry helpers ──────────────────────────────────────────────────

export function createParticleField(
  count = 800,
  spread = 10,
  size = 0.03,
  color = 0xffffff
): THREE.Points {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * spread
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const textureCanvas = document.createElement('canvas')
  textureCanvas.width = 64
  textureCanvas.height = 64

  const context = textureCanvas.getContext('2d')
  if (!context) {
    throw new Error('Unable to create particle texture context')
  }

  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.95)')
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.35)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')

  context.clearRect(0, 0, 64, 64)
  context.fillStyle = gradient
  context.beginPath()
  context.arc(32, 32, 32, 0, Math.PI * 2)
  context.fill()

  const sprite = new THREE.CanvasTexture(textureCanvas)
  sprite.colorSpace = THREE.SRGBColorSpace

  const material = new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
    map: sprite,
    alphaMap: sprite,
    alphaTest: 0.02,
    depthWrite: false,
  })

  return new THREE.Points(geometry, material)
}

export function createAmbientLight(intensity = 0.5) {
  return new THREE.AmbientLight(0xffffff, intensity)
}

export function createDirectionalLight(
  intensity = 1,
  position: [number, number, number] = [5, 5, 5]
) {
  const light = new THREE.DirectionalLight(0xffffff, intensity)
  light.position.set(...position)
  return light
}
