'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { CMSCoreValues, CMSCoreValue } from '@/lib/admin/content'
import { inputCls, Field, PageHeader, SaveBar } from '../hero/page'

type Status = 'idle' | 'saving' | 'ok' | 'error'

const BLANK: CMSCoreValue = { id: '', title: '', description: '' }

export default function CoreValuesEditorPage() {
  const [heading, setHeading] = useState('')
  const [items, setItems] = useState<CMSCoreValue[]>([])
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((data: { coreValues: CMSCoreValues }) => {
        setHeading(data.coreValues.heading)
        setItems(data.coreValues.items)
      })
  }, [])

  function updateItem(index: number, key: keyof CMSCoreValue, value: string) {
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
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coreValues: { heading, items } }),
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
      <PageHeader title="Giá trị cốt lõi" description="Tiêu đề section và danh sách các giá trị." />

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
            <span className="text-sm font-medium text-slate-700">Danh sách giá trị</span>
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
              </div>
            ))}
          </div>
        </div>

        <SaveBar status={status} />
      </form>
    </div>
  )
}
