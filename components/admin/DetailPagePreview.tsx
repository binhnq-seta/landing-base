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

// ─── Section content (same in all layouts) ────────────────────────────────────

function PreviewSections({ sections, locale }: { sections: CMSDetailSection[]; locale: SupportedLocale }) {
  if (sections.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-slate-300">Chưa có mục nội dung nào.</p>
    )
  }
  return (
    <div className="space-y-12 md:space-y-20">
      {sections.map((section, i) => {
        const pos = section.imagePosition ?? 'auto'
        const imgRight = pos === 'right' || (pos === 'auto' && i % 2 === 1)
        const style = section.imageStyle ?? 'cover'
        const aspect = style === 'portrait' ? 'aspect-[3/4]' : style === 'wide' ? 'aspect-[16/9]' : 'aspect-[4/3]'
        return (
          <section key={i} className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
            <div className={`relative overflow-hidden rounded-xl bg-slate-100 ${aspect} ${imgRight ? 'md:order-2' : ''}`}>
              {section.image
                ? <Img src={section.image} alt={section.imageAlt} className={style === 'contain' ? 'object-contain' : 'object-cover'} />
                : <Placeholder label={`Ảnh mục ${i + 1}`} />}
            </div>
            <div className={imgRight ? 'md:order-1' : ''}>
              <h2 className="text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#00162F] sm:text-3xl">
                {section.title || <span className="text-slate-300">Tiêu đề mục {i + 1}…</span>}
              </h2>
              <p className="mt-4 text-base font-light leading-7 text-slate-600">
                {section.description || <span className="text-slate-300">Nội dung…</span>}
              </p>
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
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#A31F1A]">
            {page.eyebrow}
          </p>
        )}
        <h1 className="text-[clamp(1.8rem,3.5vw,4rem)] font-semibold leading-tight tracking-[-0.03em] text-[#00162F]">
          {page.title || <span className="text-slate-300">Tiêu đề trang…</span>}
        </h1>
        <p className="mt-5 max-w-lg text-base font-light leading-8 text-slate-600">
          {page.summary || <span className="text-slate-300">Tóm tắt…</span>}
        </p>
      </div>
      <div className="relative self-stretch px-5 pb-10 pt-6 md:px-6 md:py-10">
        <div className="relative h-full min-h-[340px] overflow-hidden rounded-2xl bg-slate-200 md:min-h-[460px] md:rounded-3xl">
          {page.heroImage
            ? <Img src={page.heroImage} alt={page.heroImageAlt} />
            : <Placeholder label="Chưa có ảnh hero" />}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00162F]/35" />
        </div>
      </div>
    </div>
  )
}

function HeroMagazine({ page }: { page: CMSDetailPage }) {
  return (
    <div className="pt-16">
      <div className="relative aspect-[16/9] max-h-[72vh] overflow-hidden bg-slate-200">
        {page.heroImage
          ? <Img src={page.heroImage} alt={page.heroImageAlt} />
          : <Placeholder label="Chưa có ảnh hero" />}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00162F]/20" />
      </div>
      <div className="px-5 pb-6 pt-8 md:px-10 md:pb-10 md:pt-12">
        <div className="grid md:grid-cols-[1fr_2fr] md:gap-12 items-start">
          <div>
            {page.eyebrow && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#A31F1A]">
                {page.eyebrow}
              </p>
            )}
            <h1 className="text-[clamp(1.8rem,3vw,3rem)] font-semibold leading-tight tracking-[-0.03em] text-[#00162F]">
              {page.title || <span className="text-slate-300">Tiêu đề trang…</span>}
            </h1>
          </div>
          <p className="mt-4 text-base font-light leading-8 text-slate-500 md:mt-1 md:pt-1">
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#00162F]/20 via-transparent to-[#00162F]/85" />
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-12 md:px-10 md:pb-16">
        {page.eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/65">
            {page.eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-[clamp(2rem,4.5vw,4.5rem)] font-semibold leading-tight tracking-[-0.03em] text-white">
          {page.title || <span className="text-white/30">Tiêu đề trang…</span>}
        </h1>
        <p className="mt-4 max-w-xl text-base font-light leading-8 text-white/70">
          {page.summary || <span className="text-white/30">Tóm tắt…</span>}
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
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#A31F1A]">
              {page.eyebrow}
            </p>
          )}
          <h1 className="text-[clamp(2rem,4.5vw,4.5rem)] font-semibold leading-tight tracking-[-0.03em] text-[#00162F]">
            {page.title || <span className="text-slate-300">Tiêu đề trang…</span>}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-light leading-8 text-slate-600">
            {page.summary || <span className="text-slate-300">Tóm tắt…</span>}
          </p>
        </div>
      </div>
      <div className="mt-8 px-5 md:px-6">
        <div className="relative aspect-[21/9] min-h-[200px] overflow-hidden rounded-2xl bg-slate-200 md:rounded-3xl">
          {page.heroImage
            ? <Img src={page.heroImage} alt={page.heroImageAlt} />
            : <Placeholder label="Chưa có ảnh hero" />}
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
