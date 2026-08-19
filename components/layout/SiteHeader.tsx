'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type NavItem = { label: string; href: string }
type NavColumn = { label: string; href: string; items: NavItem[] }
type NavLink = NavItem & { children?: NavItem[]; columns?: NavColumn[] }

const SOLUTIONS_VI: NavItem[] = [
  { label: 'Giải pháp tích hợp', href: '/solutions/giai-phap-tich-hop' },
  { label: 'An ninh - Quốc phòng', href: '/solutions/an-ninh-quoc-phong' },
  { label: 'Bảo mật - ATTT', href: '/solutions/bao-mat-attt' },
  { label: 'Điện lực - Năng lượng', href: '/solutions/dien-luc-nang-luong' },
  { label: 'Viễn thông', href: '/solutions/vien-thong' },
  { label: 'Hàng không', href: '/solutions/hang-khong' },
]

const SOLUTIONS_EN: NavItem[] = [
  { label: 'Integration Solutions', href: '/solutions/giai-phap-tich-hop' },
  { label: 'Defense & Security', href: '/solutions/an-ninh-quoc-phong' },
  { label: 'Cybersecurity', href: '/solutions/bao-mat-attt' },
  { label: 'Power & Energy', href: '/solutions/dien-luc-nang-luong' },
  { label: 'Telecommunications', href: '/solutions/vien-thong' },
  { label: 'Aviation', href: '/solutions/hang-khong' },
]

const PROJECTS_VI: NavItem[] = [
  { label: 'Hệ thống GSM cơ động', href: '/projects/he-thong-gsm-co-dong' },
  { label: 'Phần mềm phân bay (AVES)', href: '/projects/phan-mem-phan-bay-aves' },
  { label: 'Hệ thống An toàn Thông tin', href: '/projects/he-thong-an-toan-thong-tin' },
]

const PROJECTS_EN: NavItem[] = [
  { label: 'Mobile GSM System', href: '/projects/he-thong-gsm-co-dong' },
  { label: 'Flight Management (AVES)', href: '/projects/phan-mem-phan-bay-aves' },
  { label: 'Information Security System', href: '/projects/he-thong-an-toan-thong-tin' },
]

const NAV_VI: NavLink[] = [
  { label: 'Trang chủ', href: '/#home' },
  {
    label: 'Giải pháp',
    href: '/#solutions',
    children: SOLUTIONS_VI,
  },
  {
    label: 'Dự án tiêu biểu',
    href: '/#projects',
    children: PROJECTS_VI,
  },
  { label: 'Liên hệ', href: '/contact' },
]

const NAV_EN: NavLink[] = [
  { label: 'Home', href: '/#home' },
  {
    label: 'Solutions',
    href: '/#solutions',
    children: SOLUTIONS_EN,
  },
  {
    label: 'Notable Projects',
    href: '/#projects',
    children: PROJECTS_EN,
  },
  { label: 'Contact', href: '/contact' },
]

function localeHref(pathname: string, target: 'vi' | 'en'): string {
  if (pathname.startsWith('/vi')) return '/' + target + pathname.slice(3) || '/' + target
  if (pathname.startsWith('/en')) return '/' + target + pathname.slice(3) || '/' + target
  return '/' + target
}

function sectionHref(href: string, locale: 'vi' | 'en'): string {
  return href.startsWith('/#') ? `/${locale}${href.slice(1)}` : href
}

function VietnamFlag() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" className="h-full w-full" aria-hidden>
      <rect width="300" height="200" fill="#DA251D" />
      <polygon fill="#FFFF00" points="150,40 164,81 207,82 173,107 185,149 150,124 115,149 127,107 93,82 136,81" />
    </svg>
  )
}

function UKFlag() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="h-full w-full" aria-hidden>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M0,30 L60,0" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M0,0 L60,30 M0,30 L60,0" stroke="#C8102E" strokeWidth="6" />
      <rect x="0" y="11" width="60" height="8" fill="#FFFFFF" />
      <rect x="26" y="0" width="8" height="30" fill="#FFFFFF" />
      <rect x="0" y="12.5" width="60" height="5" fill="#C8102E" />
      <rect x="27.5" y="0" width="5" height="30" fill="#C8102E" />
    </svg>
  )
}

interface SiteHeaderProps {
  overlay?: boolean
  dark?: boolean
  /** Override URL-based locale detection (used on detail pages where URL has no locale prefix) */
  locale?: 'vi' | 'en'
}

