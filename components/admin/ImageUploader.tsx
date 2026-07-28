'use client'

import { useRef, useState } from 'react'
import { inputCls } from './shared'

interface ImageUploaderProps {
  label?: string
  value: string
  onChange: (url: string) => void
  previewClassName?: string
}

export function ImageUploader({
  label = 'Ảnh',
  value,
  onChange,
  previewClassName = 'h-24 w-36 object-cover',
}: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Upload thất bại')
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload thất bại')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      )}
      <div className="flex items-start gap-3">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className={`shrink-0 rounded-lg border border-slate-200 ${previewClassName}`}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        <div className="flex-1 space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
            placeholder="/uploads/... hoặc /image/..."
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {uploading ? 'Đang tải lên…' : 'Tải ảnh lên'}
            </button>
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </div>
    </div>
  )
}
