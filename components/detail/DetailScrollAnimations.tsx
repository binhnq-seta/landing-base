'use client'

import { useEffect } from 'react'
import { gsap } from '@/lib/gsap'

export function DetailScrollAnimations() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>('[data-detail-page]')
    if (!page || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-detail-reveal]').forEach((target) => {
        const isHeroElement = target.hasAttribute('data-detail-hero')
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
            start: 'top 88%',
            end: 'top 55%',
            scrub: 0.8,
          },
        })
      })
    }, page)

    return () => context.revert()
  }, [])

  return null
}
