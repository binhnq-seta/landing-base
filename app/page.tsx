import { SiteFooter } from '@/components/layout/Footer'
import { HeroSection } from '@/components/sections/HeroSection'
import { CTASection } from '@/components/sections/CTASection'
import { CoreValueSection } from '@/components/sections/CoreValueSection'
import SolutionSection from '@/components/sections/SolutionSection'
import ProjectSection from '@/components/sections/ProjectSection'
import { SectionScrollRail } from '@/components/layout/SectionScrollRail'

// Uncomment when Strapi is running:
// import { getSingle } from '@/lib/strapi/client'
// import type { LandingPage } from '@/types/strapi'

export default async function Home() {
  // const page = await getSingle<LandingPage>('landing-page', {
  //   populate: {
  //     hero: { populate: ['cta', 'backgroundImage'] },
  //     features: { populate: ['features'] },
  //     seo: true,
  //   },
  // })

  return (
    <>
      <SectionScrollRail />
      <main className="pt-0">
        <HeroSection />
        <CoreValueSection />
        <SolutionSection />
        <ProjectSection />
        <CTASection />
      </main>
      <SiteFooter />
    </>
  )
}
