'use client'

import type { FeaturesSection as FeaturesData } from '@/types/strapi'
import type { CMSFeatureItem } from '@/lib/admin/content'
import { HEADING_SIZE_CLS, TEXT_SIZE_CLS } from '@/lib/admin/sizes'
// TEXT_SIZE_CLS used for item titleSize
import { useEffect, useRef, useState } from 'react'
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
  // Board with list — "Kinh nghiệm thực chiến"
  <svg xmlns="http://www.w3.org/2000/svg" key="3" className="h-14 w-14 text-[#30549B]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5.25h6M9.75 3h4.5A1.5 1.5 0 0 1 15.75 4.5v1.25h1.75A2.5 2.5 0 0 1 20 8.25v10.25a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5V8.25a2.5 2.5 0 0 1 2.5-2.5h1.75V4.5A1.5 1.5 0 0 1 9.75 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M11 10h5M8 14h.01M11 14h5M8 18h.01M11 18h5" />
  </svg>,
  // Bullseye with arrow — "Giải pháp phù hợp thực tiễn"
  <svg xmlns="http://www.w3.org/2000/svg" key="4" className="h-14 w-14 text-[#30549B]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <circle cx="11" cy="13" r="8" />
    <circle cx="11" cy="13" r="4.5" />
    <circle cx="11" cy="13" r="1" fill="currentColor" stroke="none" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m11 13 8-8m-3 0h3v3" />
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
  const [cmsItems, setCmsItems] = useState<CMSFeatureItem[] | null>(null)
  const [cmsHeading, setCmsHeading] = useState<string | null>(null)
  const [cmsHeadingSize, setCmsHeadingSize] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetch(`/api/admin/content?locale=${locale}`)
      .then((r) => r.json())
      .then((d: { features?: { heading?: string; headingSize?: string; items?: CMSFeatureItem[] } }) => {
        if (d.features?.items?.length) setCmsItems(d.features.items)
        if (d.features?.heading) setCmsHeading(d.features.heading)
        if (d.features?.headingSize) setCmsHeadingSize(d.features.headingSize)
      })
      .catch(() => {})
  }, [locale])

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
  const features = cmsItems ?? (data?.features?.length ? data.features : fallback)

  const headingFallback = locale === 'en'
    ? <><span>WHY CHOOSE</span> <span className="text-[#D62828]">GS-GROUP</span>?</>
    : <>VÌ SAO CHỌN <span className="text-[#D62828]">GS-GROUP</span>?</>

  return (
    <section ref={sectionRef} id="features" className="relative min-h-screen bg-[#EEF5FD]">
      <div className="pointer-events-none relative z-20 grid md:grid-cols-2 gap-6">
        <div className="hidden md:flex relative flex-col mr-5 justify-center items-center min-h-screen">
          <div className="w-full h-full flex justify-center items-center">
          </div>
        </div>
        <div className="relative flex flex-col px-5 md:px-0 mr-0 md:mr-5 justify-center max-w-[800px] min-h-screen py-14 md:py-24">
          <div data-feature-reveal className="text-start">
            <h1 className={`mb-12 font-extrabold leading-[1.1] tracking-[-0.01em] whitespace-nowrap text-[#263A59] text-start bottom-0 ${HEADING_SIZE_CLS[cmsHeadingSize ?? 'base'] ?? 'text-[clamp(22px,2vw,34px)] md:text-[clamp(32px,3vw,48px)]'}`}>
              {cmsHeading ?? data?.heading ?? headingFallback}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch justify-start max-w-[800px]">
            {features.map((feature, i) => (
              <div key={feature.id} data-feature-card className="pointer-events-auto h-full">
                <div className="feature-card flex h-full flex-col rounded-xl p-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg">
                    {(feature as CMSFeatureItem).icon?.trim().startsWith('<') ? (
                      <span
                        className="block h-14 w-14 text-[#30549B] [&_svg]:h-full [&_svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: (feature as CMSFeatureItem).icon! }}
                      />
                    ) : (feature as CMSFeatureItem).icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={(feature as CMSFeatureItem).icon} alt="" className="h-14 w-14 object-contain" />
                    ) : (
                      ICONS[i % ICONS.length]
                    )}
                  </div>
                  <h3 data-feature-title className={`mb-2 font-bold text-[#30549B] ${TEXT_SIZE_CLS[(feature as CMSFeatureItem).titleSize ?? 'xl'] ?? 'text-xl'}`}>{feature.title}</h3>
                  <p data-feature-description className="text-[#30549B] leading-relaxed" dangerouslySetInnerHTML={{ __html: feature.description }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
