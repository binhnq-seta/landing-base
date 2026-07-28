'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { CMSDetailPage, CMSDetailSection } from '@/lib/admin/content'
import { detailPages } from '@/lib/detail-pages'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { inputCls, Field, SaveBar, type SaveStatus } from '@/components/admin/shared'
import { DetailPagePreview } from '@/components/admin/DetailPagePreview'

const EMPTY_SECTION: CMSDetailSection = {
  title: '',
  description: '',
  image: '',
  imageAlt: '',
  imagePosition: 'auto',
  imageStyle: 'cover',
}

const TEMPLATES = [
  { label: '1 ảnh', count: 1 },
  { label: '2 ảnh', count: 2 },
  { label: '3 ảnh', count: 3 },
  { label: '4 ảnh', count: 4 },
  { label: '5 ảnh', count: 5 },
]

export default function DetailPageEditor() {
  const params = useParams()
  const id = params.id as string
  const [rawType, slug] = id.split('--')
  const type = rawType as 'solutions' | 'projects'

  const [page, setPage] = useState<CMSDetailPage | null>(null)
  const [allPages, setAllPages] = useState<CMSDetailPage[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const hardcoded = detailPages.find((p) => p.type === type && p.slug === slug)

    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((data: { detailPages?: CMSDetailPage[] }) => {
        const cmsPages = data.detailPages ?? []
        setAllPages(cmsPages)
        const cmsPage = cmsPages.find((p) => p.type === type && p.slug === slug)
        if (cmsPage) {
          setPage(cmsPage)
        } else if (hardcoded) {
          setPage({
            type: hardcoded.type,
            slug: hardcoded.slug,
            eyebrow: hardcoded.eyebrow,
            title: hardcoded.title,
            summary: hardcoded.summary,
            heroImage: hardcoded.heroImage,
            heroImageAlt: hardcoded.heroImageAlt,
            sections: hardcoded.sections.map((s) => ({
              title: s.title,
              description: s.description,
              image: s.image,
              imageAlt: s.imageAlt,
              imagePosition: 'auto' as const,
              imageStyle: 'cover' as const,
            })),
          })
        }
      })
  }, [type, slug])

  function updatePage<K extends keyof CMSDetailPage>(key: K, value: CMSDetailPage[K]) {
    setPage((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  function updateSection(i: number, key: keyof CMSDetailSection, value: string) {
    setPage((prev) => {
      if (!prev) return prev
      const sections = [...prev.sections]
      sections[i] = { ...sections[i], [key]: value }
      return { ...prev, sections }
    })
  }

  function addSection() {
    setPage((prev) => {
      if (!prev) return prev
      return { ...prev, sections: [...prev.sections, { ...EMPTY_SECTION }] }
    })
  }

  function removeSection(i: number) {
    setPage((prev) => {
      if (!prev) return prev
      return { ...prev, sections: prev.sections.filter((_, idx) => idx !== i) }
    })
  }

  function moveSection(i: number, dir: -1 | 1) {
    setPage((prev) => {
      if (!prev) return prev
      const sections = [...prev.sections]
      const j = i + dir
      if (j < 0 || j >= sections.length) return prev
      ;[sections[i], sections[j]] = [sections[j], sections[i]]
      return { ...prev, sections }
    })
  }

  function applyTemplate(count: number) {
    if (!page) return
    const current = page.sections.length
    if (current === count) return
    if (current > count) {
      if (!window.confirm(`Giảm từ ${current} xuống ${count} mục? ${current - count} mục cuối sẽ bị xoá.`)) return
      setPage((prev) => prev ? { ...prev, sections: prev.sections.slice(0, count) } : prev)
    } else {
      const toAdd = count - current
      const empties = Array.from({ length: toAdd }, () => ({ ...EMPTY_SECTION }))
      setPage((prev) => prev ? { ...prev, sections: [...prev.sections, ...empties] } : prev)
    }
  }

  function applyFreeTemplate() {
    if (!page) return
    if (page.sections.length > 0) {
      if (!window.confirm('Xoá tất cả mục để bắt đầu tự do từ đầu?')) return
    }
    setPage((prev) => prev ? { ...prev, sections: [] } : prev)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!page) return
    setStatus('saving')
    try {
      const idx = allPages.findIndex((p) => p.type === page.type && p.slug === page.slug)
      const updatedPages =
        idx >= 0 ? allPages.map((p, i) => (i === idx ? page : p)) : [...allPages, page]
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detailPages: updatedPages }),
      })
      if (res.ok) setAllPages(updatedPages)
      setStatus(res.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    } finally {
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  if (!page) {
    return <div className="p-8 text-sm text-slate-500">Đang tải…</div>
  }

  return (
    <>
      {showPreview && (
        <DetailPagePreview page={page} onClose={() => setShowPreview(false)} />
      )}

    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/detail-pages" className="text-sm text-blue-600 hover:underline">
            ← Trang chi tiết
          </Link>
          <h1 className="mt-2 text-xl font-bold text-slate-800">{page.title}</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {page.type} / {page.slug}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 10C3.732 5.943 6.524 3 10 3s6.268 2.943 7.542 7c-1.274 4.057-4.066 7-7.542 7S3.732 14.057 2.458 10z" />
            <circle cx="10" cy="10" r="2.5" strokeLinecap="round" />
          </svg>
          Xem trước
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* General info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Thông tin chung
          </h2>
          <Field label="Eyebrow (nhãn nhỏ phía trên tiêu đề)">
            <input
              className={inputCls}
              value={page.eyebrow}
              onChange={(e) => updatePage('eyebrow', e.target.value)}
            />
          </Field>
          <Field label="Tiêu đề trang">
            <input
              className={inputCls}
              value={page.title}
              onChange={(e) => updatePage('title', e.target.value)}
              required
            />
          </Field>
          <Field label="Tóm tắt">
            <textarea
              className={`${inputCls} min-h-24 resize-y`}
              value={page.summary}
              onChange={(e) => updatePage('summary', e.target.value)}
            />
          </Field>
          <ImageUploader
            label="Ảnh hero"
            value={page.heroImage}
            onChange={(url) => updatePage('heroImage', url)}
            previewClassName="h-32 w-52 object-cover"
          />
          <Field label="Alt text ảnh hero">
            <input
              className={inputCls}
              value={page.heroImageAlt}
              onChange={(e) => updatePage('heroImageAlt', e.target.value)}
            />
          </Field>
        </div>

        {/* Sections header + template picker */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-700">
                Các mục nội dung
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                  {page.sections.length} mục
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Dùng ↑↓ để sắp xếp thứ tự hiển thị
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Nhanh:</span>
              {TEMPLATES.map((t) => (
                <button
                  key={t.count}
                  type="button"
                  onClick={() => applyTemplate(t.count)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    page.sections.length === t.count
                      ? 'border-blue-300 bg-blue-50 text-blue-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
              <button
                type="button"
                onClick={applyFreeTemplate}
                className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-100 transition-colors"
              >
                Tự do
              </button>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {page.sections.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-center">
            <p className="text-sm text-slate-400">Chưa có mục nào.</p>
            <p className="mt-1 text-xs text-slate-300">
              Chọn template nhanh phía trên hoặc nhấn &quot;+ Thêm mục&quot; bên dưới.
            </p>
          </div>
        )}

        {/* Section cards */}
        {page.sections.map((section, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Mục {i + 1}
              </h2>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => moveSection(i, -1)}
                  disabled={i === 0}
                  title="Di chuyển lên"
                  className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M8 3l5 5H3l5-5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(i, 1)}
                  disabled={i === page.sections.length - 1}
                  title="Di chuyển xuống"
                  className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M8 13l-5-5h10l-5 5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(i)}
                  title="Xoá mục này"
                  className="ml-2 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-100"
                >
                  Xoá
                </button>
              </div>
            </div>

            <Field label="Tiêu đề mục">
              <input
                className={inputCls}
                value={section.title}
                onChange={(e) => updateSection(i, 'title', e.target.value)}
              />
            </Field>
            <Field label="Nội dung">
              <textarea
                className={`${inputCls} min-h-24 resize-y`}
                value={section.description}
                onChange={(e) => updateSection(i, 'description', e.target.value)}
              />
            </Field>
            <ImageUploader
              label="Ảnh mục"
              value={section.image}
              onChange={(url) => updateSection(i, 'image', url)}
            />
            <Field label="Alt text ảnh">
              <input
                className={inputCls}
                value={section.imageAlt}
                onChange={(e) => updateSection(i, 'imageAlt', e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vị trí ảnh">
                <select
                  className={inputCls}
                  value={section.imagePosition ?? 'auto'}
                  onChange={(e) => updateSection(i, 'imagePosition', e.target.value)}
                >
                  <option value="auto">Tự động (xen kẽ)</option>
                  <option value="left">Trái</option>
                  <option value="right">Phải</option>
                </select>
              </Field>
              <Field label="Kiểu ảnh">
                <select
                  className={inputCls}
                  value={section.imageStyle ?? 'cover'}
                  onChange={(e) => updateSection(i, 'imageStyle', e.target.value)}
                >
                  <option value="cover">Cover (lấp đầy 4:3)</option>
                  <option value="contain">Contain (vừa khung)</option>
                  <option value="portrait">Portrait (dọc 3:4)</option>
                  <option value="wide">Wide (ngang 16:9)</option>
                </select>
              </Field>
            </div>
          </div>
        ))}

        {/* Add section */}
        <button
          type="button"
          onClick={addSection}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white py-4 text-sm font-medium text-slate-400 transition-colors hover:border-blue-300 hover:text-blue-600"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" />
          </svg>
          Thêm mục
        </button>

        <SaveBar status={status} />
      </form>
    </div>
    </>
  )
}
