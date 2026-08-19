import { getContent, TEXT_SIZE_CLS, type SupportedLocale } from '@/lib/admin/content'

const CONTACT_ICON_CLASS = 'mt-0.5 size-4 shrink-0 text-[#BEDBFF]'

interface SiteFooterProps {
  locale?: SupportedLocale
  siteName?: string
}

export function SiteFooter({ locale = 'vi', siteName }: SiteFooterProps) {
  const year = new Date().getFullYear()
  const content = getContent(locale)
  const f = content.footer

  // Font size classes
  const nameSize      = TEXT_SIZE_CLS[f.companyNameSize ?? 'xl']  ?? 'text-xl'
  const contactSize   = TEXT_SIZE_CLS[f.contactSize    ?? 'sm']  ?? 'text-sm'
  const colTitleSize  = TEXT_SIZE_CLS[f.colTitleSize   ?? 'sm']  ?? 'text-sm'
  const bodySize      = TEXT_SIZE_CLS[f.bodySize        ?? 'sm']  ?? 'text-sm'
  const copySize      = TEXT_SIZE_CLS[f.copyrightSize   ?? 'sm']  ?? 'text-sm'

  const solutions = content.solutions.map((s) => ({ label: s.title, slug: s.slug }))
  const seen = new Set<string>()
  const projects = content.projects.reduce<{ label: string; slug: string }[]>((acc, p) => {
    if (!seen.has(p.slug)) { seen.add(p.slug); acc.push({ label: p.title, slug: p.slug }) }
    return acc
  }, [])

  return (
    <footer id="footer" className="bg-[#172A4D]">
      <div className="mx-auto w-full px-5 py-15">
        <div className="grid gap-10 md:grid-cols-2">

          {/* Company info */}
          <div className="text-start flex flex-col max-w-full md:max-w-[45vw] md:pl-20">
            <span className={`font-semibold text-white ${nameSize}`}>{f.companyName}</span>
            <ul className="mt-4 space-y-3 font-light leading-6 text-white">
              <li className="flex items-start gap-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={CONTACT_ICON_CLASS}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span dangerouslySetInnerHTML={{ __html: f.address1 }} />
              </li>
              <li className="flex items-start gap-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={CONTACT_ICON_CLASS}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span dangerouslySetInnerHTML={{ __html: f.address2 }} />
              </li>
            </ul>
            <ul className={`mt-2 space-y-3 font-light leading-6 text-white ${contactSize}`}>
              <li className="flex items-start gap-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={CONTACT_ICON_CLASS}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.2 3.8 10 7.3 8.4 9.4a16.2 16.2 0 0 0 6.2 6.2l2.1-1.6 3.5 2.8v2.4a1.8 1.8 0 0 1-1.8 1.8A15.4 15.4 0 0 1 3 5.6a1.8 1.8 0 0 1 1.8-1.8h2.4Z" />
                </svg>
                <a href={`tel:${f.phone.replace(/\s/g, '')}`} className="transition-colors hover:text-[#A31F1A]">{f.phone}</a>
              </li>
              <li className="flex items-start gap-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={CONTACT_ICON_CLASS}>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
                </svg>
                <a href={`mailto:${f.email}`} className="transition-colors hover:text-[#A31F1A]">{f.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={CONTACT_ICON_CLASS}>
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" d="M3 12h18M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18" />
                </svg>
                <a href={f.websiteHref ?? `https://${f.website}`} className="transition-colors hover:text-[#A31F1A]">{f.website}</a>
              </li>
            </ul>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-16">
            <div className="sm:justify-self-center">
              <h3 className={`font-semibold uppercase tracking-[0.2em] text-white ${colTitleSize}`}>{f.colSolutions}</h3>
              <ul className={`mt-4 space-y-3 font-light text-white ${bodySize}`}>
                {solutions.map(({ label, slug }) => (
                  <li key={slug}>
                    <a href={`/solutions/${slug}`} className="transition-colors hover:text-[#A31F1A]">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sm:justify-self-center">
              <h3 className={`font-semibold uppercase tracking-[0.2em] text-white ${colTitleSize}`}>{f.colProjects}</h3>
              <ul className={`mt-4 space-y-3 font-light text-white ${bodySize}`}>
                {projects.map(({ label, slug }) => (
                  <li key={slug}>
                    <a href={`/projects/${slug}`} className="transition-colors hover:text-[#A31F1A]">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="ml-0 md:ml-20 mt-10 flex flex-col gap-3 border-t border-[#BEDBFF] font-light pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-white ${copySize}`}>© {year} {siteName ?? f.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
