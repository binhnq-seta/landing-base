import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { DetailScrollAnimations } from '@/components/detail/DetailScrollAnimations'
import { DetailSpline } from '@/components/detail/DetailSpline'
import { SiteFooter } from '@/components/layout/Footer'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { detailPages, getDetailPage } from '@/lib/detail-pages'
import { getContent } from '@/lib/admin/content'
import type { CMSDetailSection, CMSDetailPage, SupportedLocale } from '@/lib/admin/content'
import type { CSSProperties } from 'react'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

type DetailPageProps = {
  params: Promise<{ type: string; slug: string }>
}

export function generateStaticParams() {
  return detailPages.map(({ type, slug }) => ({ type, slug }))
}

async function detectLocale(): Promise<SupportedLocale> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('locale')?.value
  return raw === 'en' ? 'en' : 'vi'
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { type, slug } = await params
  const locale = await detectLocale()
  const content = getContent(locale)
  const cmsPage = content.detailPages?.find((p) => p.type === type && p.slug === slug)
  const page = cmsPage ?? getDetailPage(type, slug)
  if (!page) return {}
  return {
    title: `${stripHtml(page.title)} | General Systems`,
    description: stripHtml(page.summary),
  }
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SectionButton({ href, locale, variant = 'dark' }: { href?: string; locale: SupportedLocale; variant?: 'dark' | 'light' }) {
  if (!href) return null
  const label = locale === 'en' ? 'See more' : 'Xem thêm'
  // Ensure absolute path from root regardless of how it was stored
  const safeHref = href.startsWith('/') || href.startsWith('http') ? href : `/${href}`
  return (
    <Link
      href={safeHref}
      className={`group mt-8 inline-flex items-center gap-3 rounded-full border-2 px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
        variant === 'light'
          ? 'border-white text-white hover:bg-white hover:text-[#00162F]'
          : 'border-[#00162F] text-[#00162F] hover:bg-[#00162F] hover:text-white'
      }`}
    >
      {label}
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
        <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
      </svg>
    </Link>
  )
}

