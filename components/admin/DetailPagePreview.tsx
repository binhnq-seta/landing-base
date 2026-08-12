'use client'

import type { CMSDetailPage, CMSDetailSection, SupportedLocale } from '@/lib/admin/content'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return src ? (
    <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className ?? 'object-cover'}`} />
  ) : null
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-xs text-slate-300">
      {label}
    </div>
  )
}

function SectionButton({ href, locale, variant = 'dark' }: { href?: string; locale: SupportedLocale; variant?: 'dark' | 'light' }) {
  if (!href) return null
  const label = locale === 'en' ? 'See more' : 'Xem thêm'
  return (
    <span className={`mt-7 inline-flex items-center gap-2.5 rounded-full border-2 px-5 py-2 text-xs font-semibold ${
      variant === 'light'
        ? 'border-white text-white'
        : 'border-[#00162F] text-[#00162F]'
    }`}>
      {label}
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
        <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
      </svg>
    </span>
  )
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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

// ─── Section content (same in all layouts) ────────────────────────────────────

const TITLE_SIZE_CLS: Record<string, string> = {
  xs:   'text-sm sm:text-base',
  sm:   'text-base sm:text-lg',
  base: 'text-lg sm:text-xl',
  lg:   'text-xl sm:text-2xl',
  xl:   'text-2xl sm:text-3xl',
  '2xl':'text-3xl sm:text-4xl',
  '3xl':'text-4xl sm:text-5xl',
  '4xl':'text-5xl sm:text-6xl',
}

const RICH_TEXT_CLS =
  'mt-4 text-base font-light leading-7 text-slate-600 ' +
  '[&_a]:text-blue-600 [&_a]:underline ' +
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 ' +
  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 ' +
  '[&_li]:leading-7 [&_li]:mt-1 ' +
  '[&_p]:mb-3 [&_strong]:font-semibold'

function PreviewSections({ sections, locale }: { sections: CMSDetailSection[]; locale: SupportedLocale }) {
  if (sections.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-slate-300">Chưa có mục nội dung nào.</p>
    )
  }
  let contentIndex = -1
  return (
    <div className="space-y-12 md:space-y-20">
      {sections.map((section, i) => {
        const sectionKind = section.kind ?? 'content'
        const titleSizeCls = section.titleSize ? TITLE_SIZE_CLS[section.titleSize] : undefined
        const alignCls = section.titleAlign === 'center' ? 'text-center' : section.titleAlign === 'right' ? 'text-right' : 'text-left'

        if (sectionKind === 'heading') {
          const defaultTitleCls = titleSizeCls ?? 'text-[2.8125rem] sm:text-[3.375rem]'
          const headingAlign = section.titleAlign ?? 'center'
          const headingAlignCls = headingAlign === 'center' ? 'text-center' : headingAlign === 'right' ? 'text-right' : 'text-left'
          return (
            <section key={i} className={`relative overflow-hidden rounded-2xl bg-white px-5 py-8 md:px-8 md:py-12 ${headingAlignCls}`}>
              {section.image && (
                <div className="absolute inset-0">
                  <img src={section.image} alt={section.imageAlt ?? ''} className="h-full w-full object-cover opacity-15" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/10" />
                </div>
              )}
              <h2
                className={`relative font-extrabold uppercase leading-tight tracking-[-0.02em] ${defaultTitleCls}`}
                style={{ color: section.titleColor ?? '#000000' }}
              >
                {section.title || <span className="text-slate-300">Tiêu đề đầu mục…</span>}
              </h2>
            </section>
          )
        }

        if (sectionKind === 'image-points') {
          const points = section.points ?? []
          const imgStyle = section.imageStyle ?? 'cover'

          if (imgStyle === 'background') {
            return (
              <section key={i} className="relative overflow-hidden rounded-2xl">
                {section.image
                  ? <>
                      <img src={section.image} alt={section.imageAlt ?? ''} className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
                      <div className="absolute inset-0 bg-[#00162F]/82" />
                    </>
                  : <div className="absolute inset-0 bg-slate-800 rounded-2xl" />
                }
                <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">
                  {(section.title || section.description) && (
                    <div className="mb-8 text-center">
                      {section.title && (
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                          {section.title}
                        </p>
                      )}
                      {section.description && (
                        <h2 className="text-xl font-bold text-white md:text-2xl">{section.description}</h2>
                      )}
                    </div>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {points.length === 0
                      ? <p className="text-sm text-white/40">Chưa có dữ liệu…</p>
                      : points.map((point, idx) => (
                          <article key={idx} className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                            <h3 className="mb-1.5 font-bold text-white">{point.title || <span className="opacity-40">Tiêu đề…</span>}</h3>
                            <p className="text-sm leading-relaxed text-white/65">{point.description || <span className="opacity-40">Mô tả…</span>}</p>
                          </article>
                        ))
                    }
                  </div>
                </div>
              </section>
            )
          }

          const imgRight = section.imagePosition !== 'left'
          const titleCls = titleSizeCls ?? 'text-2xl sm:text-3xl'
          return (
            <section key={i} className="space-y-6">
              {section.title && (
                <h2
                  className={`font-extrabold uppercase leading-tight tracking-[-0.02em] ${titleCls} ${alignCls}`}
                  style={{ color: section.titleColor ?? '#000000' }}
                >
                  {section.title}
                </h2>
              )}
              <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
                <div className={`${imgRight ? 'order-2 md:order-1' : 'order-2 md:order-2'}`}>
                  <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
                    {points.length === 0 ? (
                      <p className="text-sm text-slate-300">Chưa có dữ liệu text/desc cho khối này…</p>
                    ) : (
                      points.map((point, pointIndex) => (
                        <article key={pointIndex} className="rounded-xl bg-white p-6">
                          <h3 className="mb-2 text-xl font-bold">
                            {point.title || <span className="text-slate-300">Tiêu đề…</span>}
                          </h3>
                          <p className="font-light leading-relaxed">
                            {point.description || <span className="text-slate-300">Mô tả…</span>}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                </div>

                <div className={`${imgRight ? 'order-1 md:order-2' : 'order-1 md:order-1'}`}>
                  <div className="relative mx-auto w-full max-w-[30rem] aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100">
                    {section.image
                      ? <Img src={section.image} alt={section.imageAlt} />
                      : <Placeholder label={`Ảnh khối ${i + 1}`} />}
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
        const aspect = style === 'portrait' ? 'aspect-[3/4]' : style === 'wide' ? 'aspect-[16/9]' : 'aspect-[4/3]'
        const contentTitleCls = titleSizeCls ?? 'text-2xl sm:text-3xl'

        if (style === 'background') {
          return (
            <section key={i} className="relative overflow-hidden rounded-2xl">
              {section.image
                ? <>
                    <img src={section.image} alt={section.imageAlt ?? ''} className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-[#00162F]/82" />
                  </>
                : <div className="absolute inset-0 bg-slate-800" />
              }
              <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">
                <h2
                  className={`font-semibold leading-tight tracking-[-0.02em] text-white ${contentTitleCls}`}
                >
                  {section.title || <span className="opacity-30">Tiêu đề mục {i + 1}…</span>}
                </h2>
                {section.description ? (
                  <div
                    className="mt-4 text-base font-light leading-7 text-white/80 [&_p]:mb-3 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1"
                    dangerouslySetInnerHTML={{ __html: toRichHtml(section.description) }}
                  />
                ) : (
                  <p className="mt-4 text-base font-light text-white/40">Nội dung…</p>
                )}
                <SectionButton href={section.buttonHref} locale={locale} variant="light" />
              </div>
            </section>
          )
        }

        return (
          <section key={i} className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
            <div className={`relative overflow-hidden rounded-xl bg-slate-100 ${aspect} ${imgRight ? 'md:order-2' : ''}`}>
              {section.image
                ? <Img src={section.image} alt={section.imageAlt} className={style === 'contain' ? 'object-contain' : 'object-cover'} />
                : <Placeholder label={`Ảnh mục ${i + 1}`} />}
            </div>
            <div className={imgRight ? 'md:order-1' : ''}>
              <h2
                className={`font-semibold leading-tight tracking-[-0.02em] ${contentTitleCls} ${alignCls}`}
                style={{ color: section.titleColor ?? '#000000' }}
              >
                {section.title || <span className="text-slate-300">Tiêu đề mục {i + 1}…</span>}
              </h2>
              {section.description ? (
                <div
                  className={RICH_TEXT_CLS}
                  dangerouslySetInnerHTML={{ __html: toRichHtml(section.description) }}
                />
              ) : (
                <p className="mt-4 text-base font-light leading-7 text-slate-600">
                  <span className="text-slate-300">Nội dung…</span>
                </p>
              )}
              <SectionButton href={section.buttonHref} locale={locale} />
            </div>
          </section>
        )
      })}
    </div>
  )
}

// ─── Hero layout variants ─────────────────────────────────────────────────────

function HeroHeadline({ page }: { page: CMSDetailPage }) {
  return (
    <div className="grid min-h-[55vh] items-center md:grid-cols-2">
      <div className="px-5 pb-8 pt-16 md:px-10 md:py-16">
        {page.eyebrow && (
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: page.eyebrowColor ?? '#000000' }}
          >
            {page.eyebrow}
          </p>
        )}
        <h1
          className="text-[clamp(1.8rem,3.5vw,4rem)] font-semibold leading-tight tracking-[-0.03em]"
          style={{ color: page.titleColor ?? '#000000' }}
        >
          {page.title || <span className="text-slate-300">Tiêu đề trang…</span>}
        </h1>
        <p
          className="mt-5 max-w-lg text-base font-light leading-8"
          style={{ color: page.summaryColor ?? '#000000' }}
        >
          {page.summary || <span className="text-slate-300">Tóm tắt…</span>}
        </p>
      </div>
      <div className="relative self-stretch px-5 pb-10 pt-16 md:px-6 md:pb-10 md:pt-20">
        <div className="relative h-full min-h-[340px] overflow-hidden rounded-2xl bg-slate-200 md:min-h-[460px] md:rounded-3xl">
          {page.heroImage
            ? <Img src={page.heroImage} alt={page.heroImageAlt} />
            : <Placeholder label="Chưa có ảnh hero" />}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[35%]" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.05) 100%)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00162F]/35" />
        </div>
      </div>
    </div>
  )
}

function HeroMagazine({ page }: { page: CMSDetailPage }) {
  return (
    <div className="pt-16">
      <div className="relative h-[42vh] min-h-[240px] max-h-[520px] w-full overflow-hidden bg-slate-200 md:h-[55vh]">
        {page.heroImage
          ? <Img src={page.heroImage} alt={page.heroImageAlt} />
          : <Placeholder label="Chưa có ảnh hero" />}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[35%]" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.05) 100%)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00162F]/20" />
      </div>
      <div className="px-5 pb-6 pt-8 md:px-10 md:pb-10 md:pt-12">
        <div className="grid md:grid-cols-[1fr_2fr] md:gap-12 items-start">
          <div>
            {page.eyebrow && (
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: page.eyebrowColor ?? '#000000' }}
              >
                {page.eyebrow}
              </p>
            )}
            <h1
              className="text-[clamp(1.8rem,3vw,3rem)] font-semibold leading-tight tracking-[-0.03em]"
              style={{ color: page.titleColor ?? '#000000' }}
            >
              {page.title || <span className="text-slate-300">Tiêu đề trang…</span>}
            </h1>
          </div>
          <p
            className="mt-4 text-base font-light leading-8 md:mt-1 md:pt-1"
            style={{ color: page.summaryColor ?? '#000000' }}
          >
            {page.summary || <span className="text-slate-300">Tóm tắt…</span>}
          </p>
        </div>
      </div>
    </div>
  )
}

function HeroImmersive({ page }: { page: CMSDetailPage }) {
  return (
    <div className="relative min-h-[80vh] overflow-hidden bg-slate-900">
      {page.heroImage
        ? <Img src={page.heroImage} alt={page.heroImageAlt} className="object-cover opacity-55" />
        : <Placeholder label="Chưa có ảnh hero" />}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[40%]" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.90) 0%, rgba(15,23,42,0.05) 100%)' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#00162F]/85" />
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-12 md:px-10 md:pb-16">
        {page.eyebrow && (
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: page.eyebrowColor ?? 'rgba(255,255,255,0.65)' }}
          >
            {page.eyebrow}
          </p>
        )}
        <h1
          className="max-w-3xl text-[clamp(2rem,4.5vw,4.5rem)] font-semibold leading-tight tracking-[-0.03em]"
          style={{ color: page.titleColor ?? '#ffffff' }}
        >
          {page.title || <span className="opacity-30">Tiêu đề trang…</span>}
        </h1>
        <p
          className="mt-4 max-w-xl text-base font-light leading-8"
          style={{ color: page.summaryColor ?? 'rgba(255,255,255,0.7)' }}
        >
          {page.summary || <span className="opacity-30">Tóm tắt…</span>}
        </p>
      </div>
    </div>
  )
}

function HeroEditorial({ page }: { page: CMSDetailPage }) {
  return (
    <div className="pt-20 pb-0">
      <div className="px-5 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          {page.eyebrow && (
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: page.eyebrowColor ?? '#000000' }}
            >
              {page.eyebrow}
            </p>
          )}
          <h1
            className="text-[clamp(2rem,4.5vw,4.5rem)] font-semibold leading-tight tracking-[-0.03em]"
            style={{ color: page.titleColor ?? '#000000' }}
          >
            {page.title || <span className="text-slate-300">Tiêu đề trang…</span>}
          </h1>
          <p
            className="mx-auto mt-5 max-w-2xl text-base font-light leading-8"
            style={{ color: page.summaryColor ?? '#000000' }}
          >
            {page.summary || <span className="text-slate-300">Tóm tắt…</span>}
          </p>
        </div>
      </div>
      <div className="mt-8 px-5 md:px-6">
        <div className="relative aspect-[21/9] min-h-[200px] overflow-hidden rounded-2xl bg-slate-200 md:rounded-3xl">
          {page.heroImage
            ? <Img src={page.heroImage} alt={page.heroImageAlt} />
            : <Placeholder label="Chưa có ảnh hero" />}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[35%]" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.05) 100%)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00162F]/20" />
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  page: CMSDetailPage
  locale: SupportedLocale
  onClose: () => void
}

export function DetailPagePreview({ page, locale, onClose }: Props) {
  const layout = page.layout ?? 'headline'

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-2.5">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            Xem trước · chưa lưu
          </span>
          <span className="hidden truncate text-sm text-slate-500 sm:block">{page.title}</span>
          <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            {layout}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
          </svg>
          Đóng
        </button>
      </div>

      {/* Scrollable page content */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative text-slate-900">

          {layout === 'headline'  && <HeroHeadline  page={page} />}
          {layout === 'magazine'  && <HeroMagazine  page={page} />}
          {layout === 'immersive' && <HeroImmersive page={page} />}
          {layout === 'editorial' && <HeroEditorial page={page} />}

          <div className="mx-auto w-full max-w-[1400px] px-5 py-12 md:px-10 md:py-20">
            <PreviewSections sections={page.sections} locale={locale} />
          </div>

        </div>
      </div>
    </div>
  )
}
