'use client'

import { Application } from '@splinetool/runtime'
import type { SplineEvent } from '@splinetool/runtime'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { ParticleCanvas } from '@/components/canvas/ParticleCanvas'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useSmoothScroll } from '@/context/SmoothScrollProvider'
import { gsap } from '@/lib/gsap'
import type { HeroSection as HeroData } from '@/types/strapi'

const NAV_LINKS = [
  { label: 'Trang chủ', href: '#home' },
  {
    label: 'Về chúng tôi',
    href: '#about',
    children: [
      { label: 'Về GS Group', href: '#about' },
      { label: 'Tầm nhìn & sứ mệnh', href: '#about' },
      { label: 'Giá trị cốt lõi', href: '#core-values' },
    ],
  },
  {
    label: 'Giải pháp',
    href: '#solutions',
    columns: [
      {
        label: 'Giải pháp',
        href: '#solutions',
        items: [
          { label: 'Giải pháp tích hợp', href: '#solutions' },
          { label: 'An ninh - Quốc phòng', href: '#solutions' },
          { label: 'Bảo mật - ATTT', href: '#solutions' },
          { label: 'Điện lực - Năng lượng', href: '#solutions' },
          { label: 'Viễn thông', href: '#solutions' },
          { label: 'Hàng không', href: '#solutions' },
        ],
      },
      {
        label: 'Dự án tiêu biểu',
        href: '#projects',
        items: [
          { label: 'Hệ thống GSM tự động', href: '#projects' },
          { label: 'Phần mềm bay Aves', href: '#projects' },
          { label: 'Hệ thống ATTT', href: '#projects' },
        ],
      },
    ],
  },
  { label: 'Liên hệ', href: '#contact' },
]

