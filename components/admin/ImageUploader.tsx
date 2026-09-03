'use client'

import { useRef, useState } from 'react'
import { inputCls } from './shared'

interface ImageUploaderProps {
  label?: string
  value: string
  onChange: (url: string) => void
  previewClassName?: string
  fileType?: 'image' | 'pdf'
}

export function ImageUploader({
  label = 'Ảnh',
  value,
  onChange,
  previewClassName = 'h-24 w-36 object-cover',
  fileType = 'image',
}: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const isPdf = fileType === 'pdf'
  const isUploaded = value.startsWith('/uploads/')
  const maxSize = 10 * 1024 * 1024
  const sizeLabel = '10 MB'
  const accept = isPdf ? 'application/pdf' : 'image/*'
  const uploadLabel = isPdf ? 'Tải PDF lên' : 'Tải ảnh lên'
  const placeholder = isPdf ? '/uploads/file.pdf' : '/uploads/... hoặc /image/...'

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > maxSize) {
      setError(`File quá lớn. Vui lòng chọn file nhỏ hơn ${sizeLabel}.`)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })

      // Guard: response may not be JSON (e.g. server crash → HTML 500)
      const text = await res.text()
      let data: { url?: string; error?: string } = {}
      try {
        data = JSON.parse(text) as { url?: string; error?: string }
      } catch {
        throw new Error(`Server trả về lỗi ${res.status}. Kiểm tra log server.`)
      }

      if (!res.ok || !data.url) throw new Error(data.error ?? 'Upload thất bại')
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload thất bại')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete() {
    if (!isUploaded) return
    if (!window.confirm('Xóa file này khỏi server?')) return
    setDeleting(true)
    setError('')
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Xóa thất bại')
      onChange('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại')
    } finally {
      setDeleting(false)
    }
  }

  // Extract filename from URL for PDF preview
  const pdfFilename = value ? value.split('/').pop() : ''

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      )}
      <div className="flex items-start gap-3">
        {value && !isPdf && (
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
        {value && isPdf && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-red-50 px-3 py-2 text-xs text-red-700 hover:bg-red-100"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span className="max-w-[100px] truncate">{pdfFilename}</span>
          </a>
        )}
        <div className="flex-1 space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
            placeholder={placeholder}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || deleting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {uploading ? 'Đang tải lên…' : uploadLabel}
            </button>
            {isUploaded && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={uploading || deleting}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                {deleting ? 'Đang xóa…' : 'Xóa file'}
              </button>
            )}
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </div>
    </div>
  )
}
