'use client'

import type { ReactNode } from 'react'
import type { SupportedLocale } from '@/lib/admin/content'

export type SaveStatus = 'idle' | 'saving' | 'ok' | 'error'
export type SyncStatus = 'idle' | 'syncing' | 'ok' | 'error'

export const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

export function Field({ label, children }: { label: string; children: ReactNode }) {
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

export function SaveBar({ status }: { status: SaveStatus }) {
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

export function LocaleTabs({
  value,
  onChange,
}: {
  value: SupportedLocale
  onChange: (l: SupportedLocale) => void
}) {
  return (
    <div className="mt-5 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 w-fit">
      {(['vi', 'en'] as SupportedLocale[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            value === l
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {l === 'vi' ? '🇻🇳 Tiếng Việt' : 'EN English'}
        </button>
      ))}
    </div>
  )
}

const HEADING_SIZE_OPTIONS = [
  { value: 'sm', label: 'SM — Nhỏ' },
  { value: 'base', label: 'Base — Mặc định' },
  { value: 'lg', label: 'LG — Lớn' },
  { value: 'xl', label: 'XL — Rất lớn' },
]

const TEXT_SIZE_OPTIONS = [
  { value: 'xs', label: 'XS — 12px' },
  { value: 'sm', label: 'SM — 14px' },
  { value: 'base', label: 'Base — 16px' },
  { value: 'lg', label: 'LG — 18px' },
  { value: 'xl', label: 'XL — 20px' },
  { value: '2xl', label: '2XL — 24px' },
]

export function FontSizeSelect({
  value,
  onChange,
  mode = 'text',
}: {
  value?: string
  onChange: (v: string) => void
  mode?: 'heading' | 'text'
}) {
  const opts = mode === 'heading' ? HEADING_SIZE_OPTIONS : TEXT_SIZE_OPTIONS
  const def = mode === 'heading' ? 'base' : 'base'
  return (
    <select
      value={value ?? def}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    >
      {opts.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

export function FieldWithSize({
  label,
  size,
  onSizeChange,
  mode = 'text',
  children,
}: {
  label: string
  size?: string
  onSizeChange: (v: string) => void
  mode?: 'heading' | 'text'
  children: ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Cỡ chữ:</span>
          <FontSizeSelect value={size} onChange={onSizeChange} mode={mode} />
        </div>
      </div>
      {children}
    </div>
  )
}

export function SyncLocaleButton({
  locale,
  status,
  onSync,
}: {
  locale: SupportedLocale
  status: SyncStatus
  onSync: () => void
}) {
  const target = locale === 'vi' ? 'EN' : 'VI'
  return (
    <button
      type="button"
      onClick={onSync}
      disabled={status === 'syncing'}
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-50"
      title={`Đồng bộ template và ảnh từ ${locale.toUpperCase()} sang ${target}. Nội dung đã có sẽ được giữ nguyên.`}
    >
      {status === 'syncing' ? (
        'Đang đồng bộ…'
      ) : status === 'ok' ? (
        <>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.5 6.5 12 13 5" />
          </svg>
          Đã đồng bộ sang {target}
        </>
      ) : status === 'error' ? (
        'Lỗi, thử lại'
      ) : (
        <>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 5.5A4.5 4.5 0 0 1 10.9 4M14 10.5A4.5 4.5 0 0 1 5.1 12" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 2v3h3M5 14v-3H2" />
          </svg>
          Đồng bộ sang {target}
        </>
      )}
    </button>
  )
}