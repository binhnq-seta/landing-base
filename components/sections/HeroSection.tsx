'use client'

import { Application } from '@splinetool/runtime'
import { useEffect, useRef, useState } from 'react'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useSmoothScroll } from '@/context/SmoothScrollProvider'
import { gsap } from '@/lib/gsap'
import { HERO_INTRO_COMPLETE_EVENT } from '@/lib/intro'
import type { HeroSection as HeroData } from '@/types/strapi'

const STATS = [
  { value: '200+', label: 'Khách hàng' },
  { value: '350+', label: 'Dự án thành công' },
  { value: '10+', label: 'Năm kinh nghiệm' },
]

const SPLINE_INTRO_MS = 5000

interface HeroSectionProps {
  data?: HeroData
  siteName?: string
}

export function HeroSection({ data }: HeroSectionProps) {
  const { lenisRef } = useSmoothScroll()
  const containerRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const splineAppRef = useRef<Application | null>(null)
  const splineDisabledRef = useRef(false)
  const [introComplete, setIntroComplete] = useState(false)
  const statsRef = useScrollReveal<HTMLDivElement>({
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 },
    start: 'top 85%',
    childSelector: '[data-stat]',
  })
  const [disableSpline, setDisableSpline] = useState(false);

  useEffect(() => {
    if (!introComplete) return

    window.dispatchEvent(new Event(HERO_INTRO_COMPLETE_EVENT))

    const container = containerRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to('[data-hero-header]', { opacity: 1, y: 0, duration: 0.7 })
        .to('[data-hero-content]', { opacity: 1, duration: 0.15 }, '-=0.35')
        .from('[data-hero-heading]', { opacity: 0, y: 50, duration: 0.9 }, '-=0.15')
        .from('[data-hero-sub]', { opacity: 0, y: 30, duration: 0.7 }, '-=0.5')
        .from('[data-hero-cta]', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
    }, container)

    return () => ctx.revert()
  }, [introComplete])

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const previousHtmlOverflow = html.style.overflow
    const previousBodyOverflow = body.style.overflow
    const previousBodyTouchAction = body.style.touchAction
    const lenis = lenisRef.current

    window.scrollTo(0, 0)
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'
    lenis?.stop()

    if (!introComplete) return () => {
      html.style.overflow = previousHtmlOverflow
      body.style.overflow = previousBodyOverflow
      body.style.touchAction = previousBodyTouchAction
      lenis?.start()
    }

    html.style.overflow = previousHtmlOverflow
    body.style.overflow = previousBodyOverflow
    body.style.touchAction = previousBodyTouchAction
    lenisRef.current?.start()

    return undefined
  }, [introComplete, lenisRef])

  useEffect(() => {
    if (!canvasRef.current) return;

    let app: Application;
    let introTimer: number | undefined
    let isDisposed = false

    async function init() {
      app = new Application(canvasRef.current!);
      splineAppRef.current = app

      try {
        await app.load("/model/finalCube.splinecode");
        if (isDisposed) return

        introTimer = window.setTimeout(() => {
          setIntroComplete(true)
        }, SPLINE_INTRO_MS)
      } catch {
        if (!isDisposed) setIntroComplete(true)
      }
    }

    init();

    return () => {
      isDisposed = true
      if (introTimer !== undefined) window.clearTimeout(introTimer)
      app?.dispose()
    };
  }, []);

  useEffect(() => {
    const updateSplineInteraction = () => {
      const shouldDisable = window.scrollY > 10
      if (shouldDisable === splineDisabledRef.current) return

      if (shouldDisable) {
        const canvas = canvasRef.current

        canvas?.dispatchEvent(new PointerEvent('pointerout', { bubbles: true }))
        canvas?.dispatchEvent(new PointerEvent('pointerleave'))
        canvas?.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
        canvas?.dispatchEvent(new MouseEvent('mouseleave'))
        splineAppRef.current?.emitEventReverse('mouseHover', 'Cube')
      }

      splineDisabledRef.current = shouldDisable
      setDisableSpline(shouldDisable)
    }

    updateSplineInteraction()
    window.addEventListener('scroll', updateSplineInteraction, { passive: true })

    return () => window.removeEventListener('scroll', updateSplineInteraction)
  }, [])

  return (
    <section ref={containerRef} id="home" className="relative min-h-[200vh]">
      <div data-hero-header className="relative z-50 -translate-y-4 opacity-0">
        <SiteHeader overlay />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className={`block h-full w-full ${disableSpline ? 'pointer-events-none' : 'pointer-events-auto'}`}
          />
        </div>
      </div>

      <div data-hero-content className="pointer-events-none relative z-20 mx-auto flex min-h-screen items-center justify-start px-[10vw] text-start opacity-0">
        <div className="w-[clamp(200px,45%,900px)]">
          <h1 data-hero-heading className="mb-6 text-[clamp(30px,2.5vw,60px)] font-bold text-slate-950">
            {data?.heading ?? <>KẾT NỐI CÔNG NGHỆ XÂY DỰNG <span className="text-blue-500">TƯƠNG LAI</span></>}
          </h1>
          <p data-hero-sub className="mb-10 text-start text-[clamp(13px,1vw,24px)] font-light text-slate-600">
            {data?.description ?? 'General Systems cung cấp các giải pháp công nghệ toàn diện, giúp doanh nghiệp tối ưu hiệu quả và tối ưu hoá trong kỷ nguyên số.'}
          </p>
          <div data-hero-cta className="flex flex-col justify-start gap-4 sm:flex-row">
            <a href={data?.cta?.href ?? '#solutions'} className="glassContainer pointer-events-auto items-center justify-center px-6 py-3 font-semibold text-slate-700">
              {data?.cta?.label ?? 'Khám Phá Giải Pháp'}
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </span>
            </a>
          </div>
          <div ref={statsRef} className="mx-auto grid max-w-5xl grid-cols-2 gap-8 pt-20 md:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.label} data-stat className="text-center">
                <p className="text-4xl font-medium text-slate-700">{stat.value}</p>
                <p className="mt-1 pt-5 text-sm font-light text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FeaturesSection />
    </section>
  )
}
