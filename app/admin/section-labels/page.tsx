'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSSectionLabels, SupportedLocale } from '@/lib/admin/content'
import { inputCls, Field, PageHeader, SaveBar, SyncLocaleButton, LocaleTabs, type SaveStatus, type SyncStatus } from '@/components/admin/shared'

export default function SectionLabelsEditorPage() {
  const [locale, setLocale] = useState<SupportedLocale>('vi')
  const [labels, setLabels] = useState<CMSSectionLabels>({ solutions: '', projects: '', viewMore: '', partners: '' })
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

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

  async function handleSync() {
    setSyncStatus('syncing')
    const otherLocale = locale === 'vi' ? 'en' : 'vi'
    try {
      const otherData = await fetch(`/api/admin/content?locale=${otherLocale}`).then((r) => r.json())
      const tgt = (otherData.sectionLabels ?? {}) as CMSSectionLabels
      const merged: CMSSectionLabels = {
        solutions: tgt.solutions?.trim() ? tgt.solutions : labels.solutions,
        projects: tgt.projects?.trim() ? tgt.projects : labels.projects,
        viewMore: tgt.viewMore?.trim() ? tgt.viewMore : labels.viewMore,
        partners: tgt.partners?.trim() ? tgt.partners : labels.partners,
      }
      const res = await fetch(`/api/admin/content?locale=${otherLocale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionLabels: merged }),
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
        title="Nhãn section"
        description="Tiêu đề hiển thị cho các section Giải pháp, Dự án và nút Xem thêm."
      />
      <div className="flex items-center justify-between gap-4">
        <LocaleTabs value={locale} onChange={setLocale} />
        <SyncLocaleButton locale={locale} status={syncStatus} onSync={handleSync} />
      </div>

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
