'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'

const AtomicCanvas = dynamic(
  () => import('@/components/canvas/AtomicCanvas').then((m) => m.AtomicCanvas),
  { ssr: false },
)

interface CVFeatureItem {
  id: string | number
  title: string
  description: string
}

interface CVFeaturesData {
  heading?: string
  features?: CVFeatureItem[]
}

interface FeaturesSectionProps {
  data?: CVFeaturesData
}

const FALLBACK_CORE_VALUES: CVFeatureItem[] = [
  { id: '01', title: 'Giá trị và Niềm tin là trên hết',      description: 'Cung cấp giải pháp end-to-end phù hợp với mọi nhu cầu doanh nghiệp.' },
  { id: '02', title: 'Tôn trọng giá trị cá nhân',            description: 'Ứng dụng công nghệ mới nhất tối ưu hiệu quả và nâng cao năng lực cạnh tranh.' },
  { id: '03', title: 'Tư duy hệ thống – Tư duy toàn cầu',   description: 'Đội ngũ giàu kinh nghiệm, tận tâm đồng hành cùng khách hàng trên mọi hành trình.' },
  { id: '04', title: 'Học tập liên tục – Đổi mới không ngừng', description: 'Cam kết chất lượng, bảo mật và hỗ trợ lâu dài cho mọi giải pháp.' },
  { id: '05', title: 'Một công ty – Một gia đình',            description: 'Xây dựng văn hoá gắn kết, chia sẻ và phát triển bền vững cùng nhau.' },
]

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

  const features = data?.features?.length ? data.features : FALLBACK_CORE_VALUES

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
            <h1 className="mb-4 text-[clamp(22px,2vw,34px)] font-extrabold leading-[1.1] tracking-[-0.01em] whitespace-nowrap text-[#263A59]">
              {data?.heading ?? 'GIÁ TRỊ CỐT LÕI'}
            </h1>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div key={feature.id} data-core-reveal className="h-full">
                <div className="flex h-full items-start gap-4 rounded-xl p-6">
                  <Image
                    src={CORE_VALUE_ICONS[index % CORE_VALUE_ICONS.length]}
                    alt=""
                    aria-hidden="true"
                    width={56}
                    height={56}
                  />
                  <div className="min-w-0">
                    <h3 className="mb-2 text-xl font-bold text-[#30549B]">
                      {feature.title}
                    </h3>
                    <p className="font-light leading-relaxed text-[#30549B]">
                      {feature.description}
                    </p>
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
