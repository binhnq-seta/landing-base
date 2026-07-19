import type { Metadata } from 'next'
import { Unbounded } from 'next/font/google'
import { SmoothScrollProvider } from '@/context/SmoothScrollProvider'
import { InitialLoadingScreen } from '@/components/layout/InitialLoadingScreen'
import './globals.css'

const unbounded = Unbounded({
  subsets: ['latin'],
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
      <body className={`${unbounded.className} antialiased`}>
        {/* <InitialLoadingScreen /> */}
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  )
}
