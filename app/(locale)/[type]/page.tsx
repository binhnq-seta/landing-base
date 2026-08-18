import type { Metadata } from 'next'
import lazy from 'next/dynamic'
import { SiteFooter } from '@/components/layout/Footer'
import { HeroSection } from '@/components/sections/HeroSection'
import { SectionScrollRail } from '@/components/layout/SectionScrollRail'
import { getContent } from '@/lib/admin/content'
import type { SupportedLocale } from '@/lib/admin/content'
import { createPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type: locale } = await params
  if (locale === 'en') {
    return createPageMetadata({
      locale: 'en',
      title: 'General Systems | Technology Solutions',
      description: 'General Systems provides comprehensive technology solutions to help enterprises optimise performance in the digital era.',
      path: '/en',
      alternatePaths: { vi: '/vi', en: '/en', 'x-default': '/vi' },
    })
  }
  return createPageMetadata({
    locale: 'vi',
    title: 'General Systems | Giải Pháp Công Nghệ',
    description: 'General Systems cung cấp các giải pháp công nghệ toàn diện, giúp doanh nghiệp tối ưu hiệu quả trong kỷ nguyên số.',
    path: '/vi',
    alternatePaths: { vi: '/vi', en: '/en', 'x-default': '/vi' },
  })
}

const CoreValueSection = lazy(() =>
  import('@/components/sections/CoreValueSection').then((m) => ({ default: m.CoreValueSection })),
)
const SolutionSection = lazy(() => import('@/components/sections/SolutionSection'))
const ProjectSection = lazy(() => import('@/components/sections/ProjectSection'))
const PartnerSection = lazy(() =>
  import('@/components/sections/PartnerSection').then((m) => ({ default: m.PartnerSection })),
)

// Param is named [type] to share the same dynamic-segment name as app/[type]/[slug].
// At runtime the value is a locale code ('vi' | 'en').
export default async function Home({ params }: { params: Promise<{ type: string }> }) {
  const { type: locale } = await params
  const content = getContent(locale as SupportedLocale)

  const heroData = {
    id: 0,
    heading: content.hero.heading,
    description: content.hero.description,
    cta: { id: 0, label: content.hero.ctaLabel, href: content.hero.ctaHref },
  }

  const coreValuesData = {
    heading: content.coreValues.heading,
    features: content.coreValues.items,
  }

  return (
    <>
      <SectionScrollRail />
      <main className="pt-0">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HeroSection data={heroData as any} showcaseCorners={content.showcaseCorners} heroStats={content.hero.stats} />
        <CoreValueSection data={coreValuesData} />
        <SolutionSection data={content.solutions} title={content.sectionLabels.solutions} />
        <ProjectSection data={content.projects} title={content.sectionLabels.projects} viewMoreLabel={content.sectionLabels.viewMore} />
        <PartnerSection data={content.partners} heading={content.sectionLabels.partners} description={content.partnerDescription} />
      </main>
      <SiteFooter locale={locale as SupportedLocale} />
    </>
  )
}
