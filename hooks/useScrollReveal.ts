'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface ScrollRevealConfig {
  from: gsap.TweenVars
  to: gsap.TweenVars
  trigger?: string
  start?: string
  end?: string
  scrub?: boolean | number
  pin?: boolean
  /** Animate children instead of the ref element itself */
  childSelector?: string
}

/**
 * Attaches a GSAP fromTo animation triggered by scroll to the returned ref.
 *
 * @example
 * const ref = useScrollReveal({ from: { opacity: 0, y: 60 }, to: { opacity: 1, y: 0 } })
 * return <section ref={ref}>...</section>
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  config: ScrollRevealConfig
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      const target = config.childSelector
        ? ref.current!.querySelectorAll(config.childSelector)
        : ref.current!

      gsap.fromTo(target, config.from, {
        ...config.to,
        scrollTrigger: {
          trigger: ref.current!,
          start: config.start ?? 'top 85%',
          end: config.end,
          scrub: config.scrub,
          pin: config.pin,
        },
      })
    }, ref)

    return () => {
      ctx.revert()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return ref
}

/**
 * Pin a section and create a horizontal or vertical scrub animation.
 */
export function useScrubPin<T extends HTMLElement = HTMLDivElement>(options: {
  pinSpacing?: boolean
  start?: string
  end?: string
  onUpdate?: (progress: number) => void
}) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return

    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: options.start ?? 'top top',
      end: options.end ?? '+=200%',
      pin: true,
      pinSpacing: options.pinSpacing ?? true,
      scrub: true,
      onUpdate: (self) => options.onUpdate?.(self.progress),
    })

    return () => st.kill()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return ref
}
