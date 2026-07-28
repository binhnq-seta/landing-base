import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/admin/auth'
import { getUsers, setUsers, hashPassword } from '@/lib/admin/users'

async function authorize(): Promise<boolean> {
  const store = await cookies()
  const token = store.get('admin_session')?.value
  if (!token) return false
  return (await verifySessionToken(token)) !== null
}

export async function GET() {
  if (!(await authorize())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const usernames = getUsers().map((u) => u.username)
  return NextResponse.json({ usernames })
}

export async function POST(request: Request) {
  if (!(await authorize())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username, password } = (await request.json()) as { username: string; password: string }

  if (!username || !password || password.length < 6) {
    return NextResponse.json({ error: 'Username và mật khẩu (≥6 ký tự) là bắt buộc.' }, { status: 400 })
  }

  const users = getUsers()
  if (users.some((u) => u.username === username)) {
    return NextResponse.json({ error: 'Tên đăng nhập đã tồn tại.' }, { status: 409 })
  }

  const { hash, salt } = await hashPassword(password)
  setUsers([...users, { username, passwordHash: hash, salt }])
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!(await authorize())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = (await request.json()) as { username: string }
  const users = getUsers()

  if (users.length <= 1) {
    return NextResponse.json({ error: 'Không thể xóa user duy nhất.' }, { status: 400 })
  }

  setUsers(users.filter((u) => u.username !== username))
  return NextResponse.json({ ok: true })
}
