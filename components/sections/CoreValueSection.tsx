'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from '@/lib/gsap'
import { HEADING_SIZE_CLS, TEXT_SIZE_CLS } from '@/lib/admin/sizes'

const AtomicCanvas = dynamic(
  () => import('@/components/canvas/AtomicCanvas').then((m) => m.AtomicCanvas),
  { ssr: false },
)

interface CVFeatureItem {
  id: string | number
  title: string
  titleSize?: string
  description: string
  descSize?: string
  icon?: string
}

interface CVFeaturesData {
  heading?: string
  features?: CVFeatureItem[]
}

interface FeaturesSectionProps {
  data?: CVFeaturesData
}


const CORE_VALUE_ICONS = [
  '/assets/coreSection-icon/badge.svg',
  '/assets/coreSection-icon/person.svg',
  '/assets/coreSection-icon/ai-mi.svg',
  '/assets/coreSection-icon/idea-bulb.svg',
  '/assets/coreSection-icon/group.svg',
]

export function CoreValueSection({ data }: FeaturesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()
  const locale = pathname.startsWith('/en') ? 'en' : 'vi'
  const [cmsItems, setCmsItems] = useState<CVFeatureItem[] | null>(null)
  const [cmsHeading, setCmsHeading] = useState<string | null>(null)
  const [cmsHeadingSize, setCmsHeadingSize] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetch(`/api/admin/content?locale=${locale}`)
      .then((r) => r.json())
      .then((d: { coreValues?: { heading?: string; headingSize?: string; items?: CVFeatureItem[] } }) => {
        if (d.coreValues?.items?.length) setCmsItems(d.coreValues.items)
        if (d.coreValues?.heading) setCmsHeading(d.coreValues.heading)
        if (d.coreValues?.headingSize) setCmsHeadingSize(d.coreValues.headingSize)
      })
      .catch(() => {})
  }, [locale])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '100px 0px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>('[data-core-reveal]')
      gsap.fromTo(
        targets,
        { opacity: 0, y: 70 },
        {
          opacity: 1,
          y: 0,
          ease: 'circ.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'top 40%',
            scrub: 4,
          },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [])

  const features = cmsItems ?? data?.features ?? []

  return (
    <section
      ref={sectionRef}
      id="core-values"
      className="relative min-h-screen bg-white"
    >
      <div className="grid min-h-screen md:grid-cols-[58%_42%]">

        {/* ── Left: content — z-10 keeps text above the canvas overflow ── */}
        <div className="relative z-10 flex min-h-screen flex-col justify-center px-5 py-14 md:px-0 md:pl-[10vw] md:py-24">
          <div data-core-reveal>
            <h1 className={`mb-4 font-extrabold leading-[1.1] tracking-[-0.01em] whitespace-nowrap text-[#263A59] ${HEADING_SIZE_CLS[cmsHeadingSize ?? 'base'] ?? 'text-[clamp(22px,2vw,34px)] md:text-[clamp(32px,3vw,48px)]'}`}>
              {cmsHeading ?? data?.heading}
            </h1>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div key={feature.id} data-core-reveal className="h-full">
                <div className="flex h-full items-start gap-4 rounded-xl p-6">
                  {feature.icon?.trim().startsWith('<') ? (
                    <span
                      className="block h-14 w-14 shrink-0 text-[#30549B] [&_svg]:h-full [&_svg]:w-full"
                      aria-hidden="true"
                      dangerouslySetInnerHTML={{ __html: feature.icon }}
                    />
                  ) : feature.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={feature.icon} alt="" aria-hidden="true" className="h-14 w-14 shrink-0 object-contain" />
                  ) : (
                    <Image
                      src={CORE_VALUE_ICONS[index % CORE_VALUE_ICONS.length]}
                      alt=""
                      aria-hidden="true"
                      width={56}
                      height={56}
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className={`mb-2 font-bold text-[#30549B] ${TEXT_SIZE_CLS[feature.titleSize ?? 'xl'] ?? 'text-xl'}`}>
                      {feature.title}
                    </h3>
                    <p className="font-light leading-relaxed text-[#30549B]" dangerouslySetInnerHTML={{ __html: feature.description }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Three.js atom ─────────────────────────────────────────
             Canvas container extends left: -55% into the text column so
             rings can visually overflow during scale-up. pointer-events-none
             keeps text fully interactive; z-10 on the left col wins the stack. */}
        <div className="relative hidden min-h-screen md:block">
          <div
            className="pointer-events-none absolute inset-y-0 right-0"
            style={{ left: '-55%' }}
          >
            <AtomicCanvas active={isVisible} />
          </div>
        </div>

      </div>
    </section>
  )
}
