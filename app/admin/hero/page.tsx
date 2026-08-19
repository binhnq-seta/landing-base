'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSHero, SupportedLocale } from '@/lib/admin/content'
import { Field, FieldWithSize, PageHeader, SaveBar, SyncLocaleButton, inputCls, LocaleTabs, type SaveStatus, type SyncStatus } from '@/components/admin/shared'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

type StatItem = { value: string; label: string }

export default function HeroEditorPage() {
  const [locale, setLocale] = useState<SupportedLocale>('vi')
  const [form, setForm] = useState<CMSHero>({
    heading: '',
    description: '',
    ctaLabel: '',
    ctaHref: '',
    stats: [],
  })
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

  useEffect(() => {
    fetch(`/api/admin/content?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => setForm(data.hero))
  }, [locale])

  function set(key: keyof CMSHero) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function updateStat(i: number, key: keyof StatItem, value: string) {
    setForm((prev) => ({
      ...prev,
      stats: (prev.stats ?? []).map((s, idx) => idx === i ? { ...s, [key]: value } : s),
    }))
  }

  function addStat() {
    setForm((prev) => ({ ...prev, stats: [...(prev.stats ?? []), { value: '', label: '' }] }))
  }

  function removeStat(i: number) {
    setForm((prev) => ({ ...prev, stats: (prev.stats ?? []).filter((_, idx) => idx !== i) }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch(`/api/admin/content?locale=${locale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero: form }),
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
      const tgt = otherData.hero as CMSHero | undefined
      const merged: CMSHero = {
        ctaHref: form.ctaHref,
        headingSize: form.headingSize,
        heading: tgt?.heading?.trim() ? tgt.heading : form.heading,
        description: tgt?.description?.trim() ? tgt.description : form.description,
        ctaLabel: tgt?.ctaLabel?.trim() ? tgt.ctaLabel : form.ctaLabel,
        stats: (form.stats ?? []).map((src, i) => {
          const t = (tgt?.stats ?? [])[i]
          return { value: src.value, label: t?.label?.trim() ? t.label : src.label }
        }),
      }
      const res = await fetch(`/api/admin/content?locale=${otherLocale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero: merged }),
      })
      if (!res.ok) { setSyncStatus('error'); return }
      setSyncStatus('ok')
    } catch {
      setSyncStatus('error')
    } finally {
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  const stats = form.stats ?? []

  return (
    <div className="p-8">
      <PageHeader title="Hero Section" description="Tiêu đề, mô tả, nút CTA và thống kê hiển thị đầu trang." />
      <div className="flex items-center justify-between gap-4">
        <LocaleTabs value={locale} onChange={setLocale} />
        <SyncLocaleButton locale={locale} status={syncStatus} onSync={handleSync} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5">
        <FieldWithSize label="Tiêu đề chính" size={form.headingSize} onSizeChange={(v) => setForm((p) => ({ ...p, headingSize: v }))} mode="heading">
          <input className={inputCls} value={form.heading} onChange={set('heading')} required />
        </FieldWithSize>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Mô tả</label>
          <RichTextEditor value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Nhãn nút CTA">
            <input className={inputCls} value={form.ctaLabel} onChange={set('ctaLabel')} required />
          </Field>
          <Field label="Liên kết CTA">
            <input className={inputCls} value={form.ctaHref} onChange={set('ctaHref')} required />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Thống kê</p>
          <div className="space-y-2">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <div className="grid flex-1 grid-cols-2 gap-2">
                  <input
                    className={inputCls}
                    placeholder="Giá trị (vd: 200+)"
                    value={stat.value}
                    onChange={(e) => updateStat(i, 'value', e.target.value)}
                  />
                  <input
                    className={inputCls}
                    placeholder="Nhãn (vd: Khách hàng)"
                    value={stat.label}
                    onChange={(e) => updateStat(i, 'label', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeStat(i)}
                  className="shrink-0 text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Xóa
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addStat}
              className="w-full rounded-xl border-2 border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              + Thêm thống kê
            </button>
          </div>
        </div>

        <SaveBar status={status} />
      </form>
    </div>
  )
}