function imgAspect(style?: string) {
  if (style === 'portrait') return 'aspect-[3/4]'
  if (style === 'wide') return 'aspect-[16/9]'
  return 'aspect-[4/3]'
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function toRichHtml(content: string) {
  const trimmed = content.trim()
  if (!trimmed) return ''

  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(content)
  if (hasHtmlTag) return content

  return content
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br/>')}</p>`)
    .join('')
}

const SECTION_TITLE_SIZE_CLS: Record<string, string> = {
  xs:   'text-lg sm:text-xl',
  sm:   'text-xl sm:text-2xl',
  base: 'text-2xl',
  lg:   'text-2xl sm:text-3xl',
  xl:   'text-3xl sm:text-4xl',
  '2xl':'text-3xl sm:text-4xl',
  '3xl':'text-4xl sm:text-5xl',
  '4xl':'text-5xl sm:text-6xl',
}

// ─── Content sections (always alternating split) ───────────────────────────────

function ContentSections({ sections, locale }: { sections: CMSDetailSection[]; locale: SupportedLocale }) {
  if (sections.length === 0) return null
  let contentIndex = -1
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-12 px-5 py-12 md:space-y-20 md:px-12 md:py-20 lg:px-16">
      {sections.map((section, i) => {
        const sectionKind = section.kind ?? 'content'
        if (sectionKind === 'heading') {
          return (
            <section key={section.title + i} className={`rounded-[1.5rem] px-5 py-4 md:px-10 md:py-6 ${section.titleAlign === 'left' ? 'text-left' : section.titleAlign === 'right' ? 'text-right' : 'text-center'}`}>
              <h2
                data-detail-reveal
                className={`mx-auto max-w-4xl font-extrabold uppercase leading-[1.1] tracking-[-0.01em] ${section.titleSize ? SECTION_TITLE_SIZE_CLS[section.titleSize] : 'text-[clamp(2rem,2.5vw,3rem)]'}`}
                style={{ color: section.titleColor ?? '#00162F' }}
                dangerouslySetInnerHTML={{ __html: section.title }}
              />
              {section.description && (
                <div data-detail-reveal data-detail-delay="0.1" className="mx-auto mt-2 max-w-2xl text-lg font-semibold text-slate-500 md:text-xl [&_p]:mb-1" dangerouslySetInnerHTML={{ __html: section.description }} />
              )}
            </section>
          )
        }

        if (sectionKind === 'casestudies') {
          const points = section.points ?? []
          return (
            <section key={section.title + i} className="space-y-6">
              {section.title && (
                <h2
                  data-detail-reveal
                  className={`max-w-4xl font-extrabold uppercase leading-[1.1] tracking-[-0.01em] ${section.titleSize ? SECTION_TITLE_SIZE_CLS[section.titleSize] : 'text-[clamp(2rem,2.5vw,3rem)]'} ${section.titleAlign === 'center' ? 'text-center' : section.titleAlign === 'right' ? 'text-right' : ''}`}
                  style={{ color: section.titleColor ?? '#00162F' }}
                  dangerouslySetInnerHTML={{ __html: section.title }}
                />
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {points.map((point, idx) => {
                  const href = point.href
                  const inner = (
                    <div
                      data-detail-reveal
                      data-detail-delay={`${idx * 0.08}`}
                      className={`group relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-2xl border border-blue-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl ${href ? 'cursor-pointer' : ''}`}
                    >
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">Case Study</p>
                        <h3 className="text-lg font-bold leading-snug text-[#00162F]">{point.title}</h3>
                        {point.description && (
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">{point.description}</p>
                        )}
                      </div>
                      {href && (
                        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors group-hover:text-blue-800">
                          Xem chi tiết
                          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true">
                            <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )
                  return href
                    ? <Link key={idx} href={href} className="block h-full">{inner}</Link>
                    : <div key={idx} className="h-full">{inner}</div>
                })}
              </div>
            </section>
          )
        }

        if (sectionKind === 'image-points') {
          const points = section.points ?? []
          const style = section.imageStyle ?? 'cover'

          // ── Background overlay variant ────────────────────────────────────
          if (style === 'background') {
            return (
              <section key={section.title + i} className="relative overflow-hidden rounded-[1.5rem]">
                {section.image && (
                  <>
                    <Image
                      src={section.image}
                      alt={section.imageAlt || ''}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0" style={{ background: `rgba(0,22,47,${((section.backgroundOpacity ?? 82) / 100).toFixed(2)})` }} />
                  </>
                )}
                <div className="relative z-10 px-8 py-14 md:px-16 md:py-20">
                  {(section.title || section.description) && (
                    <div data-detail-reveal className="mb-10 text-center">
                      {section.title && (
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/50 [&_*]:text-white/50" dangerouslySetInnerHTML={{ __html: section.title }} />
                      )}
                      {section.description && (
                        <h2 className="text-[clamp(2rem,2.5vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.01em] text-white [&_*]:text-white [&_p]:mb-1" dangerouslySetInnerHTML={{ __html: section.description }} />
                      )}
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {points.map((point, idx) => (
                      <article
                        key={point.title + idx}
                        data-detail-reveal
                        data-detail-delay={`${idx * 0.08}`}
                        className="rounded-xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
                      >
                        <h3 className="mb-2 font-bold text-white [&_*]:text-white" dangerouslySetInnerHTML={{ __html: point.title }} />
                        <div className="text-sm leading-relaxed text-white/65 [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4" dangerouslySetInnerHTML={{ __html: point.description }} />
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )
          }

          // ── Default side-by-side variant ──────────────────────────────────
          const imgRight = section.imagePosition !== 'left'
          return (
            <section key={section.title + i}>
              <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10 lg:gap-12">
                <div className={`space-y-6 ${imgRight ? 'order-2 md:order-1' : 'order-2 md:order-2'}`}>
                  {section.title && (
                    <h2
                      data-detail-reveal
                      className={`font-extrabold uppercase leading-[1.1] tracking-[-0.01em] ${section.titleSize ? SECTION_TITLE_SIZE_CLS[section.titleSize] : 'text-[clamp(2rem,2.5vw,3rem)]'} ${section.titleAlign === 'center' ? 'text-center' : section.titleAlign === 'right' ? 'text-right' : ''}`}
                      style={{ color: section.titleColor ?? '#00162F' }}
                      dangerouslySetInnerHTML={{ __html: section.title }}
                    />
                  )}
                  <div>
                    {points.map((point, pointIndex) => (
                      <article
                        key={point.title + pointIndex}
                        data-detail-reveal
                        data-detail-reveal-early
                        className="group grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 py-5 md:grid-cols-[3.5rem_minmax(0,1fr)] md:gap-4 md:py-6"
                      >
                        <span className="pt-0.5 text-sm font-bold tabular-nums text-[#A31F1A] transition-colors group-hover:text-[#7f1713] md:text-base">
                          {String(pointIndex + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h3
                            className="text-lg font-bold leading-snug text-[#00162F] transition-colors group-hover:text-[#A31F1A] md:text-xl"
                            dangerouslySetInnerHTML={{ __html: point.title }}
                          />
                          {point.description && (
                            <div
                              className="mt-2 font-light leading-relaxed text-slate-600 [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                              dangerouslySetInnerHTML={{ __html: point.description }}
                            />
                          )}
                        </div>
                      </article>
                    ))}
                    {points.length === 0 && (
                      <p className="text-sm text-slate-400">Chưa có dữ liệu text/desc cho khối này.</p>
                    )}
                  </div>
                </div>

                <div className={`${imgRight ? 'order-1 md:order-2' : 'order-1 md:order-1'} md:sticky md:top-28`}>
                  <div
                    data-detail-reveal
                    className="relative mx-auto w-full max-w-[34rem] aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-slate-200"
                  >
                    {section.image && (
                      <Image
                        src={section.image}
                        alt={section.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 420px"
                        className="object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>
          )
        }

        contentIndex += 1
        const pos = section.imagePosition ?? 'auto'
        const imgRight = pos === 'right' || (pos === 'auto' && contentIndex % 2 === 1)
        const style = section.imageStyle ?? 'cover'

        if (style === 'background') {
          return (
            <section key={section.title + i} className="relative overflow-hidden rounded-[1.5rem]">
              {section.image && (
                <>
                  <Image src={section.image} alt={section.imageAlt} fill sizes="100vw" className="object-cover" aria-hidden="true" />
                  <div className="absolute inset-0 bg-[#00162F]/82" />
                </>
              )}
              <div className="relative z-10 px-8 py-14 md:px-16 md:py-20">
                <h2
                  data-detail-reveal
                  className={`max-w-3xl font-extrabold leading-[1.1] tracking-[-0.01em] ${section.titleSize ? SECTION_TITLE_SIZE_CLS[section.titleSize] : 'text-[clamp(2rem,2.5vw,3rem)]'} ${section.titleAlign === 'center' ? 'text-center' : section.titleAlign === 'right' ? 'text-right' : ''}`}
                  style={{ color: section.titleColor ?? '#ffffff' }}
                  dangerouslySetInnerHTML={{ __html: section.title }}
                />
                <div
                  data-detail-reveal
                  data-detail-delay="0.1"
                  className="mt-4 max-w-2xl text-base font-light leading-8 text-white/80 [&_p]:mb-3 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1"
                  dangerouslySetInnerHTML={{ __html: toRichHtml(section.description) }}
                />
                <SectionButton href={section.buttonHref} locale={locale} variant="light" />
              </div>
            </section>
          )
        }

        return (
          <section key={section.title + i} className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
            <div
              data-detail-reveal
              className={`relative overflow-hidden rounded-[1.5rem] bg-slate-200 md:rounded-[2rem] ${imgAspect(style)} ${style === 'contain' ? 'object-contain bg-slate-100' : ''} ${imgRight ? 'md:order-2' : ''}`}
            >
              {section.image && (
                <Image
                  src={section.image}
                  alt={section.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`transition-transform duration-700 hover:scale-[1.03] ${style === 'contain' ? 'object-contain' : 'object-cover'}`}
                />
              )}
            </div>
            <div className={imgRight ? 'md:order-1' : ''}>
              {/^[A-Z]+\.[A-Z]/.test(stripHtml(section.title)) && (
                <p data-detail-reveal className="mb-3 text-xs font-bold uppercase tracking-widest text-[#A31F1A]">
                  Giải pháp
                </p>
              )}
              <h2
                data-detail-reveal
                data-detail-delay="0.08"
                className={`max-w-xl font-extrabold leading-[1.1] tracking-[-0.01em] ${section.titleSize ? SECTION_TITLE_SIZE_CLS[section.titleSize] : 'text-[clamp(2rem,2.5vw,3rem)]'} ${section.titleAlign === 'center' ? 'text-center' : section.titleAlign === 'right' ? 'text-right' : ''}`}
                style={{ color: section.titleColor ?? '#00162F' }}
                dangerouslySetInnerHTML={{ __html: section.title }}
              />
              <div
                data-detail-reveal
                data-detail-delay="0.16"
                className="mt-4 max-w-xl text-base font-light leading-8 text-slate-600 md:text-lg [&_a]:text-blue-600 [&_a]:underline [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:mb-3 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1"
                dangerouslySetInnerHTML={{ __html: toRichHtml(section.description) }}
              />
              <SectionButton href={section.buttonHref} locale={locale} />
            </div>
          </section>
        )
      })}
    </div>
  )
}

const RELATED_PAGE_TEXT = {
  vi: {
    heading: 'Khám phá thêm',
    contact: 'Bạn đang tìm giải pháp?',
    button: 'Liên hệ chuyên gia',
  },
  en: {
    heading: 'Explore more',
    contact: 'Looking for a solution?',
    button: 'Contact an expert',
  },
} satisfies Record<SupportedLocale, { heading: string; contact: string; button: string }>

function RelatedPages({
  pages,
  locale,
}: {
  pages: CMSDetailPage[]
  locale: SupportedLocale
}) {
  if (pages.length === 0) return null

  const copy = RELATED_PAGE_TEXT[locale]

  return (
    <section className="bg-white px-5 py-12 text-[#00162F] md:px-12 md:py-16 lg:px-16">
      <div className="mx-auto max-w-[1120px]">
        <h2 data-detail-reveal className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
          {copy.heading}
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {pages.map((item, index) => (
            <Link
              key={`${item.type}-${item.slug}`}
              href={`/${item.type}/${item.slug}`}
              data-detail-reveal
              data-detail-delay={`${index * 0.08}`}
              className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-800">
                <Image
                  src={item.heroImage}
                  alt={item.heroImageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00162F]/60 to-transparent" />
              </div>
              <div className="flex items-end justify-between gap-4 p-4 md:p-5">
                <h3 className="text-lg font-medium leading-snug">{stripHtml(item.title)}</h3>
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div data-detail-reveal className="mt-10 flex flex-wrap items-center justify-start gap-6 border-t border-slate-200 pt-10 text-left">
          <p className="text-2xl font-medium md:text-3xl">{copy.contact}</p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex min-h-14 w-fit items-center justify-center rounded-full bg-[#A31F1A] px-10 py-4 text-base font-semibold text-white shadow-lg shadow-[#A31F1A]/20 transition-all hover:scale-105 hover:bg-[#c12a24]"
          >
            {copy.button}
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Page-level layout heroes ─────────────────────────────────────────────────

type PageHeroProps = { page: CMSDetailPage }

/** Two-column: title left, large image right with floating summary card */
function HeroHeadline({ page }: PageHeroProps) {
  const headerPaddingTop = page.headlineTextMarginTop != null
    ? `${page.headlineTextMarginTop}vh`
    : '12.5vh'
  return (
    <div className="grid min-h-screen items-center md:grid-cols-2">
      <header className="self-start px-5 pb-8 md:px-20 md:pb-20 lg:px-16" style={{ paddingTop: headerPaddingTop }}>
        {page.eyebrow && (
          <p data-detail-reveal data-detail-hero className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A31F1A]" style={{ color: page.eyebrowColor ?? undefined }} dangerouslySetInnerHTML={{ __html: page.eyebrow }} />
        )}
        <h1 data-detail-reveal data-detail-hero className="text-[clamp(2.25rem,4vw,4.5rem)] font-extrabold leading-[1.1] tracking-[-0.01em] text-[#00162F]" style={{ color: page.titleColor ?? undefined }} dangerouslySetInnerHTML={{ __html: page.title }} />
        <div data-detail-reveal data-detail-hero data-detail-delay="0.1" className="mt-6 max-w-lg text-base font-light leading-8 text-slate-600 md:text-lg [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4" style={{ color: page.summaryColor ?? undefined }} dangerouslySetInnerHTML={{ __html: page.summary }} />
      </header>
      <div className="relative self-stretch px-5 pb-12 pt-20 md:px-8 md:pb-12">
        <div data-detail-reveal data-detail-hero className="relative h-full min-h-[420px] overflow-hidden rounded-[1.5rem] bg-slate-200 md:min-h-[580px] md:rounded-[2rem]">
          <Image
            src={page.heroImage}
            alt={page.heroImageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[35%]" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.05) 100%)' }} />
        </div>
      </div>
    </div>
  )
}

/** Full-width image on top, title + summary centered below */
function HeroMagazine({ page }: PageHeroProps) {
  return (
    <div className="pt-20">
      <div className="relative left-1/2 h-[42vh] min-h-[280px] max-h-[640px] w-screen max-w-none -translate-x-1/2 overflow-hidden bg-slate-200 md:h-[58vh]">
        <Image
          src={page.heroImage}
          alt={page.heroImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[35%]" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.05) 100%)' }} />
      </div>
      <div className="mx-auto max-w-[1400px] px-5 pb-8 pt-10 md:px-12 md:pb-12 md:pt-14 lg:px-16">
        <div className="grid md:grid-cols-[1fr_2fr] md:gap-16 items-start">
          <div>
            {page.eyebrow && (
              <p data-detail-reveal data-detail-hero className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#A31F1A]" style={{ color: page.eyebrowColor ?? undefined }} dangerouslySetInnerHTML={{ __html: page.eyebrow }} />
            )}
            <h1 data-detail-reveal data-detail-hero className="text-[clamp(2.25rem,4vw,4.5rem)] font-extrabold leading-[1.1] tracking-[-0.01em] text-[#00162F]" style={{ color: page.titleColor ?? undefined }} dangerouslySetInnerHTML={{ __html: page.title }} />
          </div>
          <div data-detail-reveal data-detail-hero data-detail-delay="0.1" className="mt-4 text-base font-light leading-8 text-slate-500 md:mt-1 md:text-lg md:pt-2 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4" style={{ color: page.summaryColor ?? undefined }} dangerouslySetInnerHTML={{ __html: page.summary }} />
        </div>
      </div>
    </div>
  )
}

/** Full-bleed image with title + summary overlaid at bottom */
function HeroImmersive({ page }: PageHeroProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900">
      <Image
        src={page.heroImage}
        alt={page.heroImageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[40%]" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.90) 0%, rgba(15,23,42,0.05) 100%)' }} />
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-14 md:px-12 md:pb-20 lg:px-16">
        <div className="mx-auto max-w-[1400px]">
          {page.eyebrow && (
            <p data-detail-reveal data-detail-hero className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/70" style={{ color: page.eyebrowColor ?? undefined }} dangerouslySetInnerHTML={{ __html: page.eyebrow }} />
          )}
          <h1 data-detail-reveal data-detail-hero className="max-w-3xl text-[clamp(2.25rem,4vw,4.5rem)] font-extrabold leading-[1.1] tracking-[-0.01em] text-white" style={{ color: page.titleColor ?? undefined }} dangerouslySetInnerHTML={{ __html: page.title }} />
          <div data-detail-reveal data-detail-hero data-detail-delay="0.12" className="mt-5 max-w-xl text-base font-light leading-8 text-white/75 md:text-lg [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4" style={{ color: page.summaryColor ?? undefined }} dangerouslySetInnerHTML={{ __html: page.summary }} />
        </div>
      </div>
    </div>
  )
}

/** Centered intro text, then full-width image below */
function HeroEditorial({ page }: PageHeroProps) {
  return (
    <div className="pt-32 pb-0 md:pt-40">
      <div className="mx-auto max-w-[1400px] px-5 md:px-12 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          {page.eyebrow && (
            <p data-detail-reveal data-detail-hero className="mb-5 text-sm font-semibold uppercase tracking-widest text-[#A31F1A]" style={{ color: page.eyebrowColor ?? undefined }} dangerouslySetInnerHTML={{ __html: page.eyebrow }} />
          )}
          <h1 data-detail-reveal data-detail-hero className="text-[clamp(2.25rem,4vw,4.5rem)] font-extrabold leading-[1.1] tracking-[-0.01em] text-[#00162F]" style={{ color: page.titleColor ?? undefined }} dangerouslySetInnerHTML={{ __html: page.title }} />
          <div data-detail-reveal data-detail-hero data-detail-delay="0.1" className="mx-auto mt-6 max-w-2xl text-base font-light leading-8 text-slate-600 md:text-lg [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4" style={{ color: page.summaryColor ?? undefined }} dangerouslySetInnerHTML={{ __html: page.summary }} />
        </div>
      </div>
      <div data-detail-reveal data-detail-hero data-detail-delay="0.18" className="mx-auto mt-10 max-w-[1600px] px-5 md:px-8">
        <div className="relative aspect-[21/9] min-h-[260px] overflow-hidden rounded-[1.5rem] bg-slate-200 md:rounded-[2rem]">
          <Image
            src={page.heroImage}
            alt={page.heroImageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 95vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[35%]" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.05) 100%)' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function DetailPage({ params }: DetailPageProps) {
  const { type, slug } = await params
  const locale = await detectLocale()

  const content = getContent(locale)
  const cmsPage = content.detailPages?.find((p) => p.type === type && p.slug === slug)

  let page: CMSDetailPage

  if (cmsPage) {
    page = cmsPage
  } else {
    const fallback = getDetailPage(type, slug)
    if (!fallback) notFound()
    page = {
      ...fallback,
      layout: 'headline',
      sections: fallback.sections.map((s) => ({
        ...s,
        imagePosition: 'auto' as const,
        imageStyle: 'cover' as const,
      })),
    }
  }

  const layout = page.layout ?? 'headline'
  const relatedPages = content.detailPages
    .filter((item) => item.type === type && item.slug !== slug)
    .slice(0, 3)

  return (
    <>
      <SiteHeader overlay dark={layout === 'immersive'} locale={locale} />
      <main className="relative overflow-hidden text-slate-900">
        <div
          className="pointer-events-none absolute left-[-40vw] top-[40vh] z-0 h-screen w-screen"
          aria-hidden="true"
        >
          <DetailSpline sceneUrl="/model/circle.splinecode" />
        </div>
        <article data-detail-page className="relative z-10">
          <DetailScrollAnimations />

          {layout === 'headline'   && <HeroHeadline  page={page} />}
          {layout === 'magazine'   && <HeroMagazine  page={page} />}
          {layout === 'immersive'  && <HeroImmersive page={page} />}
          {layout === 'editorial'  && <HeroEditorial page={page} />}

          <ContentSections sections={page.sections} locale={locale} />
          <RelatedPages pages={relatedPages} locale={locale} />
        </article>
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
