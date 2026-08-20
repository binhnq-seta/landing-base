'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { CMSDetailPage } from '@/lib/admin/content'
import { PageHeader } from '@/components/admin/shared'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

type SourceItem = { slug: string; title: string }

export default function DetailPagesListPage() {
  const [cmsPages, setCmsPages] = useState<CMSDetailPage[]>([])
  const [sourceTitles, setSourceTitles] = useState<Record<string, string>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/content?locale=vi')
      .then((r) => r.json())
      .then((data: { detailPages?: CMSDetailPage[]; solutions?: SourceItem[]; projects?: SourceItem[] }) => {
        setCmsPages(data.detailPages ?? [])
        const map: Record<string, string> = {}
        for (const s of data.solutions ?? []) map[`solutions--${s.slug}`] = s.title
        for (const p of data.projects ?? []) map[`projects--${p.slug}`] = p.title
        setSourceTitles(map)
      })
  }, [])

  function getTitle(type: string, slug: string, fallback: string) {
    return sourceTitles[`${type}--${slug}`] || stripHtml(fallback)
  }

  async function deletePage(page: CMSDetailPage) {
    const title = sourceTitles[`${page.type}--${page.slug}`] || stripHtml(page.title) || page.slug
    if (!window.confirm(`Xóa vĩnh viễn trang “${title}” ở cả Tiếng Việt và English?`)) return

    const id = `${page.type}--${page.slug}`
    setDeletingId(id)
    setError('')
    try {
      const params = new URLSearchParams({ type: page.type, slug: page.slug })
      const response = await fetch(`/api/admin/content?${params}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Delete failed')
      setCmsPages((pages) => pages.filter((item) => item.type !== page.type || item.slug !== page.slug))
    } catch {
      setError('Không thể xóa trang. Vui lòng thử lại.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Trang chi tiết"
        description="Chỉnh sửa nội dung từng trang chi tiết giải pháp / dự án."
      />
      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
      <div className="mt-6 max-w-2xl space-y-2">
        {cmsPages.map((page) => {
          const id = `${page.type}--${page.slug}`
          const typeLabel = page.type === 'solutions' ? 'Giải pháp' : 'Dự án'
          return (
            <div
              key={id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-blue-300 hover:shadow"
            >
              <Link href={`/admin/detail-pages/${id}`} className="min-w-0 flex-1">
                <span className="mb-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                  {typeLabel}
                </span>
                <p className="font-medium text-slate-800">{getTitle(page.type, page.slug, page.title)}</p>
                <p className="text-xs text-slate-400">{page.slug}</p>
              </Link>
              <div className="ml-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => deletePage(page)}
                  disabled={deletingId === id}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === id ? 'Đang xóa…' : 'Xóa'}
                </button>
                <Link href={`/admin/detail-pages/${id}`} aria-label={`Chỉnh sửa ${getTitle(page.type, page.slug, page.title)}`}>
                  <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              </div>
            </div>
          )
        })}
        {cmsPages.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
            Chưa có trang chi tiết nào.
          </p>
        )}
      </div>
    </div>
  )
}
