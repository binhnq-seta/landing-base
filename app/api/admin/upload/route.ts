import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/admin/auth'
import { writeFile, mkdir, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

async function authorize(): Promise<boolean> {
  const store = await cookies()
  const token = store.get('admin_session')?.value
  if (!token) return false
  return (await verifySessionToken(token)) !== null
}

export async function POST(request: Request) {
  if (!(await authorize())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Không có file được gửi lên.' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Chỉ chấp nhận file ảnh (JPG, PNG, WebP, GIF, SVG).' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File quá lớn. Giới hạn 10 MB.' }, { status: 400 })
  }

  let buffer: Buffer
  try {
    buffer = Buffer.from(await file.arrayBuffer())
  } catch {
    return NextResponse.json({ error: 'Không thể đọc file.' }, { status: 400 })
  }

  const ext = path.extname(file.name).toLowerCase() || '.jpg'
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')

  try {
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    await writeFile(path.join(uploadDir, name), buffer)
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[upload] writeFile failed:', detail)
    return NextResponse.json(
      { error: 'Không thể lưu file trên server. Kiểm tra quyền thư mục public/uploads.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ url: `/uploads/${name}` })
}

export async function DELETE(request: Request) {
  if (!(await authorize())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { url } = await request.json() as { url?: string }
  if (!url || !url.startsWith('/uploads/')) {
    return NextResponse.json({ error: 'Chỉ xóa được file trong /uploads/.' }, { status: 400 })
  }

  // Prevent path traversal: filename must not contain directory separators
  const filename = path.basename(url)
  if (!filename || filename !== url.slice('/uploads/'.length)) {
    return NextResponse.json({ error: 'Tên file không hợp lệ.' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'public', 'uploads', filename)
  try {
    await unlink(filePath)
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return NextResponse.json({ ok: true }) // already gone
    return NextResponse.json({ error: 'Không thể xóa file.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
