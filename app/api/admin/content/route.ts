import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/admin/auth'
import { getContent, setContent, type CMSContent, type SupportedLocale } from '@/lib/admin/content'

async function authorize(): Promise<boolean> {
  const store = await cookies()
  const token = store.get('admin_session')?.value
  if (!token) return false
  return (await verifySessionToken(token)) !== null
}

function getLocale(request: Request): SupportedLocale {
  const locale = new URL(request.url).searchParams.get('locale')
  return locale === 'en' ? 'en' : 'vi'
}

export async function GET(request: Request) {
  if (!(await authorize())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(getContent(getLocale(request)))
}

export async function PUT(request: Request) {
  if (!(await authorize())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const locale = getLocale(request)
  const patch = (await request.json()) as Partial<CMSContent>
  const updated: CMSContent = { ...getContent(locale), ...patch }
  setContent(updated, locale)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!(await authorize())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const slug = searchParams.get('slug')
  if ((type !== 'solutions' && type !== 'projects') || !slug) {
    return NextResponse.json({ error: 'Invalid page identifier' }, { status: 400 })
  }

  let deleted = false
  for (const locale of ['vi', 'en'] as const) {
    const content = getContent(locale)
    const detailPages = content.detailPages.filter(
      (page) => page.type !== type || page.slug !== slug,
    )
    if (detailPages.length !== content.detailPages.length) deleted = true
    setContent({ ...content, detailPages }, locale)
  }

  if (!deleted) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
