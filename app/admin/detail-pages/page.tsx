'use client'

import Link from 'next/link'
import { detailPages } from '@/lib/detail-pages'
import { PageHeader } from '@/components/admin/shared'

export default function DetailPagesListPage() {
  return (
    <div className="p-8">
      <PageHeader
        title="Trang chi tiết"
        description="Chỉnh sửa nội dung từng trang chi tiết giải pháp / dự án."
      />
      <div className="mt-6 max-w-2xl space-y-2">
        {detailPages.map((page) => {
          const id = `${page.type}--${page.slug}`
          const typeLabel = page.type === 'solutions' ? 'Giải pháp' : 'Dự án'
          return (
            <Link
              key={id}
              href={`/admin/detail-pages/${id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-blue-300 hover:shadow"
            >
              <div>
                <span className="mb-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                  {typeLabel}
                </span>
                <p className="font-medium text-slate-800">{page.title}</p>
                <p className="text-xs text-slate-400">{page.slug}</p>
              </div>
              <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