const STATS = [
  { value: '200+', label: 'Khách hàng' },
  { value: '350+', label: 'Dự án thành công' },
  { value: '10+', label: 'Năm kinh nghiệm' },
]

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
  const statsRef = useScrollReveal<HTMLDivElement>({
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 },
    start: 'top 85%',
    childSelector: '[data-stat]',
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [disableSpline, setDisableSpline] = useState(false);

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero-heading]', { opacity: 0, y: 50, duration: 0.9 })
        .from('[data-hero-sub]', { opacity: 0, y: 30, duration: 0.7 }, '-=0.5')
        .from('[data-hero-cta]', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
    }, container)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return;

    let app: Application;
    let handleSplineMouseDown: ((event: SplineEvent) => void) | undefined;

    async function init() {
      app = new Application(canvasRef.current!);
      splineAppRef.current = app

      await app.load("/model/mainCube2.splinecode");

      const milBtn = app.findObjectByName("Icon Cube 1");
      const electBtn = app.findObjectByName("Icon Cube 2");
      const secBtn = app.findObjectByName("Icon Cube 3");
      const solBtn = app.findObjectByName("Icon Cube 4");
      const interBtn = app.findObjectByName("Icon Cube 5");
      const airlineBtn = app.findObjectByName("Icon Cube 6");

      const solutionIndexByButtonName = new Map<string, number>()
      if (milBtn) solutionIndexByButtonName.set(milBtn.name, 1)
      if (electBtn) solutionIndexByButtonName.set(electBtn.name, 3)
      if (secBtn) solutionIndexByButtonName.set(secBtn.name, 2)
      if (solBtn) solutionIndexByButtonName.set(solBtn.name, 4)
      if (interBtn) solutionIndexByButtonName.set(interBtn.name, 0)
      if (airlineBtn) solutionIndexByButtonName.set(airlineBtn.name, 5)

      handleSplineMouseDown = (event) => {
        const solutionIndex = solutionIndexByButtonName.get(event.target.name)
        if (solutionIndex === undefined) return

        document.querySelector<HTMLElement>(`[data-solution-index="${solutionIndex}"]`)?.click()

        const solutionsSection = document.getElementById('solutions')
        if (!solutionsSection) return

        const targetTop = window.scrollY + solutionsSection.getBoundingClientRect().top
        if (lenisRef.current) {
          lenisRef.current.scrollTo(targetTop, {
            duration: 1.5,
            force: true,
            lock: true,
          })
        } else {
          window.scrollTo({ top: targetTop, behavior: 'smooth' })
        }
      }

      app.addEventListener('mouseDown', handleSplineMouseDown)
    }

    init();

    return () => {
      if (app && handleSplineMouseDown) {
        app.removeEventListener('mouseDown', handleSplineMouseDown)
      }
      splineAppRef.current = null
      app?.dispose()
    };
  }, [lenisRef]);

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
    <section ref={containerRef} id="home" className="relative min-h-[200vh] bg-slate-200">
      <header className="absolute top-0 z-50 w-full">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="inline-flex items-center pt-2">
            <Image src="/image/logoLg.png" alt="Logo" width={180} height={50} priority />
          </Link>

          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="pointer-events-auto inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white/70 p-2 text-slate-900 transition-colors hover:bg-white md:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link, index) => (
              <div key={link.label} className="group relative">
                <a href={link.href} className={`inline-flex items-center gap-1.5 py-2 text-sm text-white transition-colors hover:text-[#A31F1A] ${index === 0 ? 'font-medium' : 'font-light'}`}>
                  {link.label}
                  {(link.children || link.columns) && (
                    <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
                    </svg>
                  )}
                </a>
                {link.children && (
                  <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-xl border border-white/40 bg-white/90 p-2 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
                      {link.children.map((child) => (
                        <a key={child.label} href={child.href} className="block rounded-lg px-4 py-2.5 text-sm font-light text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#A31F1A]">
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {link.columns && (
                  <div className="invisible absolute left-1/2 top-full z-50 w-[34rem] -translate-x-1/2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-xl border border-white/40 bg-white/90 p-3 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
                      {link.columns.map((column) => (
                        <div key={column.label} className="rounded-lg p-2">
                          <a href={column.href} className="mb-2 block px-2 text-sm font-medium text-slate-800 transition-colors hover:text-[#A31F1A]">
                            {column.label}
                          </a>
                          <div className="space-y-1">
                            {column.items.map((item) => (
                              <a key={item.label} href={item.href} className="block rounded-lg px-2 py-2 text-sm font-light text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#A31F1A]">
                                {item.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className={`${menuOpen ? 'block' : 'hidden'} border-t border-slate-300/70 bg-white/80 px-5 py-4 md:hidden`}>
          <nav className="mx-auto flex max-w-6xl flex-col gap-3">
            {NAV_LINKS.map((link, index) => (
              <div key={link.label}>
                <a href={link.href} onClick={() => setMenuOpen(false)} className={`block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-950 ${index === 0 ? 'font-medium' : 'font-light'}`}>
                  {link.label}
                </a>
                {link.children && (
                  <div className="ml-4 border-l border-slate-200 pl-2">
                    {link.children.map((child) => (
                      <a key={child.label} href={child.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-light text-slate-500 hover:bg-slate-100 hover:text-[#A31F1A]">
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
                {link.columns && (
                  <div className="ml-4 grid grid-cols-1 gap-3 border-l border-slate-200 pl-4 sm:grid-cols-2">
                    {link.columns.map((column) => (
                      <div key={column.label}>
                        <a href={column.href} onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-700">
                          {column.label}
                        </a>
                        {column.items.map((item) => (
                          <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-2 py-2 text-sm font-light text-slate-500 hover:bg-slate-100 hover:text-[#A31F1A]">
                            {item.label}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-0 z-0 bg-radial-[at_25%_47%] from-slate-100 via-slate-200 to-slate-500" />
      <div className="pointer-events-none absolute -left-80 bottom-0 z-0 h-[900px] w-[900px] rounded-full bg-gray opacity-90 blur-3xl" />
      <div className="pointer-events-none absolute right-32 top-40 z-0 h-[500px] w-[500px] rounded-full bg-blue-200 opacity-30 blur-[150px]" />
      <div className="pointer-events-none absolute inset-0 z-0">
        <ParticleCanvas count={10000} color={0xffffff} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className={`block h-full w-full ${disableSpline ? 'pointer-events-none' : 'pointer-events-auto'}`}
          />
        </div>
      </div>

      <div className="pointer-events-none relative z-20 mx-auto flex min-h-screen items-center justify-start px-[10vw] text-start">
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
