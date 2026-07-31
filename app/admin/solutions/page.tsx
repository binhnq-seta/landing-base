'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSSolution, CMSSectionLabels, SupportedLocale } from '@/lib/admin/content'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { inputCls, Field, PageHeader, SaveBar, LocaleTabs, type SaveStatus } from '@/components/admin/shared'

const BLANK: CMSSolution = { slug: '', title: '', src: '', alt: '', desc: '' }

export default function SolutionsEditorPage() {
  const [locale, setLocale] = useState<SupportedLocale>('vi')
  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionLabels, setSectionLabels] = useState<CMSSectionLabels>({ solutions: '', projects: '', viewMore: '', partners: '' })
  const [items, setItems] = useState<CMSSolution[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')

  useEffect(() => {
    fetch(`/api/admin/content?locale=${locale}`)
      .then((r) => r.json())
      .then((data: { solutions: CMSSolution[]; sectionLabels: CMSSectionLabels }) => {
        setItems(data.solutions)
        setSectionLabels(data.sectionLabels)
        setSectionTitle(data.sectionLabels.solutions)
      })
  }, [locale])

  function update(i: number, key: keyof CMSSolution, value: string) {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)))
  }

  function add() {
    setItems((prev) => [...prev, { ...BLANK }])
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
        body: JSON.stringify({ solutions: items, sectionLabels: { ...sectionLabels, solutions: sectionTitle } }),
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
      <PageHeader
        title="Giải pháp"
        description="Danh sách 6 giải pháp trong grid. Slug dùng cho URL trang chi tiết."
      />
      <LocaleTabs value={locale} onChange={setLocale} />

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-4">
        <Field label="Tiêu đề section">
          <input
            className={inputCls}
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            required
          />
        </Field>

        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Giải pháp #{i + 1}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Xóa
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tiêu đề">
                  <input className={inputCls} value={item.title} onChange={(e) => update(i, 'title', e.target.value)} required />
                </Field>
                <Field label="Slug (URL)">
                  <input className={inputCls} value={item.slug} onChange={(e) => update(i, 'slug', e.target.value)} required placeholder="vd: giai-phap-tich-hop" />
                </Field>
              </div>

              <ImageUploader
                label="Ảnh đại diện"
                value={item.src}
                onChange={(url) => update(i, 'src', url)}
              />

              <Field label="Alt text">
                <input className={inputCls} value={item.alt} onChange={(e) => update(i, 'alt', e.target.value)} />
              </Field>

              <Field label="Mô tả ngắn">
                <textarea
                  className={`${inputCls} min-h-20 resize-y`}
                  value={item.desc}
                  onChange={(e) => update(i, 'desc', e.target.value)}
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
          + Thêm giải pháp
        </button>

        <SaveBar status={status} />
      </form>
    </div>
  )
}
