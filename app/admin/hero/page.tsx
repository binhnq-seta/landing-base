'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSHero } from '@/lib/admin/content'

type Status = 'idle' | 'saving' | 'ok' | 'error'

export default function HeroEditorPage() {
  const [form, setForm] = useState<CMSHero>({
    heading: '',
    description: '',
    ctaLabel: '',
    ctaHref: '',
  })
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((data) => setForm(data.hero))
  }, [])

  function set(key: keyof CMSHero) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch('/api/admin/content', {
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

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5">
        <Field label="Tiêu đề chính">
          <input
            className={inputCls}
            value={form.heading}
            onChange={set('heading')}
            required
          />
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

// ─── Shared helpers ───────────────────────────────────────────────────────────

export const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  )
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-slate-200 pb-5">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  )
}

export function SaveBar({ status }: { status: Status }) {
  return (
    <div className="flex items-center gap-4 pt-2">
      <button
        type="submit"
        disabled={status === 'saving'}
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {status === 'saving' ? 'Đang lưu…' : 'Lưu thay đổi'}
      </button>
      {status === 'ok' && <span className="text-sm font-medium text-green-600">✓ Đã lưu</span>}
      {status === 'error' && <span className="text-sm font-medium text-red-600">✗ Lưu thất bại</span>}
    </div>
  )
}
