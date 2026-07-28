import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/admin/auth'
import { getUsers, setUsers, hashPassword, verifyPassword } from '@/lib/admin/users'

const FALLBACK_USER = process.env.ADMIN_USERNAME ?? 'admin'
const FALLBACK_PASS = process.env.ADMIN_PASSWORD ?? 'admin'

async function getUsername(): Promise<string | null> {
  const store = await cookies()
  const token = store.get('admin_session')?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function POST(request: Request) {
  const username = await getUsername()
  if (!username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = (await request.json()) as {
    currentPassword: string
    newPassword: string
  }

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' },
      { status: 400 },
    )
  }

  const users = getUsers()
  let currentOk = false

  if (users.length === 0) {
    currentOk = username === FALLBACK_USER && currentPassword === FALLBACK_PASS
  } else {
    const user = users.find((u) => u.username === username)
    if (user) currentOk = await verifyPassword(currentPassword, user.passwordHash, user.salt)
  }

  if (!currentOk) {
    return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng.' }, { status: 400 })
  }

  const { hash, salt } = await hashPassword(newPassword)
  const rest = users.filter((u) => u.username !== username)
  setUsers([...rest, { username, passwordHash: hash, salt }])

  return NextResponse.json({ ok: true })
}
