'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSShowcaseCorner, SupportedLocale } from '@/lib/admin/content'
import { Field, PageHeader, SaveBar, inputCls, LocaleTabs, type SaveStatus } from '@/components/admin/shared'
import { ImageUploader } from '@/components/admin/ImageUploader'

// Stable display names for each corner id (matches config.ts order)
const CORNER_LABELS: Record<string, string> = {
  integration: 'Góc 1 – TÍCH HỢP',
  security:    'Góc 2 – BẢO MẬT',
  digital:     'Góc 3 – SỐ HOÁ',
  network:     'Góc 4 – HẠ TẦNG MẠNG',
  military:    'Góc 5 – QUỐC PHÒNG',
  telecom:     'Góc 6 – VIỄN THÔNG',
  aviation:    'Góc 7 – HÀNG KHÔNG',
  energy:      'Góc 8 – ĐIỆN LỰC',
}

export default function ShowcaseEditorPage() {
  const [locale, setLocale] = useState<SupportedLocale>('vi')
  const [corners, setCorners] = useState<CMSShowcaseCorner[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')

  useEffect(() => {
    fetch(`/api/admin/content?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.showcaseCorners)) {
          setCorners(data.showcaseCorners)
        }
      })
  }, [locale])

  function updateCorner(id: string, key: keyof Omit<CMSShowcaseCorner, 'id'>, value: string) {
    setCorners((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)),
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch(`/api/admin/content?locale=${locale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showcaseCorners: corners }),
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
        title="Showcase Corners"
        description="Nhãn, phụ nhãn và ảnh hiển thị trên khung khi Rubik cube chiếu sáng vào góc."
      />
      <LocaleTabs value={locale} onChange={setLocale} />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 max-w-5xl">
          {corners.map((corner) => (
            <div key={corner.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                {CORNER_LABELS[corner.id] ?? corner.id}
              </p>

              <div className="space-y-3">
                <Field label="Nhãn (Label)">
                  <input
                    className={inputCls}
                    value={corner.label}
                    onChange={(e) => updateCorner(corner.id, 'label', e.target.value)}
                  />
                </Field>
                <Field label="Phụ nhãn (Sublabel)">
                  <input
                    className={inputCls}
                    value={corner.sublabel}
                    onChange={(e) => updateCorner(corner.id, 'sublabel', e.target.value)}
                  />
                </Field>
                <ImageUploader
                  label="Ảnh"
                  value={corner.image}
                  onChange={(url) => updateCorner(corner.id, 'image', url)}
                  previewClassName="h-20 w-32 object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {corners.length > 0 && <SaveBar status={status} />}
      </form>
    </div>
  )
}
