import localFont from 'next/font/local'
import './globals.css'
import { LocaleSync } from '@/components/LocaleSync'

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

// Root layout — provides html/body and font CSS variables for all routes.
// Locale-specific providers (NextIntlClientProvider, SmoothScrollProvider) live in
// app/(locale)/[locale]/layout.tsx; the HtmlLang component sets <html lang> dynamically.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${manrope.variable} ${inter.variable} antialiased`} suppressHydrationWarning>
        <LocaleSync />
        {children}
      </body>
    </html>
  )
}
