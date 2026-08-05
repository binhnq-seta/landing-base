'use client'

import { useEffect, useState } from 'react'
import { gsap } from '@/lib/gsap'

export function DetailScrollAnimations() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const updateVisibility = () => setShowBackToTop(window.scrollY > 500)
    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateVisibility)
  }, [])

  useEffect(() => {
    const page = document.querySelector<HTMLElement>('[data-detail-page]')
    if (!page || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-detail-reveal]').forEach((target) => {
        const isHeroElement = target.hasAttribute('data-detail-hero')
        const isEarlyReveal = target.hasAttribute('data-detail-reveal-early')
        const delay = Number(target.dataset.detailDelay ?? 0)

        if (isHeroElement) {
          gsap.from(target, {
            autoAlpha: 0,
            y: 80,
            delay: 0.2 + delay,
            duration: 1.5,
            ease: 'power3.out',
            force3D: true,
          })
          return
        }

        gsap.from(target, {
          autoAlpha: 0,
          y: 64,
          delay,
          duration: 1,
          ease: 'power3.out',
          force3D: true,
          scrollTrigger: {
            trigger: target,
            start: isEarlyReveal ? 'top 98%' : 'top 88%',
            end: isEarlyReveal ? 'top 76%' : 'top 55%',
            scrub: isEarlyReveal ? 0.5 : 0.8,
          },
        })
      })
    }, page)

    return () => context.revert()
  }, [])

  function scrollToTop() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Lên đầu trang"
      title="Lên đầu trang"
      className={`fixed bottom-6 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#A31F1A] text-white shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#7f1713] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A31F1A] focus-visible:ring-offset-2 md:bottom-8 md:right-8 ${
        showBackToTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <path d="M4 12.5 10 6l6 6.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
