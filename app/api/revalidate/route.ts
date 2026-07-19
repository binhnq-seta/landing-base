import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/revalidate?tag=landing-page&secret=<REVALIDATE_SECRET>
 *
 * Configure this as a Strapi webhook (After Publish / After Update).
 * Set REVALIDATE_SECRET in both Next.js and Strapi env vars.
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const tag = req.nextUrl.searchParams.get('tag')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  if (!tag) {
    return NextResponse.json({ message: 'Missing tag param' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(revalidateTag as any)(tag)

  return NextResponse.json({ revalidated: true, tag, now: Date.now() })
}
