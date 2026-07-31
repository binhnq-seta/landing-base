'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSProject, CMSSectionLabels, SupportedLocale } from '@/lib/admin/content'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { inputCls, Field, PageHeader, SaveBar, LocaleTabs, type SaveStatus } from '@/components/admin/shared'

const BLANK: CMSProject = { id: '', slug: '', category: '', title: '', img: '', description: '' }

export default function ProjectsEditorPage() {
  const [locale, setLocale] = useState<SupportedLocale>('vi')
  const [sectionTitle, setSectionTitle] = useState('')
  const [viewMoreLabel, setViewMoreLabel] = useState('')
  const [sectionLabels, setSectionLabels] = useState<CMSSectionLabels>({ solutions: '', projects: '', viewMore: '', partners: '' })
  const [items, setItems] = useState<CMSProject[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')

  useEffect(() => {
    fetch(`/api/admin/content?locale=${locale}`)
      .then((r) => r.json())
      .then((data: { projects: CMSProject[]; sectionLabels: CMSSectionLabels }) => {
        setItems(data.projects)
        setSectionLabels(data.sectionLabels)
        setSectionTitle(data.sectionLabels.projects)
        setViewMoreLabel(data.sectionLabels.viewMore)
      })
  }, [locale])

  function update(i: number, key: keyof CMSProject, value: string) {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)))
  }

  function add() {
    const nextId = String(items.length + 1).padStart(2, '0')
    setItems((prev) => [...prev, { ...BLANK, id: nextId }])
  }

  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch(`/api/admin/content?locale=${locale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: items, sectionLabels: { ...sectionLabels, projects: sectionTitle, viewMore: viewMoreLabel } }),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    } finally {
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div className="p-8">
      <PageHeader title="Dự án tiêu biểu" description="Danh sách dự án trong carousel. Slug dùng cho URL trang chi tiết." />
      <LocaleTabs value={locale} onChange={setLocale} />

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tiêu đề section">
            <input className={inputCls} value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} required />
          </Field>
          <Field label='Nhãn nút "Xem thêm"'>
            <input className={inputCls} value={viewMoreLabel} onChange={(e) => setViewMoreLabel(e.target.value)} required />
          </Field>
        </div>

        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Dự án #{i + 1}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Xóa
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Field label="ID">
                  <input className={inputCls} value={item.id} onChange={(e) => update(i, 'id', e.target.value)} />
                </Field>
                <Field label="Slug (URL)">
                  <input className={inputCls} value={item.slug} onChange={(e) => update(i, 'slug', e.target.value)} required />
                </Field>
                <Field label="Khách hàng">
                  <input className={inputCls} value={item.category} onChange={(e) => update(i, 'category', e.target.value)} />
                </Field>
              </div>

              <Field label="Tên dự án">
                <input className={inputCls} value={item.title} onChange={(e) => update(i, 'title', e.target.value)} required />
              </Field>

              <ImageUploader
                label="Ảnh dự án"
                value={item.img}
                onChange={(url) => update(i, 'img', url)}
              />

              <Field label="Mô tả">
                <textarea
                  className={`${inputCls} min-h-24 resize-y`}
                  value={item.description}
                  onChange={(e) => update(i, 'description', e.target.value)}
                />
              </Field>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          className="w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Thêm dự án
        </button>

        <SaveBar status={status} />
      </form>
    </div>
  )
}
