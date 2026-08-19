'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSFooter, SupportedLocale } from '@/lib/admin/content'
import {
  Field, FieldWithSize, PageHeader, SaveBar, SyncLocaleButton,
  LocaleTabs, inputCls, type SaveStatus, type SyncStatus,
} from '@/components/admin/shared'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

const BLANK: CMSFooter = {
  companyName: '', address1: '', address2: '',
  phone: '', email: '', website: '', websiteHref: '',
  colSolutions: '', colProjects: '', copyright: '',
}

export default function FooterEditorPage() {
  const [locale, setLocale] = useState<SupportedLocale>('vi')
  const [form, setForm] = useState<CMSFooter>(BLANK)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

  useEffect(() => {
    fetch(`/api/admin/content?locale=${locale}`)
      .then((r) => r.json())
      .then((data: { footer: CMSFooter }) => setForm(data.footer))
  }, [locale])

  function set(key: keyof CMSFooter) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function setSize(key: keyof CMSFooter) {
    return (v: string) => setForm((prev) => ({ ...prev, [key]: v }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch(`/api/admin/content?locale=${locale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ footer: form }),
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
      const tgt = otherData.footer as CMSFooter | undefined
      const merged: CMSFooter = {
        // Template / same both locales → always from source
        phone: form.phone,
        email: form.email,
        website: form.website,
        websiteHref: form.websiteHref,
        companyNameSize: form.companyNameSize,
        contactSize: form.contactSize,
        colTitleSize: form.colTitleSize,
        bodySize: form.bodySize,
        copyrightSize: form.copyrightSize,
        // Translatable → keep target if non-empty
        companyName: tgt?.companyName?.trim() ? tgt.companyName : form.companyName,
        address1: tgt?.address1?.trim() ? tgt.address1 : form.address1,
        address2: tgt?.address2?.trim() ? tgt.address2 : form.address2,
        colSolutions: tgt?.colSolutions?.trim() ? tgt.colSolutions : form.colSolutions,
        colProjects: tgt?.colProjects?.trim() ? tgt.colProjects : form.colProjects,
        copyright: tgt?.copyright?.trim() ? tgt.copyright : form.copyright,
      }
      const res = await fetch(`/api/admin/content?locale=${otherLocale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ footer: merged }),
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
      <PageHeader title="Footer" description="Thông tin công ty, liên hệ và cỡ chữ từng phần trong footer." />
      <div className="flex items-center justify-between gap-4">
        <LocaleTabs value={locale} onChange={setLocale} />
        <SyncLocaleButton locale={locale} status={syncStatus} onSync={handleSync} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5">

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Thông tin công ty</p>
          <FieldWithSize label="Tên công ty" size={form.companyNameSize} onSizeChange={setSize('companyNameSize')} mode="text">
            <input className={inputCls} value={form.companyName} onChange={set('companyName')} required />
          </FieldWithSize>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Địa chỉ 1</label>
            <RichTextEditor value={form.address1} onChange={(v) => setForm((p) => ({ ...p, address1: v }))} minHeight="min-h-12" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Địa chỉ 2</label>
            <RichTextEditor value={form.address2} onChange={(v) => setForm((p) => ({ ...p, address2: v }))} minHeight="min-h-12" />
          </div>
          <FieldWithSize label="Cỡ chữ liên hệ (SĐT / Email / Website)" size={form.contactSize} onSizeChange={setSize('contactSize')} mode="text">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Số điện thoại">
                  <input className={inputCls} value={form.phone} onChange={set('phone')} />
                </Field>
                <Field label="Email">
                  <input className={inputCls} value={form.email} onChange={set('email')} type="email" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Website (hiển thị)">
                  <input className={inputCls} value={form.website} onChange={set('website')} />
                </Field>
                <Field label="Website (href)">
                  <input className={inputCls} value={form.websiteHref ?? ''} onChange={set('websiteHref')} />
                </Field>
              </div>
            </div>
          </FieldWithSize>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Cột điều hướng</p>
          <FieldWithSize label="Tiêu đề cột" size={form.colTitleSize} onSizeChange={setSize('colTitleSize')} mode="text">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tiêu đề cột Giải pháp">
                <input className={inputCls} value={form.colSolutions} onChange={set('colSolutions')} required />
              </Field>
              <Field label="Tiêu đề cột Dự án">
                <input className={inputCls} value={form.colProjects} onChange={set('colProjects')} required />
              </Field>
            </div>
          </FieldWithSize>
          <FieldWithSize label="Nội dung danh sách link" size={form.bodySize} onSizeChange={setSize('bodySize')} mode="text">
            <p className="text-xs text-slate-400">Link lấy tự động từ dữ liệu Giải pháp / Dự án.</p>
          </FieldWithSize>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Copyright</p>
          <FieldWithSize label="Nội dung copyright" size={form.copyrightSize} onSizeChange={setSize('copyrightSize')} mode="text">
            <input className={inputCls} value={form.copyright} onChange={set('copyright')} required />
          </FieldWithSize>
        </div>

        <SaveBar status={status} />
      </form>
    </div>
  )
}
