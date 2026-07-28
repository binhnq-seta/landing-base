import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/admin/auth'
import { getContent, setContent, type CMSContent } from '@/lib/admin/content'

async function authorize(): Promise<boolean> {
  const store = await cookies()
  const token = store.get('admin_session')?.value
  if (!token) return false
  return (await verifySessionToken(token)) !== null
}

export async function GET() {
  if (!(await authorize())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(getContent())
}

export async function PUT(request: Request) {
  if (!(await authorize())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const patch = (await request.json()) as Partial<CMSContent>
  const updated: CMSContent = { ...getContent(), ...patch }
  setContent(updated)
  return NextResponse.json({ ok: true })
}
