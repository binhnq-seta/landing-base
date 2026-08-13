import path from 'node:path'
import { readFile } from 'node:fs/promises'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const SAFE_FILENAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/

const CONTENT_TYPES: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params

  if (!SAFE_FILENAME.test(filename)) {
    return new Response('Not found', { status: 404 })
  }

  const contentType = CONTENT_TYPES[path.extname(filename).toLowerCase()]
  if (!contentType) {
    return new Response('Not found', { status: 404 })
  }

  try {
    const file = await readFile(path.join(UPLOAD_DIR, filename))

    return new Response(new Uint8Array(file), {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(file.byteLength),
        'Content-Security-Policy': "default-src 'none'; sandbox",
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code !== 'ENOENT') {
      console.error('[uploads] readFile failed:', error)
    }
    return new Response('Not found', { status: 404 })
  }
}
