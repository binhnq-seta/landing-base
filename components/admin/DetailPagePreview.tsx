'use client'

import type { CMSDetailPage, CMSDetailSection } from '@/lib/admin/content'

function sectionImageClasses(section: CMSDetailSection): string {
  const style = section.imageStyle ?? 'cover'
  const aspect =
    style === 'portrait' ? 'aspect-[3/4]' : style === 'wide' ? 'aspect-[16/9]' : 'aspect-[4/3]'
  const fit = style === 'contain' ? 'object-contain bg-slate-100' : 'object-cover'
  return `${aspect} ${fit}`
}

function imgRight(section: CMSDetailSection, index: number): boolean {
  const pos = section.imagePosition ?? 'auto'
  if (pos === 'right') return true
  if (pos === 'left') return false
  return index % 2 === 1
}

interface Props {
  page: CMSDetailPage
  onClose: () => void
}

export function DetailPagePreview({ page, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-2.5">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            Xem trước · chưa lưu
          </span>
          <span className="hidden truncate text-sm text-slate-500 sm:block">{page.title}</span>
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

          {/* ── Hero header ── */}
          <div className="flex min-h-[55vh] items-end bg-white">
            <header className="mx-auto w-full max-w-[1600px] px-5 pb-10 pt-20 md:px-12 md:pb-16 md:pt-28 lg:px-40">
              {page.eyebrow && (
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-500">
                  {page.eyebrow}
                </p>
              )}
              <h1 className="max-w-3xl text-[clamp(1.8rem,3.5vw,5rem)] font-semibold leading-tight text-[#00162F]">
                {page.title || <span className="text-slate-300">Tiêu đề trang…</span>}
              </h1>
            </header>
          </div>

          {/* ── Hero image + summary ── */}
          <div className="mx-auto w-full max-w-[1800px] px-5 md:px-12 lg:px-20">
            <div className="relative pb-28 md:pb-0">
              {page.heroImage ? (
                <div className="relative aspect-square min-h-[260px] overflow-hidden rounded-[1.5rem] bg-slate-200 md:rounded-[2.5rem]">
                  {/* Use <img> to avoid Next.js domain restrictions in preview */}
                  <img
                    src={page.heroImage}
                    alt={page.heroImageAlt || ''}
                    className="absolute inset-0 h-full w-full object-cover grayscale"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-gray-200/25 to-blue-700/80" />
                </div>
              ) : (
                <div className="flex aspect-square min-h-[260px] items-center justify-center rounded-[1.5rem] bg-slate-100 text-sm text-slate-300">
                  Chưa có ảnh hero
                </div>
              )}

              {page.summary && (
                <p className="absolute bottom-0 left-1/2 z-10 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-slate-200/80 bg-white/95 px-6 py-5 text-base font-light leading-7 text-slate-600 shadow-lg backdrop-blur-sm md:bottom-auto md:left-0 md:top-[60%] md:w-full md:-translate-x-1/2 md:-translate-y-[20%] md:rounded-3xl md:px-8 md:py-7 md:text-lg md:leading-8">
                  {page.summary}
                </p>
              )}
            </div>
          </div>

          {/* ── Sections ── */}
          <div className="mx-auto w-full max-w-[1600px] space-y-16 px-5 py-20 md:space-y-28 md:px-12 md:py-32 lg:px-20">
            {page.sections.length === 0 && (
              <p className="py-16 text-center text-sm text-slate-300">
                Chưa có mục nội dung nào.
              </p>
            )}

            {page.sections.map((section, index) => {
              const right = imgRight(section, index)
              return (
                <section
                  key={index}
                  className="grid items-center gap-8 md:grid-cols-2 md:gap-16 lg:gap-24"
                >
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden rounded-[1.5rem] bg-slate-100 md:rounded-[2rem] ${sectionImageClasses(section)} ${right ? 'md:order-2' : ''}`}
                  >
                    {section.image ? (
                      <img
                        src={section.image}
                        alt={section.imageAlt || ''}
                        className={`absolute inset-0 h-full w-full transition-transform duration-700 hover:scale-[1.03] ${(section.imageStyle ?? 'cover') === 'contain' ? 'object-contain' : 'object-cover'}`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-300">
                        Chưa có ảnh mục {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <div className={right ? 'md:order-1' : ''}>
                    <h2 className="max-w-xl text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#00162F] sm:text-3xl lg:text-4xl">
                      {section.title || <span className="text-slate-300">Tiêu đề mục {index + 1}…</span>}
                    </h2>
                    <p className="mt-5 max-w-xl text-base font-light leading-8 text-slate-600">
                      {section.description || <span className="text-slate-300">Nội dung mục {index + 1}…</span>}
                    </p>
                  </div>
                </section>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
