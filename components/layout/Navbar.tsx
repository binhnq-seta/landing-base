'use client'

import Link from 'next/link'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
}

interface SiteNavbarProps {
  links?: NavItem[]
  siteName?: string
}

const DEFAULT_LINKS: NavItem[] = [
  { label: 'Trang chủ', href: '#home' },
  { label: 'Về chúng tôi', href: '#about' },
  { label: 'Giải pháp', href: '#solutions' },
  { label: 'Liên hệ', href: '#contact' },
]

export function SiteNavbar({ links = DEFAULT_LINKS, siteName = 'GeneralSysems' }: SiteNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 w-full backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-xl font-semibold text-white">
          {siteName}
        </Link>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
          className="inline-flex items-center justify-center rounded-lg border border-white/10 p-2 text-white transition-colors hover:bg-white/5 md:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-white transition-colors hover:text-gray">
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className={`${menuOpen ? 'block' : 'hidden'} border-t border-white/10 px-5 py-4 md:hidden`}>
        <nav className="mx-auto flex max-w-6xl flex-col gap-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
