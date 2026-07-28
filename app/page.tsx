import lazy from 'next/dynamic'
import { SiteFooter } from '@/components/layout/Footer'
import { HeroSection } from '@/components/sections/HeroSection'
import { SectionScrollRail } from '@/components/layout/SectionScrollRail'
import { getContent } from '@/lib/admin/content'

export const dynamic = 'force-dynamic'

const CoreValueSection = lazy(() =>
  import('@/components/sections/CoreValueSection').then((m) => ({ default: m.CoreValueSection })),
)
const SolutionSection = lazy(() => import('@/components/sections/SolutionSection'))
const ProjectSection = lazy(() => import('@/components/sections/ProjectSection'))
const PartnerSection = lazy(() =>
  import('@/components/sections/PartnerSection').then((m) => ({ default: m.PartnerSection })),
)

export default async function Home() {
  const content = getContent()

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
        <HeroSection data={heroData as any} />
        <CoreValueSection data={coreValuesData} />
        <SolutionSection data={content.solutions} />
        <ProjectSection data={content.projects} />
        <PartnerSection data={content.partners} />
      </main>
      <SiteFooter />
    </>
  )
}