export function SiteHeader({ overlay = false, dark = false, locale: localeProp }: SiteHeaderProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const locale = localeProp ?? (pathname.startsWith('/en') ? 'en' : 'vi')
  const NAV_LINKS = locale === 'en' ? NAV_EN : NAV_VI
  const viHref = localeHref(pathname, 'vi')
  const enHref = localeHref(pathname, 'en')
  const activeRing = dark
    ? '0 0 0 2px rgba(255,255,255,0.75)'
    : '0 0 0 2px rgba(100,116,139,0.65)'

  const isActive = (label: string) => {
    if (label === 'Giải pháp' || label === 'Solutions') {
      return pathname.includes('/solutions')
    }
    if (label === 'Dự án tiêu biểu' || label === 'Notable Projects') {
      return pathname.includes('/projects')
    }
    if (label === 'Trang chủ' || label === 'Home') {
      return pathname === '/' || pathname === '/vi' || pathname === '/en'
    }
    if (label === 'Liên hệ' || label === 'Contact') {
      return pathname === `/${locale}/contact`
    }
    return false
  }

  const closeMenu = () => setMenuOpen(false)

  const flagSwitcher = (
    <div className="flex items-center gap-1.5">
      <Link
        href={viHref}
        title="Tiếng Việt"
        className={`block h-[18px] w-[27px] overflow-hidden rounded-[2px] transition-all duration-200 ${locale === 'vi' ? '' : 'opacity-40 hover:opacity-75'}`}
        style={locale === 'vi' ? { boxShadow: activeRing } : undefined}
      >
        <VietnamFlag />
      </Link>
      <Link
        href={enHref}
        title="English"
        className={`block h-[18px] w-[27px] overflow-hidden rounded-[2px] transition-all duration-200 ${locale === 'en' ? '' : 'opacity-40 hover:opacity-75'}`}
        style={locale === 'en' ? { boxShadow: activeRing } : undefined}
      >
        <UKFlag />
      </Link>
    </div>
  )

  return (
    <header className={`${overlay ? 'absolute' : 'sticky border-b border-slate-200/70 bg-white/90 backdrop-blur-xl'} top-0 z-50 w-full`}>
      <div className="mx-auto flex w-full items-center justify-between px-5 py-4 md:px-20">
        <Link href="/" className="inline-flex items-center pt-1" aria-label="General Systems">
          <Image
            src={dark ? '/image/lgWhite.png' : '/image/lgBlack.png'}
            alt="General Systems"
            width={300}
            height={90}
            preload
            className="h-auto w-[220px] md:w-[300px]"
          />
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
                href={link.href === '/contact' ? `/${locale}/contact` : sectionHref(link.href, locale)}
                aria-current={isActive(link.label) ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 py-2 text-base font-medium tracking-wide transition-colors hover:text-[#F5383B] ${isActive(link.label) ? 'text-[#F5383B]' : `${dark ? 'text-white/80' : 'text-slate-700'}`}`}
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
                      <Link key={child.label} href={sectionHref(child.href, locale)} className="block rounded-lg px-4 py-2.5 text-sm font-light text-slate-700 hover:text-[#F5383B]">
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
                        <Link href={sectionHref(column.href, locale)} className="mb-2 block px-2 text-sm font-medium text-slate-800 hover:text-[#F5383B]">{column.label}</Link>
                        <div className="space-y-1">
                          {column.items.map((item) => (
                            <Link key={item.label} href={item.href} className="block rounded-lg px-2 py-2 text-sm font-light text-slate-600 hover:text-[#F5383B]">{item.label}</Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className={`ml-2 border-l pl-4 ${dark ? 'border-white/20' : 'border-slate-200'}`}>
            {flagSwitcher}
          </div>
        </nav>
      </div>

      <div className={`${menuOpen ? 'block' : 'hidden'} px-5 py-4 md:hidden ${dark ? 'border-t border-white/20 bg-slate-900/95 backdrop-blur-xl' : 'border-t border-slate-200 bg-white/95'}`}>
        <nav className="mx-auto flex flex-col gap-3" aria-label="Menu di động">
          {NAV_LINKS.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href === '/contact' ? `/${locale}/contact` : sectionHref(link.href, locale)}
                onClick={closeMenu}
                aria-current={isActive(link.label) ? 'page' : undefined}
                className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors hover:text-[#F5383B] ${dark ? 'hover:bg-white/10' : 'hover:bg-slate-100'} ${isActive(link.label) ? 'text-[#F5383B]' : `${dark ? 'text-white/80' : 'text-slate-700'}`}`}
              >
                {link.label}
              </Link>
              {link.children?.map((child) => (
                <Link key={child.label} href={sectionHref(child.href, locale)} onClick={closeMenu} className={`ml-4 block rounded-lg border-l px-4 py-2 text-sm font-light transition-colors hover:text-[#F5383B] ${dark ? 'border-white/20 text-white/65' : 'border-slate-200 text-slate-500'}`}>{child.label}</Link>
              ))}
              {link.columns?.flatMap((column) => column.items).map((item) => (
                <Link key={item.label} href={item.href} onClick={closeMenu} className={`ml-4 block rounded-lg border-l px-4 py-2 text-sm font-light transition-colors hover:text-[#F5383B] ${dark ? 'border-white/20 text-white/65' : 'border-slate-200 text-slate-500'}`}>{item.label}</Link>
              ))}
            </div>
          ))}

          <div className={`flex items-center gap-3 border-t pt-3 ${dark ? 'border-white/20' : 'border-slate-200'}`}>
            {flagSwitcher}
          </div>
        </nav>
      </div>
    </header>
  )
}
