import { getContent } from '@/lib/admin/content'
import type { SupportedLocale } from '@/lib/admin/content'
import { SiteHeader } from './SiteHeader'
import type { NavItem } from './SiteHeader'

interface Props {
  overlay?: boolean
  dark?: boolean
  locale?: SupportedLocale
}

export async function SiteHeaderServer({ overlay, dark, locale = 'vi' }: Props) {
  const content = getContent(locale)

  const navSolutions: NavItem[] = content.solutions.map((s) => ({
    label: s.title,
    href: `/solutions/${s.slug}`,
  }))

  const seen = new Set<string>()
  const navProjects: NavItem[] = []
  for (const p of content.projects) {
    if (!seen.has(p.slug)) {
      seen.add(p.slug)
      navProjects.push({ label: p.title, href: `/projects/${p.slug}` })
    }
  }

  return (
    <SiteHeader
      overlay={overlay}
      dark={dark}
      locale={locale}
      navSolutions={navSolutions}
      navProjects={navProjects}
    />
  )
}
