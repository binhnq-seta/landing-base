import type { Metadata } from 'next'

export const SITE_NAME = 'General Systems'
export const DEFAULT_SITE_URL = 'https://gs-group.vn'

export function getSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  try {
    const url = new URL(configuredUrl || DEFAULT_SITE_URL)
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'

    // Do not accidentally publish canonical URLs and sitemaps pointing at a
    // developer machine when the production environment variable is omitted.
    return process.env.NODE_ENV === 'production' && isLocalhost ? new URL(DEFAULT_SITE_URL) : url
  } catch {
    return new URL(DEFAULT_SITE_URL)
  }
}

type Locale = 'vi' | 'en'

type PageMetadataOptions = {
  locale: Locale
  title: string
  description: string
  path: string
  image?: string
  alternatePaths?: Partial<Record<Locale | 'x-default', string>>
}

export function createPageMetadata({
  locale,
  title,
  description,
  path,
  image = '/opengraph-image',
  alternatePaths,
}: PageMetadataOptions): Metadata {
  const languageAlternates = alternatePaths
    ? Object.fromEntries(Object.entries(alternatePaths).filter((entry): entry is [string, string] => Boolean(entry[1])))
    : undefined

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      ...(languageAlternates ? { languages: languageAlternates } : {}),
    },
    openGraph: {
      type: 'website',
      url: path,
      siteName: SITE_NAME,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      alternateLocale: locale === 'vi' ? ['en_US'] : ['vi_VN'],
      title,
      description,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: image, alt: title }],
    },
  }
}
