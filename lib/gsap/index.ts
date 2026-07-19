import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

// Register plugins once (safe to call multiple times)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
}

export { gsap, ScrollTrigger, ScrollToPlugin }

// ─── Presets ──────────────────────────────────────────────────────────────────

/** Fade up reveal — use with ScrollTrigger */
export const fadeUpConfig = {
  from: { opacity: 0, y: 60 },
  to: { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
}

/** Stagger children reveal */
export const staggerConfig = {
  from: { opacity: 0, y: 40 },
  to: { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.12 },
}

/** Scale-in */
export const scaleInConfig = {
  from: { opacity: 0, scale: 0.88 },
  to: { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.2)' },
}

// ─── Utility: build a ScrollTrigger animation ─────────────────────────────────

export interface ScrollRevealOptions {
  trigger: string | Element
  start?: string
  end?: string
  scrub?: boolean | number
  pin?: boolean
  markers?: boolean
}

export function createScrollReveal(
  target: string | Element | Element[],
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
  scrollOptions: ScrollRevealOptions
) {
  return gsap.fromTo(target, fromVars, {
    ...toVars,
    scrollTrigger: {
      trigger: scrollOptions.trigger,
      start: scrollOptions.start ?? 'top 85%',
      end: scrollOptions.end,
      scrub: scrollOptions.scrub,
      pin: scrollOptions.pin,
      markers: scrollOptions.markers ?? false,
    },
  })
}

// ─── Lenis integration with ScrollTrigger ─────────────────────────────────────

/** Call this inside your SmoothScrollProvider after Lenis is ready */
export function connectLenisToScrollTrigger(lenis: {
  on: (event: string, cb: () => void) => void
  off: (event: string, cb: () => void) => void
  raf: (time: number) => void
}) {
  const handleScroll = () => ScrollTrigger.update()
  const updateLenis = (time: number) => lenis.raf(time * 1000)

  lenis.on('scroll', handleScroll)
  gsap.ticker.add(updateLenis)

  gsap.ticker.lagSmoothing(0)

  return () => {
    lenis.off('scroll', handleScroll)
    gsap.ticker.remove(updateLenis)
  }
}
