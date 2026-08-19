'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin/hero', label: 'Hero' },
  { href: '/admin/showcase', label: 'Showcase Corners' },
  { href: '/admin/features', label: 'Vì sao chọn chúng tôi' },
  { href: '/admin/core-values', label: 'Giá trị cốt lõi' },
  { href: '/admin/solutions', label: 'Giải pháp' },
  { href: '/admin/projects', label: 'Dự án' },
  { href: '/admin/partners', label: 'Đối tác' },
  { href: '/admin/footer', label: 'Footer' },
  { href: '/admin/detail-pages', label: 'Trang chi tiết' },
  { href: '/admin/settings', label: 'Cài đặt' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') return null

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700 px-5 py-4">
        <span className="text-sm font-bold uppercase tracking-widest text-slate-300">
          GS Admin
        </span>
      </div>

      <nav className="flex flex-1 flex-col p-3">
        <div className="flex-1">
          {NAV.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`mb-1 flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Highlighted guide link */}
        <Link
          href="/admin/guide"
          className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
            pathname.startsWith('/admin/guide')
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white'
          }`}
        >
          <span className="text-base leading-none">📖</span>
          Hướng dẫn sử dụng
        </Link>
      </nav>

      <div className="border-t border-slate-700 p-3 space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          Xem trang web
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
        </a>
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
