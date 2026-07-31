import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { SmoothScrollProvider } from '@/context/SmoothScrollProvider'
import { HtmlLang } from '@/components/HtmlLang'
import { routing } from '@/i18n/routing'

// Param is named [type] to share the same dynamic-segment name as app/[type]/[slug].
// At runtime the value is a locale code ('vi' | 'en').
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ type: string }>
}) {
  const { type: locale } = await params

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlLang locale={locale} />
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </NextIntlClientProvider>
  )
}
