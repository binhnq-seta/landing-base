'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSPartner, CMSSectionLabels, SupportedLocale } from '@/lib/admin/content'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { inputCls, Field, FieldWithSize, PageHeader, SaveBar, SyncLocaleButton, LocaleTabs, type SaveStatus, type SyncStatus } from '@/components/admin/shared'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

export default function PartnersEditorPage() {
  const [locale, setLocale] = useState<SupportedLocale>('vi')
  const [heading, setHeading] = useState('')
  const [headingSize, setHeadingSize] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState('')
  const [sectionLabels, setSectionLabels] = useState<CMSSectionLabels>({ solutions: '', projects: '', viewMore: '', partners: '' })
  const [items, setItems] = useState<CMSPartner[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

  useEffect(() => {
    fetch(`/api/admin/content?locale=${locale}`)
      .then((r) => r.json())
      .then((data: { partners: CMSPartner[]; sectionLabels: CMSSectionLabels; partnerDescription?: string; partnerHeadingSize?: string }) => {
        setItems(data.partners)
        setSectionLabels(data.sectionLabels)
        setHeading(data.sectionLabels.partners)
        setDescription(data.partnerDescription ?? '')
        setHeadingSize(data.partnerHeadingSize)
      })
  }, [locale])

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
      const res = await fetch(`/api/admin/content?locale=${locale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partners: items,
          partnerDescription: description,
          partnerHeadingSize: headingSize,
          sectionLabels: { ...sectionLabels, partners: heading },
        }),
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
      const tgtItems = (otherData.partners ?? []) as CMSPartner[]
      const tgtLabels = (otherData.sectionLabels ?? {}) as CMSSectionLabels
      const tgtDescription = (otherData.partnerDescription ?? '') as string
      const mergedItems: CMSPartner[] = items.map((src, i) => {
        const t = tgtItems[i]
        return {
          src: src.src,
          alt: t?.alt?.trim() ? t.alt : src.alt,
        }
      })
      const res = await fetch(`/api/admin/content?locale=${otherLocale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partners: mergedItems,
          partnerDescription: tgtDescription.trim() ? tgtDescription : description,
          partnerHeadingSize: headingSize,
          sectionLabels: { ...tgtLabels, partners: tgtLabels.partners?.trim() ? tgtLabels.partners : heading },
        }),
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
      <PageHeader
        title="Đối tác"
        description="Logo đối tác trong marquee. Upload logo rồi điền alt text."
      />
      <div className="flex items-center justify-between gap-4">
        <LocaleTabs value={locale} onChange={setLocale} />
        <SyncLocaleButton locale={locale} status={syncStatus} onSync={handleSync} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-3">
        <FieldWithSize label="Tiêu đề section" size={headingSize} onSizeChange={setHeadingSize} mode="heading">
          <input className={inputCls} value={heading} onChange={(e) => setHeading(e.target.value)} required />
        </FieldWithSize>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Mô tả</label>
          <RichTextEditor value={description} onChange={setDescription} minHeight="min-h-20" />
        </div>

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
