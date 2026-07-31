'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Writes a `locale` cookie whenever the user is on a locale-prefixed route (/vi, /en).
// Detail pages (server components at /solutions/abc etc.) read this cookie to know
// which language the user last chose, without needing locale in their URL.
export function LocaleSync() {
  const pathname = usePathname()

  useEffect(() => {
    const locale = pathname.startsWith('/en') ? 'en' : pathname.startsWith('/vi') ? 'vi' : null
    if (locale) {
      document.cookie = `locale=${locale}; path=/; max-age=${365 * 24 * 3600}; SameSite=Lax`
    }
  }, [pathname])

  return null
}
