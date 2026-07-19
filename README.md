# Next.js Landing Page Base

**Stack:** Next.js 15 · Strapi 5 · Three.js · GSAP + ScrollTrigger · Lenis · Tailwind CSS

## Quick Start

```bash
cp .env.example .env.local   # fill in Strapi URL + token
npm run dev
```

## Structure

```
app/
  api/revalidate/    ← Strapi webhook → ISR cache revalidation
  layout.tsx         ← SmoothScrollProvider wraps everything
  page.tsx           ← Uncomment getSingle() when Strapi is live

components/
  canvas/ParticleCanvas    ← Three.js demo (particle field)
  sections/HeroSection     ← GSAP entrance timeline
  sections/FeaturesSection ← ScrollTrigger stagger reveal
  ui/StrapiImage           ← Next/Image wrapper for Strapi media

context/SmoothScrollProvider  ← Lenis + ScrollTrigger bridge

hooks/
  useScrollReveal   ← GSAP fromTo + ScrollTrigger in one line
  useThreeScene     ← Three.js canvas lifecycle (init/frame/dispose)

lib/
  gsap/index.ts        ← Plugin registration + animation presets
  strapi/client.ts     ← Typed fetch wrapper (getSingle, getCollection)
  three/scene.ts       ← Scene factory + geometry helpers

types/strapi.ts     ← All Strapi content types
```

## GSAP ScrollTrigger

```tsx
const ref = useScrollReveal({
  from: { opacity: 0, y: 60 },
  to:   { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
  // Stagger children:
  childSelector: '[data-card]',
})
return <section ref={ref}>…</section>
```

## Three.js

```tsx
const canvasRef = useThreeScene({
  onInit: ({ scene }) => {
    scene.add(new THREE.Mesh(new THREE.TorusKnotGeometry(), mat))
  },
  onFrame: ({ renderer, scene, camera, elapsed }) => {
    scene.rotation.y = elapsed * 0.5
    renderer.render(scene, camera)
  },
})
return <canvas ref={canvasRef} className="w-full h-full" />
```

## Strapi Connection

1. Build content types matching `types/strapi.ts`
2. Generate API token → paste to `.env.local`
3. Uncomment `getSingle` in `page.tsx`
4. Add revalidation webhook in Strapi → Settings → Webhooks:
   `POST /api/revalidate?tag=landing-page&secret=YOUR_SECRET`
