'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSFeatures, CMSFeatureItem, SupportedLocale } from '@/lib/admin/content'
import { inputCls, Field, PageHeader, SaveBar, SyncLocaleButton, LocaleTabs, type SaveStatus, type SyncStatus } from '@/components/admin/shared'
import { ImageUploader } from '@/components/admin/ImageUploader'

const BLANK: CMSFeatureItem = { id: '', title: '', description: '', icon: '' }

export default function FeaturesEditorPage() {
  const [locale, setLocale] = useState<SupportedLocale>('vi')
  const [heading, setHeading] = useState('')
  const [items, setItems] = useState<CMSFeatureItem[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

  useEffect(() => {
    fetch(`/api/admin/content?locale=${locale}`)
      .then((r) => r.json())
      .then((data: { features: CMSFeatures }) => {
        setHeading(data.features.heading)
        setItems(data.features.items)
      })
  }, [locale])

  function updateItem(index: number, key: keyof CMSFeatureItem, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { ...BLANK, id: String(prev.length + 1).padStart(2, '0') },
    ])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch(`/api/admin/content?locale=${locale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: { heading, items } }),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    } finally {
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  async function handleSync() {
    setSyncStatus('syncing')
    const otherLocale = locale === 'vi' ? 'en' : 'vi'
    try {
      const otherData = await fetch(`/api/admin/content?locale=${otherLocale}`).then((r) => r.json())
      const tgt = otherData.features as CMSFeatures | undefined
      const merged: CMSFeatures = {
        heading: tgt?.heading?.trim() ? tgt.heading : heading,
        items: items.map((src, i) => {
          const t = tgt?.items?.[i]
          return {
            id: src.id,
            icon: src.icon,
            title: t?.title?.trim() ? t.title : src.title,
            description: t?.description?.trim() ? t.description : src.description,
          }
        }),
      }
      const res = await fetch(`/api/admin/content?locale=${otherLocale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: merged }),
      })
      if (!res.ok) { setSyncStatus('error'); return }
      setSyncStatus('ok')
    } catch {
      setSyncStatus('error')
    } finally {
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  return (
    <div className="p-8">
      <PageHeader title="Vì sao chọn chúng tôi" description="Tiêu đề section và 4 điểm nổi bật của công ty." />
      <div className="flex items-center justify-between gap-4">
        <LocaleTabs value={locale} onChange={setLocale} />
        <SyncLocaleButton locale={locale} status={syncStatus} onSync={handleSync} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-6">
        <Field label="Tiêu đề section">
          <input
            className={inputCls}
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            required
          />
        </Field>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Danh sách điểm nổi bật</span>
            <button
              type="button"
              onClick={addItem}
              className="rounded-lg border border-dashed border-blue-400 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
            >
              + Thêm mục
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-3 mb-3">
                  <Field label="ID">
                    <input
                      className={inputCls}
                      value={item.id}
                      onChange={(e) => updateItem(i, 'id', e.target.value)}
                    />
                  </Field>
                  <Field label="Tiêu đề">
                    <input
                      className={inputCls}
                      value={item.title}
                      onChange={(e) => updateItem(i, 'title', e.target.value)}
                      required
                    />
                  </Field>
                </div>
                <Field label="Mô tả">
                  <textarea
                    className={`${inputCls} min-h-20 resize-y`}
                    value={item.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                  />
                </Field>
                <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-600">Icon</p>
                  {item.icon?.trim().startsWith('<') ? (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="block h-10 w-10 [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: item.icon }} />
                      <span className="text-xs text-slate-400">SVG code đang dùng</span>
                      <button type="button" onClick={() => updateItem(i, 'icon', '')} className="text-xs text-red-400 hover:text-red-600">Xóa</button>
                    </div>
                  ) : null}
                  <ImageUploader
                    label="Tải ảnh lên"
                    value={item.icon?.trim().startsWith('<') ? '' : (item.icon ?? '')}
                    onChange={(url) => updateItem(i, 'icon', url)}
                    previewClassName="h-10 w-10 object-contain"
                  />
                  <p className="my-2 text-center text-xs text-slate-400">— hoặc dán SVG code —</p>
                  <textarea
                    className={`${inputCls} min-h-16 resize-y font-mono text-xs`}
                    placeholder="<svg xmlns=...>...</svg>"
                    value={item.icon?.trim().startsWith('<') ? item.icon : ''}
                    onChange={(e) => updateItem(i, 'icon', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <SaveBar status={status} />
      </form>
    </div>
  )
}
