'use client'

import type { FeaturesSection as FeaturesData } from '@/types/strapi'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from '@/lib/gsap'

interface FeaturesSectionProps {
  data?: FeaturesData
}

const ICONS = [
  // Stacked cubes — "Am hiểu hệ thống trọng yếu"
  <svg xmlns="http://www.w3.org/2000/svg" key="1" className="h-14 w-14 text-[#30549B]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>,
  // CPU chip — "Làm chủ công nghệ"
  <svg xmlns="http://www.w3.org/2000/svg" key="2" className="h-14 w-14 text-[#30549B]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
  </svg>,
  // Wrench-screwdriver — "Kinh nghiệm triển khai"
  <svg xmlns="http://www.w3.org/2000/svg" key="3" className="h-14 w-14 text-[#30549B]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
  </svg>,
  // Check-badge — "Giải pháp phù hợp thực tiễn"
  <svg xmlns="http://www.w3.org/2000/svg" key="4" className="h-14 w-14 text-[#30549B]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
  </svg>,
]

const FALLBACK_FEATURES_VI = [
  { id: 1, title: 'Am hiểu hệ thống trọng yếu', description: 'Hiểu sâu đặc thù vận hành và yêu cầu kỹ thuật của các hệ thống đòi hỏi tiêu chuẩn cao về an toàn, bảo mật và độ tin cậy.' },
  { id: 2, title: 'Làm chủ công nghệ', description: 'Tiếp cận, đánh giá và triển khai các giải pháp công nghệ phù hợp với yêu cầu kỹ thuật và mục tiêu của từng dự án.' },
  { id: 3, title: 'Kinh nghiệm thực chiến', description: 'Được kiểm chứng qua nhiều dự án quy mô lớn cho các cơ quan, tổ chức và doanh nghiệp trong những lĩnh vực trọng yếu.' },
  { id: 4, title: 'Giải pháp phù hợp thực tiễn', description: 'Đề xuất và triển khai các giải pháp phù hợp với nhu cầu thực tế, bảo đảm hiệu quả đầu tư và khả năng phát triển lâu dài.' },
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
    ? <><span>WHY CHOOSE</span> <p><span className="text-[#D62828]">GS-GROUP</span>?</p></>
    : <>VÌ SAO CHỌN <p><span className="text-[#D62828]">GS-GROUP</span>?</p></>

  return (
    <section ref={sectionRef} id="features" className="relative min-h-screen bg-[#EEF5FD]">
      <div className="pointer-events-none relative z-20 grid md:grid-cols-2 gap-6">
        <div className="hidden md:flex relative flex-col mr-5 justify-center items-center min-h-screen">
          <div className="w-full h-full flex justify-center items-center">
          </div>
        </div>
        <div className="relative flex flex-col px-5 md:px-0 mr-0 md:mr-5 justify-center max-w-[800px] min-h-screen py-14 md:py-24">
          <div data-feature-reveal className="text-start">
            <h1 className="mb-4 text-[clamp(22px,2vw,34px)] font-extrabold leading-[1.1] tracking-[-0.01em] whitespace-nowrap text-[#263A59] text-start bottom-0 md:text-[clamp(32px,3vw,48px)]">
              {data?.heading ?? headingFallback}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch justify-start max-w-[800px]">
            {features.map((feature, i) => (
              <div key={feature.id} data-feature-card className="pointer-events-auto h-full">
                <div className="feature-card flex h-full flex-col rounded-xl p-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg">
                    {ICONS[i % ICONS.length]}
                  </div>
                  <h3 data-feature-title className="mb-2 text-xl font-bold text-[#30549B]">{feature.title}</h3>
                  <p data-feature-description className="text-[#30549B] leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
