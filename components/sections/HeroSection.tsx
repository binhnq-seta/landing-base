'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useSmoothScroll } from '@/context/SmoothScrollProvider'
import { gsap } from '@/lib/gsap'
import { HERO_INTRO_COMPLETE_EVENT } from '@/lib/intro'
import { SHOWCASE_CORNERS } from '@/components/canvas/rubik/config'
import type { CMSShowcaseCorner } from '@/lib/admin/content'
import type { HeroSection as HeroData } from '@/types/strapi'

// Three.js canvas — client-only, no SSR
const RubikCanvas = dynamic(
  () => import('@/components/canvas/RubikCanvas').then((m) => m.RubikCanvas),
  { ssr: false },
)

// Maps solution slug → index in SolutionSection cards
const SOLUTION_ID_TO_INDEX: Record<string, number> = {
  'an-ninh-quoc-phong': 0,
  'bao-mat-attt': 1,
  'dien-luc-nang-luong': 2,
  'vien-thong': 3,
  'hang-khong': 4,
}

interface HeroSectionProps {
  data?: HeroData
  siteName?: string
  showcaseCorners?: CMSShowcaseCorner[]
}

export function HeroSection({ data, showcaseCorners: cmsCorners }: HeroSectionProps) {
  const t = useTranslations('hero')

  // Merge CMS display data into geometry config, matching by id
  const corners = useMemo(() => {
    if (!cmsCorners?.length) return SHOWCASE_CORNERS
    return SHOWCASE_CORNERS.map((c) => {
      const cms = cmsCorners.find((x) => x.id === c.id)
      return cms ? { ...c, label: cms.label, sublabel: cms.sublabel, image: cms.image } : c
    })
  }, [cmsCorners])
  const { lenisRef } = useSmoothScroll()
  const containerRef = useRef<HTMLElement>(null)

  // Phase 1: Three.js scene initialised → fade loading overlay to reveal particles
  const [overlayFading, setOverlayFading] = useState(false)
  // Phase 2: Rubik cube assembled + in hero position → animate text, unlock scroll
  const [introComplete, setIntroComplete] = useState(false)
  // Visibility toggle — drives opacity transition
  const [showcaseCorner, setShowcaseCorner] = useState<number | null>(null)
  // Which corner's content to render (lags behind so fade-out sees old content)
  const [displayCorner, setDisplayCorner] = useState<number | null>(null)
  // Screen-space start point for the connecting line (% coordinates)
  const [lineFrom, setLineFrom] = useState<{ x: number; y: number } | null>(null)

  const statsRef = useScrollReveal<HTMLDivElement>({
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 },
    start: 'top 85%',
    childSelector: '[data-stat]',
  })

  // Lock scroll + touch during loading; unlock when introComplete
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const lenis = lenisRef.current
    window.scrollTo(0, 0)
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'
    lenis?.stop()

    if (!introComplete) {
      return () => {
        html.style.overflow = ''
        body.style.overflow = ''
        body.style.touchAction = ''
        lenis?.start()
      }
    }

    html.style.overflow = ''
    body.style.overflow = ''
    body.style.touchAction = ''
    lenis?.start()
    return undefined
  }, [introComplete, lenisRef])

  // Animate hero elements in + emit event for SectionScrollRail
  useEffect(() => {
    if (!introComplete) return
    window.dispatchEvent(new Event(HERO_INTRO_COMPLETE_EVENT))

    const container = containerRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      gsap.timeline({ delay: 0.2, defaults: { ease: 'power3.out' } })
        .to('[data-hero-header]', { opacity: 1, y: 0, duration: 0.6 })
        .from('[data-hero-heading]', { opacity: 0, y: 50, duration: 0.9 }, '-=0.3')
        .from('[data-hero-sub]', { opacity: 0, y: 30, duration: 0.7 }, '-=0.5')
        .from('[data-hero-cta]', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
    }, container)

    return () => ctx.revert()
  }, [introComplete])

  // Three.js scene is ready → start fading the loading overlay
  const handleSceneReady = useCallback(() => {
    requestAnimationFrame(() => setOverlayFading(true))
  }, [])

  // Rubik cube fully assembled in hero position → complete intro
  const handleAssemblyComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  const handleCornerShowcase = useCallback((idx: number | null, lf?: { x: number; y: number }) => {
    if (idx !== null) {
      setDisplayCorner(idx)
      setLineFrom(lf ?? null)
    } else {
      setLineFrom(null)
    }
    setShowcaseCorner(idx)
  }, [])

  // Cube face clicked → programmatically activate the matching solution card
  const handleSolutionClick = useCallback((id: string) => {
    const index = SOLUTION_ID_TO_INDEX[id]
    if (index !== undefined) {
      document.querySelector<HTMLElement>(`[data-solution-index="${index}"]`)?.click()
    }
    const target = document.getElementById('solutions')
    if (!target) return
    const top = window.scrollY + target.getBoundingClientRect().top
    if (lenisRef.current) {
      lenisRef.current.scrollTo(top, { duration: 1.5, force: true, lock: true })
    } else {
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }, [lenisRef])

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative min-h-[200vh]"
    >

      {/* Background is limited to the first viewport (hero only). */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-screen bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/Background.png')", backgroundSize: '100% 100%' }}
        aria-hidden="true"
      />

      {/* ── Loading overlay ── */}
      <div
        aria-hidden={introComplete}
        className={`fixed inset-0 z-[999] flex flex-col items-center justify-center gap-8 bg-[#102652] transition-opacity duration-500 ease-in-out ${overlayFading ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
        <div className="relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/image/LogoWhite.png" alt="General Systems" className="h-auto w-[300px] max-w-[80vw]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300/70">
            {t('initializing')}
          </p>
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#D62828] [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-white [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#9FB3D8]" />
          </div>
        </div>
      </div>

      {/* ── Header — starts hidden, GSAP reveals on introComplete ── */}
      <div data-hero-header className="relative z-50 -translate-y-4 opacity-0">
        <SiteHeader overlay dark />
      </div>

      {/* ── Three.js Rubik canvas — sticky so it tracks both viewports ── */}
      <div className="pointer-events-auto absolute inset-0 z-10">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <RubikCanvas
            heroSectionId="home"
            showcaseCorners={cmsCorners}
            onSolutionClick={handleSolutionClick}
            onSceneReady={handleSceneReady}
            onAssemblyComplete={handleAssemblyComplete}
            onCornerShowcase={handleCornerShowcase}
          />
        </div>
      </div>

      <svg
        className={`pointer-events-none fixed inset-0 z-30 h-full w-full transition-opacity duration-700 ${showcaseCorner !== null && lineFrom ? 'opacity-100' : 'opacity-0'}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {/* Edge lines: bright at piece, fade toward panel */}
          <linearGradient id="lgLeft" gradientUnits="userSpaceOnUse"
            x1={lineFrom?.x ?? 80} y1={lineFrom?.y ?? 72} x2={49} y2={54}>
            <stop offset="0%"   stopColor="rgba(210,245,255,0.95)" />
            <stop offset="100%" stopColor="rgba(80,170,255,0.08)" />
          </linearGradient>
          <linearGradient id="lgRight" gradientUnits="userSpaceOnUse"
            x1={lineFrom?.x ?? 80} y1={lineFrom?.y ?? 72} x2={85} y2={54}>
            <stop offset="0%"   stopColor="rgba(210,245,255,0.95)" />
            <stop offset="100%" stopColor="rgba(80,170,255,0.08)" />
          </linearGradient>
          {/* Cone body: depth falloff along beam axis */}
          <linearGradient id="coneBodyGrad" gradientUnits="userSpaceOnUse"
            x1={lineFrom?.x ?? 80} y1={lineFrom?.y ?? 72} x2={67} y2={54}>
            <stop offset="0%"   stopColor="rgba(160,225,255,0.55)" />
            <stop offset="30%"  stopColor="rgba(100,200,255,0.20)" />
            <stop offset="100%" stopColor="rgba(80,170,255,0.03)" />
          </linearGradient>
          {/* Center axis: bright core stripe */}
          <linearGradient id="axisGrad" gradientUnits="userSpaceOnUse"
            x1={lineFrom?.x ?? 80} y1={lineFrom?.y ?? 72} x2={67} y2={54}>
            <stop offset="0%"   stopColor="rgba(230,250,255,0.92)" />
            <stop offset="45%"  stopColor="rgba(160,230,255,0.42)" />
            <stop offset="100%" stopColor="rgba(80,180,255,0.05)" />
          </linearGradient>

          {/* Clip path: exact cone boundary */}
          <clipPath id="coneClip">
            <polygon points={lineFrom
              ? `${lineFrom.x - 1.6},${lineFrom.y} ${lineFrom.x + 1.6},${lineFrom.y} 85,54 49,54`
              : '0,0'} />
          </clipPath>

          {/* Mask: white everywhere, soft-blurred black cutout for cone area
              → dark overlay shows everywhere EXCEPT the beam              */}
          <filter id="maskSoften" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
          <mask id="darkMask">
            <rect x="-5" y="-5" width="110" height="110" fill="white" />
            {lineFrom && (
              <polygon
                points={`${lineFrom.x - 5},${lineFrom.y + 2} ${lineFrom.x + 5},${lineFrom.y + 2} 92,53 42,53`}
                fill="black"
                filter="url(#maskSoften)"
              />
            )}
          </mask>

          {/* Filters */}
          <filter id="ambientBlur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.8" />
          </filter>
          <filter id="axisGlow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="0.7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="srcGlow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.0" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ① Dark backdrop — dims scene outside beam */}
        <rect x="-5" y="-5" width="110" height="110"
          fill="rgba(1,3,20,0.45)" mask="url(#darkMask)" />

        {lineFrom && (() => {
          const px = lineFrom.x, py = lineFrom.y
          const lx = px - 1.6, rx = px + 1.6
          return (
            <>
              {/* ② Wide ambient glow — the "air haze" around the beam */}
              <polygon
                points={`${lx - 1},${py} ${rx + 1},${py} 90,54 44,54`}
                fill="rgba(60,150,255,0.07)"
                filter="url(#ambientBlur)"
              />

              {/* ③ Main cone body — depth falloff via gradient, clipped to shape */}
              <rect x="0" y="0" width="100" height="100"
                fill="url(#coneBodyGrad)"
                clipPath="url(#coneClip)"
              />

              {/* ④ Inner bright lobe — narrower polygon makes center visually brighter */}
              <polygon
                points={`${px - 0.6},${py} ${px + 0.6},${py} 74,54 60,54`}
                fill="rgba(130,215,255,0.18)"
                filter="url(#ambientBlur)"
              />

              {/* ⑤ Center axis — the hot core of the projector beam */}
              <line
                x1={px} y1={py} x2={67} y2={54}
                stroke="url(#axisGrad)" strokeWidth="0.9"
                filter="url(#axisGlow)"
                vectorEffect="non-scaling-stroke"
              />

              {/* ⑥ Edge definition lines */}
              <line x1={lx} y1={py} x2={49} y2={54}
                stroke="url(#lgLeft)" strokeWidth="0.22"
                vectorEffect="non-scaling-stroke" />
              <line x1={rx} y1={py} x2={85} y2={54}
                stroke="url(#lgRight)" strokeWidth="0.22"
                vectorEffect="non-scaling-stroke" />

              {/* ⑦ Source burst — small bright core only */}
              <circle cx={px} cy={py} r="1.3"
                fill="rgba(175,238,255,0.88)" filter="url(#srcGlow)" />
              <circle cx={px} cy={py} r="0.46"
                fill="rgba(245,252,255,0.99)" />

              {/* ⑧ Panel corner anchors */}
              <circle cx={49} cy={54} r="0.32" fill="rgba(80,180,255,0.82)" />
              <circle cx={85} cy={54} r="0.32" fill="rgba(80,180,255,0.82)" />
            </>
          )
        })()}
      </svg>

      {/* ── Corner showcase panel — 3D digital frame ── */}
      <div
        className={`pointer-events-none absolute z-30 transition-all duration-500 ${showcaseCorner !== null ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        style={{ right: '15vw', top: '12vh', width: '36%', height: '42vh' }}
        aria-hidden="true"
      >
        {displayCorner !== null && (() => {
          const c = corners[displayCorner]
          const idx = displayCorner + 1
          const total = corners.length
          return (
              <div
                className="relative h-full w-full overflow-hidden"
                style={{
                  border: '4px solid rgba(80,180,255,0.82)',
                  boxShadow: [
                    '0 0 0 1px rgba(80,180,255,0.18)',    // hairline halo
                    '0 0 18px rgba(80,180,255,0.50)',      // tight glow
                    '0 0 55px rgba(60,150,255,0.28)',      // mid bloom
                    '0 0 110px rgba(40,120,255,0.14)',     // wide atmosphere
                    'inset 0 0 50px rgba(0,8,45,0.55)',   // inner vignette
                  ].join(', '),
                }}
              >
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover" />

                {/* Edge vignette blur — darker corners for 3D depth illusion */}
                <div className="absolute inset-0 z-10" style={{
                  background: [
                    'radial-gradient(ellipse at center, transparent 35%, rgba(0,5,30,0.60) 100%)',
                  ].join(', '),
                }} />

                {/* Specular top edge — simulates light hitting the screen rim */}
                <div className="absolute inset-x-0 top-0 z-20" style={{
                  height: '1px',
                  background: 'linear-gradient(to right, transparent 0%, rgba(160,225,255,0.85) 25%, rgba(220,248,255,0.95) 50%, rgba(160,225,255,0.85) 75%, transparent 100%)',
                }} />
                {/* Left edge highlight */}
                <div className="absolute inset-y-0 left-0 z-20" style={{
                  width: '1px',
                  background: 'linear-gradient(to bottom, rgba(150,220,255,0.80) 0%, rgba(80,180,255,0.25) 65%, transparent 100%)',
                }} />

                {/* Corner brackets — thicker, brighter */}
                <div className="absolute left-0 top-0 z-20 h-6 w-6"
                  style={{ borderTop: '2px solid rgba(80,180,255,1)', borderLeft: '2px solid rgba(80,180,255,1)' }} />
                <div className="absolute right-0 top-0 z-20 h-6 w-6"
                  style={{ borderTop: '2px solid rgba(80,180,255,1)', borderRight: '2px solid rgba(80,180,255,1)' }} />
                <div className="absolute bottom-0 left-0 z-20 h-6 w-6"
                  style={{ borderBottom: '2px solid rgba(80,180,255,1)', borderLeft: '2px solid rgba(80,180,255,1)' }} />
                <div className="absolute bottom-0 right-0 z-20 h-6 w-6"
                  style={{ borderBottom: '2px solid rgba(80,180,255,1)', borderRight: '2px solid rgba(80,180,255,1)' }} />

                {/* Counter — top right */}
                <div className="absolute right-6 top-2 z-20 font-mono text-[8px] tabular-nums tracking-widest text-[rgba(80,180,255,0.70)]">
                  {idx.toString().padStart(2,'0')}/{total.toString().padStart(2,'0')}
                </div>

                {/* Bottom label */}
                <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-4 pt-12"
                  style={{ background: 'linear-gradient(to top, rgba(2,5,30,0.96) 0%, transparent 100%)' }}>
                  <h2 className="text-xl font-bold leading-tight tracking-wider text-white">
                    {c.label}
                  </h2>
                  {c.sublabel && (
                    <h3 className="font-mono text-sm font-semibold tracking-[0.18em] text-[#50b4ff]">
                      {c.sublabel}
                    </h3>
                  )}
                </div>
              </div>
          )
        })()}
      </div>

      {/* ── Hero copy — hidden until intro completes ── */}
      <div
        className="pointer-events-none relative z-20 mx-auto flex min-h-screen items-start justify-start px-5 pt-24 text-start md:items-center md:px-[10vw] md:pt-0"
        style={{ opacity: introComplete ? undefined : 0 }}
      >
        <div className="w-full md:w-[clamp(400px,42%,640px)]">
          <h1 data-hero-heading className="mb-6 whitespace-pre-line text-[clamp(24px,2.7vw,62px)] font-extrabold text-white">
            {data?.heading ?? 'KẾT NỐI CÔNG NGHỆ\nKIẾN TẠO HẠ TẦNG TƯƠNG LAI'}
          </h1>
          <p data-hero-sub className="mb-10 text-start text-[clamp(16px,1vw,22px)] font-light text-[#E3F2FD]/75">
            {data?.description ?? 'General Systems cung cấp các giải pháp công nghệ toàn diện, giúp doanh nghiệp tối ưu hiệu quả và tối ưu hoá trong kỷ nguyên số.'}
          </p>
          <div data-hero-cta className="flex flex-col justify-start gap-4 sm:flex-row">
            <a
              href={data?.cta?.href ?? '#solutions'}
              className="glassContainer pointer-events-auto items-center justify-center px-6 py-3 font-semibold text-white"
            >
              {data?.cta?.label ?? 'Khám Phá Giải Pháp'}
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </span>
            </a>
          </div>
          <div ref={statsRef} className="grid grid-cols-2 gap-8 pt-20 md:grid-cols-3">
            {(t.raw('stats') as { value: string; label: string }[]).map((stat) => (
              <div key={stat.label} data-stat className="text-start">
                <p className="text-4xl font-medium text-white">{stat.value}</p>
                <p className="mt-1 pt-5 text-sm font-light text-[#E3F2FD]/65">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FeaturesSection fills the second viewport ── */}
      <FeaturesSection />
    </section>
  )
}
