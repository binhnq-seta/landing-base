import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { LocaleSync } from '@/components/LocaleSync'
import { getSiteUrl, SITE_NAME } from '@/lib/seo'

const manrope = localFont({
  src: '../public/font/Manrope/Manrope-VariableFont_wght.ttf',
  variable: '--font-manrope',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
})

const inter = localFont({
  src: '../public/font/Inter/Inter-VariableFont_opsz,wght.ttf',
  variable: '--font-inter',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: 'General Systems | Giải pháp công nghệ',
    template: '%s | General Systems',
  },
  description:
    'General Systems cung cấp giải pháp tích hợp công nghệ, an toàn thông tin và hạ tầng số cho các hệ thống trọng yếu.',
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    'General Systems',
    'GS Group',
    'giải pháp công nghệ',
    'tích hợp hệ thống',
    'an toàn thông tin',
    'hạ tầng số',
  ],
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'vi_VN',
    alternateLocale: ['en_US'],
    title: 'General Systems | Giải pháp công nghệ',
    description:
      'Giải pháp tích hợp công nghệ, an toàn thông tin và hạ tầng số cho các hệ thống trọng yếu.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'General Systems | Giải pháp công nghệ',
    description:
      'Giải pháp tích hợp công nghệ, an toàn thông tin và hạ tầng số cho các hệ thống trọng yếu.',
  },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    shortcut: '/favicon.png',
  },
}

// Root layout — provides html/body and font CSS variables for all routes.
// Locale-specific providers (NextIntlClientProvider, SmoothScrollProvider) live in
// app/(locale)/[locale]/layout.tsx; the HtmlLang component sets <html lang> dynamically.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = getSiteUrl().toString().replace(/\/$/, '')
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: SITE_NAME,
        alternateName: 'GS Group',
        url: siteUrl,
        logo: `${siteUrl}/image/Logo.png`,
        email: 'contact@gs-group.vn',
        telephone: '+84987359603',
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: ['vi-VN', 'en-US'],
      },
    ],
  }

  return (
    <html suppressHydrationWarning>
      <body className={`${manrope.variable} ${inter.variable} antialiased`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
        <LocaleSync />
        {children}
      </body>
    </html>
  )
}
