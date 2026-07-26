import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { DetailScrollAnimations } from '@/components/detail/DetailScrollAnimations'
import { DetailSpline } from '@/components/detail/DetailSpline'
import { SiteFooter } from '@/components/layout/Footer'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { detailPages, getDetailPage } from '@/lib/detail-pages'

type DetailPageProps = {
  params: Promise<{ type: string; slug: string }>
}

export function generateStaticParams() {
  return detailPages.map(({ type, slug }) => ({ type, slug }))
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { type, slug } = await params
  const page = getDetailPage(type, slug)

  if (!page) return {}

  return {
    title: `${page.title} | General Systems`,
    description: page.summary,
  }
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { type, slug } = await params
  const page = getDetailPage(type, slug)

  if (!page) notFound()

  return (
    <>
      <SiteHeader overlay />
      <main className="relative overflow-hidden bg-[#f8fafc] text-slate-900">
        <div
          className="pointer-events-none absolute left-[-40vw] top-[40vh] z-0 h-screen w-screen"
          aria-hidden="true"
        >
          <DetailSpline sceneUrl="/model/circle.splinecode" />
        </div>
        <article data-detail-page className="relative z-10">
          <DetailScrollAnimations />
          <div className="flex flex-cols-2 min-h-screen items-center">
            <header className="relative isolate mx-auto w-full max-w-[1600px] px-5 pb-16 pt-16 md:px-12 md:pb-24 md:pt-24 lg:px-40">
              <h1 data-detail-reveal data-detail-hero className="relative max-w-3xl -translate-y-20 text-[clamp(1rem,3.5vw,5rem)] font-semibold text-[#00162F]">
                {page.title}
              </h1>
            </header>
            <div className="mx-auto w-full max-w-[1800px] px-5 md:px-12 lg:px-20">
              <div className="relative pb-28 md:pb-0">
                <div data-detail-reveal data-detail-hero className="relative aspect-[1/1] min-h-[360px] overflow-hidden rounded-[1.5rem] bg-slate-200 md:rounded-[2.5rem]">
                  <Image
                    src={page.heroImage}
                    alt={page.heroImageAlt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 90vw"
                    className="object-cover grayscale"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-gray-200/25 to-blue-700/80" />
                </div>
                <div data-detail-reveal data-detail-hero data-detail-delay="0.1" className="absolute right-0 top-0 z-10 rounded-bl-[2rem] bg-[#f8fafc] pb-3 pl-3 before:absolute before:-left-6 before:top-0 before:h-6 before:w-6 before:rounded-tr-[1.5rem] before:shadow-[8px_-8px_0_8px_#f8fafc] after:absolute after:-bottom-6 after:right-0 after:h-6 after:w-6 after:bg-[radial-gradient(circle_at_bottom_left,transparent_0,transparent_1.5rem,#f8fafc_1.55rem)] md:pb-4 md:pl-4">
                  <div className="relative grid size-20 place-items-center rounded-2xl bg-[#EEF4FE] text-[#00162F] shadow-[0_12px_32px_rgba(15,23,42,0.14)] md:size-28 md:rounded-3xl">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                      className="size-6 md:size-8"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5.64 5.64l12.72 12.72M18.36 5.64 5.64 18.36" />
                    </svg>
                  </div>
                </div>
                <p data-detail-reveal data-detail-hero data-detail-delay="0.18" className="absolute bottom-0 left-1/2 z-10 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-slate-200/80 bg-white/95 px-6 py-5 text-base font-light leading-7 text-slate-600 shadow-[0_16px_40px_rgba(15,23,42,0.14)] backdrop-blur-sm md:bottom-auto md:left-0 md:top-[60%] md:w-full md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:px-8 md:py-7 md:text-lg md:leading-8">
                  {page.summary}
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1600px] space-y-24 px-5 py-24 md:space-y-36 md:px-12 md:py-36 lg:px-20">
            {page.sections.map((section, index) => (
              <section
                key={section.title}
                className="grid items-center gap-10 md:grid-cols-2 md:gap-16 lg:gap-24"
              >
                <div data-detail-reveal className={`relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-200 md:rounded-[2rem] ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <Image
                    src={section.image}
                    alt={section.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                </div>

                <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                  <h2 data-detail-reveal data-detail-delay="0.08" className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#00162F] sm:text-4xl lg:text-5xl">
                    {section.title}
                  </h2>
                  <p data-detail-reveal data-detail-delay="0.16" className="mt-6 max-w-xl text-base font-light leading-8 text-slate-600 md:text-lg">
                    {section.description}
                  </p>
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
