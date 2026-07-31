'use client'

import type { FeaturesSection as FeaturesData } from '@/types/strapi'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from '@/lib/gsap'

interface FeaturesSectionProps {
  data?: FeaturesData
}

const ICONS = [
  <svg xmlns="http://www.w3.org/2000/svg" key="1" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>,
  <svg xmlns="http://www.w3.org/2000/svg" key="2" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
  </svg>,
  <svg xmlns="http://www.w3.org/2000/svg" key="3" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
  </svg>,
  <svg xmlns="http://www.w3.org/2000/svg" key="4" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
]

const FALLBACK_FEATURES_VI = [
  { id: 1, title: 'Giải pháp toàn diện', description: 'Cung cấp giải pháp end-to-end phù hợp với mọi nhu cầu doanh nghiệp.' },
  { id: 2, title: 'Công nghệ tiên tiến', description: 'Ứng dụng công nghệ mới nhất tối ưu hiệu quả và năng cao năng lực cạnh tranh.' },
  { id: 3, title: 'Đội ngũ chuyên gia', description: 'Đội ngũ giàu kinh nghiệm, tận tâm đồng hành cùng khách hàng trên mọi hành trình.' },
  { id: 4, title: 'Cam kết chất lượng', description: 'Cam kết chất lượng, bảo mật và hỗ trợ lâu dài cho mọi giải pháp.' },
]

const FALLBACK_FEATURES_EN = [
  { id: 1, title: 'Comprehensive Solutions', description: 'Providing end-to-end solutions tailored to every business need.' },
  { id: 2, title: 'Advanced Technology', description: 'Applying the latest technology to optimise efficiency and competitive advantage.' },
  { id: 3, title: 'Expert Team', description: 'An experienced team committed to accompanying clients on every journey.' },
  { id: 4, title: 'Quality Commitment', description: 'Committed to quality, security and long-term support for every solution.' },
]

export function FeaturesSection({ data }: FeaturesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const locale = pathname.startsWith('/en') ? 'en' : 'vi'

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const heading = section.querySelector<HTMLElement>('[data-feature-reveal]')
    const titles = section.querySelectorAll<HTMLElement>('[data-feature-title]')
    const descriptions = section.querySelectorAll<HTMLElement>('[data-feature-description]')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      gsap.set([heading, ...titles, ...descriptions], { opacity: 1, x: 0, y: 0, rotation: 0 })
      return
    }

    const revealTween = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 95%',
        end: 'bottom 85%',
        scrub: 2.5,
      },
    })

    revealTween
      .fromTo(heading, { opacity: 0, y: -80, rotation: -4 }, {
        opacity: 1,
        y: 0,
        rotation: 0,
        duration: 0.8,
        ease: 'back.out(1.4)',
      })
      .fromTo(titles, {
        opacity: 0,
        x: (index) => (index % 2 === 0 ? -160 : 160),
        y: (index) => (index % 3 === 0 ? -70 : 70),
        rotation: (index) => (index % 2 === 0 ? -9 : 9),
      }, {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: 'back.out(1.7)',
      }, '-=0.4')
      .fromTo(descriptions, {
        opacity: 0,
        x: (index) => (index % 2 === 0 ? 120 : -120),
        y: (index) => (index % 2 === 0 ? 80 : -80),
        rotation: (index) => (index % 2 === 0 ? 5 : -5),
      }, {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: 'power3.out',
      }, '-=0.65')

    return () => {
      revealTween.scrollTrigger?.kill()
      revealTween.kill()
    }
  }, [])

  const fallback = locale === 'en' ? FALLBACK_FEATURES_EN : FALLBACK_FEATURES_VI
  const features = data?.features?.length ? data.features : fallback

  const headingFallback = locale === 'en'
    ? <><span>WHY CHOOSE</span> <p><span className="text-[#A31F1A]">GENERAL SYSTEMS</span>?</p></>
    : <>VÌ SAO CHỌN <p><span className="text-[#A31F1A]">GENERAL SYSTEMS</span>?</p></>

  return (
    <section ref={sectionRef} id="features" className="relative min-h-screen bg-white">
      <div className="pointer-events-none relative z-20 grid md:grid-cols-2 gap-6">
        <div className="hidden md:flex relative flex-col mr-5 justify-center items-center min-h-screen">
          <div className="w-full h-full flex justify-center items-center">
          </div>
        </div>
        <div className="relative flex flex-col px-5 md:px-0 mr-0 md:mr-5 justify-center max-w-[800px] min-h-screen py-14 md:py-24">
          <div data-feature-reveal className="text-start">
            <h1 className="mb-4 text-[clamp(30px,2.5vw,60px)] font-semibold text-slate-700 text-start bottom-0">
              {data?.heading ?? headingFallback}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch justify-start max-w-[800px]">
            {features.map((feature, i) => (
              <div key={feature.id} data-feature-card className="pointer-events-auto h-full">
                <div className="feature-card flex h-full flex-col rounded-xl p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                    {ICONS[i % ICONS.length]}
                  </div>
                  <h3 data-feature-title className="mb-2 text-xl font-bold text-slate-700">{feature.title}</h3>
                  <p data-feature-description className="text-slate-700 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
