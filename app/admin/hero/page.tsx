'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSHero } from '@/lib/admin/content'
import { Field, PageHeader, SaveBar, inputCls, LocaleTabs } from '@/components/admin/shared'
import type { SupportedLocale } from '@/lib/admin/content'

type Status = 'idle' | 'saving' | 'ok' | 'error'

export default function HeroEditorPage() {
  const [locale, setLocale] = useState<SupportedLocale>('vi')
  const [form, setForm] = useState<CMSHero>({
    heading: '',
    description: '',
    ctaLabel: '',
    ctaHref: '',
  })
  const [status, setStatus] = useState<Status>('idle')

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

  return (
    <div className="p-8">
      <PageHeader title="Hero Section" description="Tiêu đề, mô tả và nút CTA hiển thị đầu trang." />
      <LocaleTabs value={locale} onChange={setLocale} />

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
