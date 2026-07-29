'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useSmoothScroll } from '@/context/SmoothScrollProvider'
import { gsap } from '@/lib/gsap'
import { HERO_INTRO_COMPLETE_EVENT } from '@/lib/intro'
import type { HeroSection as HeroData } from '@/types/strapi'

// Three.js canvas — client-only, no SSR
const RubikCanvas = dynamic(
  () => import('@/components/canvas/RubikCanvas').then((m) => m.RubikCanvas),
  { ssr: false },
)

const STATS = [
  { value: '200+', label: 'Khách hàng' },
  { value: '350+', label: 'Dự án thành công' },
  { value: '10+', label: 'Năm kinh nghiệm' },
]

// Maps solution slug → index in SolutionSection cards
const SOLUTION_ID_TO_INDEX: Record<string, number> = {
  'giai-phap-tich-hop': 0,
  'an-ninh-quoc-phong': 1,
  'bao-mat-attt': 2,
  'dien-luc-nang-luong': 3,
  'vien-thong': 4,
  'hang-khong': 5,
}

interface HeroSectionProps {
  data?: HeroData
  siteName?: string
}

export function HeroSection({ data }: HeroSectionProps) {
  const { lenisRef } = useSmoothScroll()
  const containerRef = useRef<HTMLElement>(null)

  // Phase 1: Three.js scene initialised → fade loading overlay to reveal particles
  const [overlayFading, setOverlayFading] = useState(false)
  // Phase 2: Rubik cube assembled + in hero position → animate text, unlock scroll
  const [introComplete, setIntroComplete] = useState(false)

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
    <section ref={containerRef} id="home" className="relative min-h-[200vh] bg-gradient-to-b from-sky-400 via-sky-100 to-slate-50">

      {/* ── Loading overlay ── */}
      <div
        aria-hidden={introComplete}
        className={`fixed inset-0 z-[999] flex flex-col items-center justify-center gap-8 bg-slate-900 transition-opacity duration-500 ease-in-out ${overlayFading ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(30,58,120,0.45),transparent_60%)]" />
        <div className="relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/image/logoLg.png" alt="General Systems" className="h-auto w-[200px] brightness-200 invert" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300/70">
            Đang khởi tạo
          </p>
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-sky-300 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-200" />
          </div>
        </div>
      </div>

      {/* ── Header — starts hidden, GSAP reveals on introComplete ── */}
      <div data-hero-header className="relative z-50 -translate-y-4 opacity-0">
        <SiteHeader overlay />
      </div>

      {/* ── Sky cloud layer ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Top-left cloud cluster */}
        <div className="absolute -left-8 top-[4%] h-32 w-80 rounded-full bg-white/80 blur-2xl" />
        <div className="absolute left-[5%] top-[9%] h-20 w-60 rounded-full bg-white/70 blur-xl" />
        {/* Top-centre cloud */}
        <div className="absolute left-[28%] top-[2%] h-36 w-96 rounded-full bg-white/75 blur-2xl" />
        <div className="absolute left-[34%] top-[8%] h-24 w-72 rounded-full bg-white/65 blur-xl" />
        {/* Top-right cloud cluster */}
        <div className="absolute right-[3%] top-[5%] h-28 w-80 rounded-full bg-white/80 blur-2xl" />
        <div className="absolute right-[9%] top-[11%] h-20 w-56 rounded-full bg-white/70 blur-xl" />
        {/* Mid scattered */}
        <div className="absolute left-[14%] top-[20%] h-16 w-48 rounded-full bg-white/50 blur-2xl" />
        <div className="absolute right-[22%] top-[23%] h-14 w-44 rounded-full bg-white/45 blur-xl" />
      </div>

      {/* ── Three.js Rubik canvas — sticky so it tracks both viewports ── */}
      <div className="pointer-events-auto absolute inset-0 z-10">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <RubikCanvas
            heroSectionId="home"
            onSolutionClick={handleSolutionClick}
            onSceneReady={handleSceneReady}
            onAssemblyComplete={handleAssemblyComplete}
          />
        </div>
      </div>

      {/* ── Hero copy — hidden until intro completes ── */}
      <div
        className="pointer-events-none relative z-20 mx-auto flex min-h-screen items-start justify-start px-5 pt-24 text-start md:items-center md:px-[10vw] md:pt-0"
        style={{ opacity: introComplete ? undefined : 0 }}
      >
        <div className="w-full md:w-[clamp(400px,42%,640px)]">
          <h1 data-hero-heading className="mb-6 text-[clamp(22px,2.5vw,58px)] font-bold text-blue-900">
            {data?.heading ?? (
              <>KẾT NỐI CÔNG NGHỆ XÂY DỰNG <span className="text-blue-600">TƯƠNG LAI</span></>
            )}
          </h1>
          <p data-hero-sub className="mb-10 text-start text-[clamp(16px,1vw,22px)] font-light text-slate-600">
            {data?.description ?? 'General Systems cung cấp các giải pháp công nghệ toàn diện, giúp doanh nghiệp tối ưu hiệu quả và tối ưu hoá trong kỷ nguyên số.'}
          </p>
          <div data-hero-cta className="flex flex-col justify-start gap-4 sm:flex-row">
            <a
              href={data?.cta?.href ?? '#solutions'}
              className="glassContainer pointer-events-auto items-center justify-center px-6 py-3 font-semibold text-blue-900"
            >
              {data?.cta?.label ?? 'Khám Phá Giải Pháp'}
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900/10">
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </span>
            </a>
          </div>
          <div ref={statsRef} className="mx-auto grid max-w-5xl grid-cols-2 gap-8 pt-20 md:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.label} data-stat className="text-center">
                <p className="text-4xl font-medium text-slate-800">{stat.value}</p>
                <p className="mt-1 pt-5 text-sm font-light text-blue-600">{stat.label}</p>
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
