import type { MetadataRoute } from 'next'
import { getContent } from '@/lib/admin/content'
import { getSiteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteUrl().toString().replace(/\/$/, '')
  const localisedRoutes = [
    { path: '', changeFrequency: 'weekly' as const, priority: 1 },
    { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.7 },
  ]

  const pages: MetadataRoute.Sitemap = localisedRoutes.flatMap(({ path, changeFrequency, priority }) => [
    {
      url: `${origin}/vi${path}`,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          vi: `${origin}/vi${path}`,
          en: `${origin}/en${path}`,
          'x-default': `${origin}/vi${path}`,
        },
      },
    },
    {
      url: `${origin}/en${path}`,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          vi: `${origin}/vi${path}`,
          en: `${origin}/en${path}`,
          'x-default': `${origin}/vi${path}`,
        },
      },
    },
  ])

  const detailRoutes = new Map<string, string>()
  for (const locale of ['vi', 'en'] as const) {
    for (const page of getContent(locale).detailPages) {
      detailRoutes.set(`/${page.type}/${page.slug}`, page.heroImage)
    }
  }

  for (const [path, image] of detailRoutes) {
    pages.push({
      url: `${origin}${path}`,
      changeFrequency: 'monthly',
      priority: 0.8,
      images: [new URL(image, `${origin}/`).toString()],
    })
  }

  return pages
}
