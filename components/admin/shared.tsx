'use client'

import type { ReactNode } from 'react'
import type { SupportedLocale } from '@/lib/admin/content'

export type SaveStatus = 'idle' | 'saving' | 'ok' | 'error'

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
          {l === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
        </button>
      ))}
    </div>
  )
}
