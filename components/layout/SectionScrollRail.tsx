'use client'

import { useEffect, useState } from 'react'
import { useSmoothScroll } from '@/context/SmoothScrollProvider'
import { HERO_INTRO_COMPLETE_EVENT } from '@/lib/intro'

const SECTION_LINKS = [
  { id: 'home', label: 'Trang chủ' },
  { id: 'features', label: 'Lý do lựa chọn' },
  { id: 'core-values', label: 'Giá trị cốt lõi' },
  { id: 'solutions', label: 'Giải pháp' },
  { id: 'projects', label: 'Dự án' },
  { id: 'partners', label: 'Đối tác' },
]

export function SectionScrollRail() {
  const [activeId, setActiveId] = useState(SECTION_LINKS[0].id)
  const [isIntroComplete, setIsIntroComplete] = useState(false)
  const { lenisRef } = useSmoothScroll()

  useEffect(() => {
    const showScrollRail = () => setIsIntroComplete(true)

    window.addEventListener(HERO_INTRO_COMPLETE_EVENT, showScrollRail)
    return () => window.removeEventListener(HERO_INTRO_COMPLETE_EVENT, showScrollRail)
  }, [])

  useEffect(() => {
    let animationFrameId = 0

    const updateActiveSection = () => {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = requestAnimationFrame(() => {
        const marker = window.innerHeight * 0.45
        let nextActiveId = SECTION_LINKS[0].id

        for (const { id } of SECTION_LINKS) {
          const section = document.getElementById(id)
          if (!section) continue

          const rect = section.getBoundingClientRect()
          if (rect.top <= marker) nextActiveId = id
        }

        setActiveId((currentId) =>
          currentId === nextActiveId ? currentId : nextActiveId,
        )
      })
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [])

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    if (!section) return

    setActiveId(id)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targetTop = window.scrollY + section.getBoundingClientRect().top

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetTop, {
        immediate: reduceMotion,
        duration: reduceMotion ? 0 : 1.5,
        force: true,
        lock: !reduceMotion,
        onComplete: () => setActiveId(id),
      })
    } else {
      window.scrollTo({
        top: targetTop,
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
    }
  }

  return (
    <nav
      aria-label="Điều hướng các phần"
      aria-hidden={!isIntroComplete}
      className={`hidden md:flex fixed right-1 top-1/2 z-[90] flex-col items-center py-2 transition-[opacity,transform] duration-700 ease-out sm:right-3 ${
        isIntroComplete
          ? 'pointer-events-auto -translate-y-1/2 opacity-100'
          : 'pointer-events-none -translate-y-[45%] opacity-0'
      }`}
    >
      {SECTION_LINKS.map(({ id, label }) => {
        const isActive = activeId === id

        return (
          <button
            key={id}
            type="button"
            disabled={!isIntroComplete}
            aria-label={`Đi tới ${label}`}
            aria-current={isActive ? 'location' : undefined}
            onClick={() => scrollToSection(id)}
            className="group relative flex h-7 w-6 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A31F1A] focus-visible:ring-offset-2"
          >
            <span
              role="tooltip"
              className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {label}
            </span>

            <span
              aria-hidden="true"
              className={`h-4 w-1 rounded-full transition-[background-color,transform] duration-300 ${isActive
                  ? 'scale-x-150 bg-[#A31F1A]'
                  : 'bg-slate-400/45 group-hover:bg-slate-600/70'
                }`}
            />
          </button>
        )
      })}
    </nav>
  )
}
