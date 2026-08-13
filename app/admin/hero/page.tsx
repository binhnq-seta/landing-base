'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSHero, SupportedLocale } from '@/lib/admin/content'
import { Field, PageHeader, SaveBar, SyncLocaleButton, inputCls, LocaleTabs, type SaveStatus, type SyncStatus } from '@/components/admin/shared'

export default function HeroEditorPage() {
  const [locale, setLocale] = useState<SupportedLocale>('vi')
  const [form, setForm] = useState<CMSHero>({
    heading: '',
    description: '',
    ctaLabel: '',
    ctaHref: '',
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
        heading: tgt?.heading?.trim() ? tgt.heading : form.heading,
        description: tgt?.description?.trim() ? tgt.description : form.description,
        ctaLabel: tgt?.ctaLabel?.trim() ? tgt.ctaLabel : form.ctaLabel,
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

  return (
    <div className="p-8">
      <PageHeader title="Hero Section" description="Tiêu đề, mô tả và nút CTA hiển thị đầu trang." />
      <div className="flex items-center justify-between gap-4">
        <LocaleTabs value={locale} onChange={setLocale} />
        <SyncLocaleButton locale={locale} status={syncStatus} onSync={handleSync} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5">
        <Field label="Tiêu đề chính">
          <input className={inputCls} value={form.heading} onChange={set('heading')} required />
        </Field>

        <Field label="Mô tả">
          <textarea
            className={`${inputCls} min-h-28 resize-y`}
            value={form.description}
            onChange={set('description')}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Nhãn nút CTA">
            <input className={inputCls} value={form.ctaLabel} onChange={set('ctaLabel')} required />
          </Field>
          <Field label="Liên kết CTA">
            <input className={inputCls} value={form.ctaHref} onChange={set('ctaHref')} required />
          </Field>
        </div>

        <SaveBar status={status} />
      </form>
    </div>
  )
}
