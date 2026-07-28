'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSPartner } from '@/lib/admin/content'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { Field, PageHeader, SaveBar, type SaveStatus } from '@/components/admin/shared'

export default function PartnersEditorPage() {
  const [items, setItems] = useState<CMSPartner[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((data: { partners: CMSPartner[] }) => setItems(data.partners))
  }, [])

  function update(i: number, key: keyof CMSPartner, value: string) {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)))
  }

  function add() {
    setItems((prev) => [...prev, { src: '', alt: '' }])
  }

  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partners: items }),
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
        title="Đối tác"
        description="Logo đối tác trong marquee. Upload logo rồi điền alt text."
      />

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Logo #{i + 1}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Xóa
              </button>
            </div>

            <div className="space-y-3">
              <ImageUploader
                label="Logo"
                value={item.src}
                onChange={(url) => update(i, 'src', url)}
                previewClassName="h-14 w-28 object-contain"
              />
              <Field label="Tên công ty (alt text)">
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={item.alt}
                  onChange={(e) => update(i, 'alt', e.target.value)}
                  placeholder="Tên công ty"
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
          + Thêm đối tác
        </button>

        <SaveBar status={status} />
      </form>
    </div>
  )
}
