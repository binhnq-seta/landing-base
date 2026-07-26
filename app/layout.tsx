import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { SmoothScrollProvider } from '@/context/SmoothScrollProvider'
import { InitialLoadingScreen } from '@/components/layout/InitialLoadingScreen'
import './globals.css'

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

export const metadata: Metadata = {
  title: 'General Systems',
  description: 'Built with Next.js + Strapi + Three.js + GSAP',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${gilroy.variable} ${scienceGothic.variable} antialiased`}>
        {/* <InitialLoadingScreen /> */}
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  )
}
