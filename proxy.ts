import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/admin/auth'
import { routing } from './i18n/routing'

const handleIntl = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin auth guard ───────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()
    const token = request.cookies.get('admin_session')?.value
    if (!token || !(await verifySessionToken(token))) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── Locale routing (/  and  /vi|en/*) ─────────────────────────────────────
  return handleIntl(request)
}

export const config = {
  // Admin auth + locale routing (detail pages at /[type]/[slug] are excluded)
  matcher: ['/admin/:path*', '/', '/(vi|en)/:path*'],
}
