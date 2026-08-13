'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

const PARTNER_LOGOS = [
  { src: '/image/partner-logo/petro.png', alt: 'PetroVietnam' },
  { src: '/image/partner-logo/evn.png', alt: 'EVN' },
  { src: '/image/partner-logo/image%2033.png', alt: 'Đối tác General Systems 1' },
  { src: '/image/partner-logo/image%2032.png', alt: 'Đối tác General Systems 2' },
  { src: '/image/partner-logo/image%2032-1.png', alt: 'Đối tác General Systems 3' },
  { src: '/image/partner-logo/image%2032-2.png', alt: 'Đối tác General Systems 4' },
  { src: '/image/partner-logo/image%2032-3.png', alt: 'Đối tác General Systems 5' },
  { src: '/image/partner-logo/image%2032-4.png', alt: 'Đối tác General Systems 6' },
]

interface PartnerLogo {
  src: string
  alt: string
}

interface PartnerSectionProps {
  data?: PartnerLogo[]
  heading?: string
}

export function PartnerSection({ data, heading }: PartnerSectionProps) {
  const logos = data ?? PARTNER_LOGOS
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const revealTween = gsap.fromTo(
      section.querySelectorAll('[data-partner-reveal]'),
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        paused: true,
      },
    )

    const marqueeTween = reduceMotion
      ? null
      : gsap.fromTo(
        track,
        { xPercent: 0 },
        {
          xPercent: -50,
          duration: 28,
          ease: 'none',
          repeat: -1,
          paused: true,
          force3D: true,
        },
      )

    let isHovered = false

    const canPlayMarquee = () => {
      const bounds = section.getBoundingClientRect()
      return !isHovered
        && document.visibilityState === 'visible'
        && bounds.bottom > 0
        && bounds.top < window.innerHeight
    }

    const handleMouseEnter = () => {
      isHovered = true
      marqueeTween?.pause()
    }

    const handleMouseLeave = () => {
      isHovered = false
      if (canPlayMarquee()) marqueeTween?.play()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && document.visibilityState === 'visible') {
          if (revealTween.progress() === 0) revealTween.play()
          if (!isHovered) marqueeTween?.play()
        } else {
          marqueeTween?.pause()
        }
      },
      { threshold: 0.2 },
    )

    const handleVisibilityChange = () => {
      if (canPlayMarquee()) marqueeTween?.play()
      else marqueeTween?.pause()
    }

    observer.observe(section)
    section.addEventListener('mouseenter', handleMouseEnter)
    section.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      observer.disconnect()
      section.removeEventListener('mouseenter', handleMouseEnter)
      section.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      revealTween.kill()
      marqueeTween?.kill()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="partners"
      className="relative flex min-h-[60vh] items-center overflow-hidden py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-1"
      />

      <div className="relative z-10 w-full">
        <h1
          data-partner-reveal
          className="mb-4 px-6 text-center text-[clamp(22px,2vw,34px)] font-extrabold leading-[1.1] tracking-[-0.01em] whitespace-nowrap uppercase text-[#263A59] md:text-[clamp(32px,3vw,48px)]"
        >
          {heading ?? 'ĐỐI TÁC CỦA CHÚNG TÔI'}
        </h1>

        <p
          data-partner-reveal
          className="mx-auto mb-12 max-w-3xl px-6 text-center font-sans text-base leading-relaxed text-slate-600 md:text-lg"
        >
          GS GROUP tự hào đồng hành cùng các đối tác, tổ chức và doanh nghiệp hàng đầu trong nhiều lĩnh vực trọng điểm.
        </p>

        <div
          data-partner-reveal
          className="relative w-full overflow-hidden py-6"
        >
          <div ref={trackRef} className="flex w-max will-change-transform">
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                aria-hidden={groupIndex === 1}
                className="flex shrink-0 items-center gap-10 pr-10 md:gap-16 md:pr-16"
              >
                {logos.map((logo) => (
                  <div
                    key={`${groupIndex}-${logo.src}`}
                    className="relative h-28 w-48"
                  >
                    <Image
                      src={logo.src}
                      alt={groupIndex === 0 ? logo.alt : ''}
                      fill
                      sizes="(min-width: 768px) 224px, 192px"
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
