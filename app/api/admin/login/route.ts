import { NextResponse } from 'next/server'
import { createSessionToken } from '@/lib/admin/auth'
import { getUsers, verifyPassword } from '@/lib/admin/users'

const FALLBACK_USER = process.env.ADMIN_USERNAME ?? 'admin'
const FALLBACK_PASS = process.env.ADMIN_PASSWORD ?? 'admin'

export async function POST(request: Request) {
  const { username, password } = (await request.json()) as {
    username: string
    password: string
  }

  const users = getUsers()
  let ok = false

  if (users.length === 0) {
    ok = username === FALLBACK_USER && password === FALLBACK_PASS
  } else {
    const user = users.find((u) => u.username === username)
    if (user) ok = await verifyPassword(password, user.passwordHash, user.salt)
  }

  if (!ok) {
    return NextResponse.json({ error: 'Sai tên đăng nhập hoặc mật khẩu.' }, { status: 401 })
  }

  const token = await createSessionToken(username)
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
    path: '/',
  })
  return res
}
