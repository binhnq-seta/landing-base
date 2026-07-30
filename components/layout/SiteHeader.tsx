'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const SOLUTIONS = [
  { label: 'Giải pháp tích hợp', href: '/solutions/giai-phap-tich-hop' },
  { label: 'An ninh - Quốc phòng', href: '/solutions/an-ninh-quoc-phong' },
  { label: 'Bảo mật - ATTT', href: '/solutions/bao-mat-attt' },
  { label: 'Điện lực - Năng lượng', href: '/solutions/dien-luc-nang-luong' },
  { label: 'Viễn thông', href: '/solutions/vien-thong' },
  { label: 'Hàng không', href: '/solutions/hang-khong' },
]

const PROJECTS = [
  { label: 'Hệ thống GSM cơ động', href: '/projects/he-thong-gsm-co-dong' },
  { label: 'Phần mềm phân bay (AVES)', href: '/projects/phan-mem-phan-bay-aves' },
  { label: 'Hệ thống An toàn Thông tin', href: '/projects/he-thong-an-toan-thong-tin' },
]

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/#home' },
  {
    label: 'Về chúng tôi',
    href: '/#about',
    children: [
      { label: 'Về GS Group', href: '/#home' },
      { label: 'Tầm nhìn & sứ mệnh', href: '/#features' },
      { label: 'Giá trị cốt lõi', href: '/#core-values' },
    ],
  },
  {
    label: 'Giải pháp',
    href: '/#solutions',
    columns: [
      { label: 'Giải pháp', href: '/#solutions', items: SOLUTIONS },
      {
        label: 'Dự án tiêu biểu',
        href: '/#projects',
        items: PROJECTS,
      },
    ],
  },
  { label: 'Liên hệ', href: '/#footer' },
]

export function SiteHeader({ overlay = false, dark = false }: { overlay?: boolean; dark?: boolean }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (label: string) => {
    if (label === 'Giải pháp') {
      return pathname.startsWith('/solutions') || pathname.startsWith('/projects')
    }
    if (label === 'Trang chủ') return pathname === '/'
    return false
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={`${overlay ? 'absolute' : 'sticky border-b border-slate-200/70 bg-white/90 backdrop-blur-xl'} top-0 z-50 w-full`}>
      <div className="mx-auto flex w-full items-center justify-between px-5 py-4 md:px-20">
        <Link href="/" className="inline-flex items-center pt-1" aria-label="General Systems">
          <Image src="/image/logoLg.png" alt="General Systems" width={300} height={90} preload className="h-auto w-[220px] md:w-[300px]" />
        </Link>

        <button
          type="button"
          aria-label="Mở menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
          className={`inline-flex items-center justify-center rounded-lg border p-2 transition-colors md:hidden ${dark ? 'border-white/30 bg-white/10 text-white hover:bg-white/20' : 'border-slate-300 bg-white/80 text-slate-900 hover:bg-white'}`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Menu chính">
          {NAV_LINKS.map((link) => (
            <div key={link.label} className="group relative">
              <Link
                href={link.href}
                aria-current={isActive(link.label) ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 py-2 text-base font-medium tracking-wide transition-colors ${dark ? 'hover:text-[#E3F2FD]' : 'hover:text-[#A31F1A]'} ${isActive(link.label) ? `${dark ? 'text-[#E3F2FD]' : 'text-[#A31F1A]'}` : `${dark ? 'text-white/80' : 'text-slate-700'}`}`}
              >
                {link.label}
                {(link.children || link.columns) && (
                  <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
                  </svg>
                )}
              </Link>

              {link.children && (
                <div className="invisible absolute left-1/2 top-full w-56 -translate-x-1/2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="rounded-xl border border-white/40 bg-white/95 p-2 shadow-xl backdrop-blur-xl">
                    {link.children.map((child) => (
                      <Link key={child.label} href={child.href} className="block rounded-lg px-4 py-2.5 text-sm font-light text-slate-700 hover:text-[#A31F1A]">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {link.columns && (
                <div className="invisible absolute right-0 top-full w-[min(34rem,calc(100vw-2rem))] pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/40 bg-white/95 p-3 shadow-xl backdrop-blur-xl">
                    {link.columns.map((column) => (
                      <div key={column.label} className="rounded-lg p-2">
                        <Link href={column.href} className="mb-2 block px-2 text-sm font-medium text-slate-800 hover:text-[#A31F1A]">{column.label}</Link>
                        <div className="space-y-1">
                          {column.items.map((item) => (
                            <Link key={item.label} href={item.href} className="block rounded-lg px-2 py-2 text-sm font-light text-slate-600 hover:text-[#A31F1A]">{item.label}</Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className={`${menuOpen ? 'block' : 'hidden'} px-5 py-4 md:hidden ${dark ? 'border-t border-white/20 bg-slate-900/95 backdrop-blur-xl' : 'border-t border-slate-200 bg-white/95'}`}>
        <nav className="mx-auto flex flex-col gap-3" aria-label="Menu di động">
          {NAV_LINKS.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                onClick={closeMenu}
                aria-current={isActive(link.label) ? 'page' : undefined}
                className={`block rounded-lg px-3 py-2 text-base font-medium ${dark ? 'hover:bg-white/10' : 'hover:bg-slate-100'} ${isActive(link.label) ? `${dark ? 'text-[#E3F2FD]' : 'text-[#A31F1A]'}` : `${dark ? 'text-white/80' : 'text-slate-700'}`}`}
              >
                {link.label}
              </Link>
              {link.children?.map((child) => (
                <Link key={child.label} href={child.href} onClick={closeMenu} className={`ml-4 block rounded-lg border-l px-4 py-2 text-sm font-light ${dark ? 'border-white/20 text-white/65 hover:text-rose-400' : 'border-slate-200 text-slate-500 hover:text-[#A31F1A]'}`}>{child.label}</Link>
              ))}
              {link.columns?.flatMap((column) => column.items).map((item) => (
                <Link key={item.label} href={item.href} onClick={closeMenu} className={`ml-4 block rounded-lg border-l px-4 py-2 text-sm font-light ${dark ? 'border-white/20 text-white/65 hover:text-rose-400' : 'border-slate-200 text-slate-500 hover:text-[#A31F1A]'}`}>{item.label}</Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </header>
  )
}
