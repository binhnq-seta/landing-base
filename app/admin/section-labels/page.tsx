'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSSectionLabels, SupportedLocale } from '@/lib/admin/content'
import { inputCls, Field, PageHeader, SaveBar, LocaleTabs, type SaveStatus } from '@/components/admin/shared'

export default function SectionLabelsEditorPage() {
  const [locale, setLocale] = useState<SupportedLocale>('vi')
  const [labels, setLabels] = useState<CMSSectionLabels>({ solutions: '', projects: '', viewMore: '', partners: '' })
  const [status, setStatus] = useState<SaveStatus>('idle')

  useEffect(() => {
    fetch(`/api/admin/content?locale=${locale}`)
      .then((r) => r.json())
      .then((data: { sectionLabels: CMSSectionLabels }) => {
        setLabels(data.sectionLabels)
      })
  }, [locale])

  function update(key: keyof CMSSectionLabels, value: string) {
    setLabels((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch(`/api/admin/content?locale=${locale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionLabels: labels }),
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
        title="Nhãn section"
        description="Tiêu đề hiển thị cho các section Giải pháp, Dự án và nút Xem thêm."
      />
      <LocaleTabs value={locale} onChange={setLocale} />

      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
        <Field label="Tiêu đề section Giải pháp">
          <input
            className={inputCls}
            value={labels.solutions}
            onChange={(e) => update('solutions', e.target.value)}
            required
          />
        </Field>

        <Field label="Tiêu đề section Dự án">
          <input
            className={inputCls}
            value={labels.projects}
            onChange={(e) => update('projects', e.target.value)}
            required
          />
        </Field>

        <Field label='Nhãn nút "Xem thêm"'>
          <input
            className={inputCls}
            value={labels.viewMore}
            onChange={(e) => update('viewMore', e.target.value)}
            required
          />
        </Field>

        <SaveBar status={status} />
      </form>
    </div>
  )
}
