import localFont from 'next/font/local'
import './globals.css'
import { LocaleSync } from '@/components/LocaleSync'

const gilroy = localFont({
  src: [
    { path: '../public/font/Font Gilroy VH Full/SVN-Gilroy Light.otf', weight: '300', style: 'normal' },
    { path: '../public/font/Font Gilroy VH Full/SVN-Gilroy Regular.otf', weight: '400', style: 'normal' },
    { path: '../public/font/Font Gilroy VH Full/SVN-Gilroy Medium.otf', weight: '500', style: 'normal' },
    { path: '../public/font/Font Gilroy VH Full/SVN-Gilroy SemiBold.otf', weight: '600', style: 'normal' },
    { path: '../public/font/Font Gilroy VH Full/SVN-Gilroy Bold.otf', weight: '700', style: 'normal' },
    { path: '../public/font/Font Gilroy VH Full/SVN-Gilroy XBold.otf', weight: '800', style: 'normal' },
  ],
  variable: '--font-gilroy',
  display: 'swap',
})

const scienceGothic = localFont({
  src: '../public/font/Science_Gothic/ScienceGothic-VariableFont_CTRS,slnt,wdth,wght.ttf',
  variable: '--font-science-gothic',
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
      <body className={`${gilroy.variable} ${scienceGothic.variable} antialiased`} suppressHydrationWarning>
        <LocaleSync />
        {children}
      </body>
    </html>
  )
}
