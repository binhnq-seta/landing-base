'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { CMSDetailPage, CMSDetailSection } from '@/lib/admin/content'
import { detailPages } from '@/lib/detail-pages'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { inputCls, Field, SaveBar, type SaveStatus } from '@/components/admin/shared'

export default function DetailPageEditor() {
  const params = useParams()
  const id = params.id as string
  const [rawType, slug] = id.split('--')
  const type = rawType as 'solutions' | 'projects'

  const [page, setPage] = useState<CMSDetailPage | null>(null)
  const [allPages, setAllPages] = useState<CMSDetailPage[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')

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
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/detail-pages" className="text-sm text-blue-600 hover:underline">
          ← Trang chi tiết
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-800">{page.title}</h1>
        <p className="mt-0.5 text-xs text-slate-400">
          {page.type} / {page.slug}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
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

        {page.sections.map((section, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Mục {i + 1}
            </h2>
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

        <SaveBar status={status} />
      </form>
    </div>
  )
}
