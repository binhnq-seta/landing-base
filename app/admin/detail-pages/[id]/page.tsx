'use client'

import React, { useState, useEffect, useRef, type FormEvent } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { CMSDetailPage, CMSDetailPoint, CMSDetailSection, DetailPageLayout, DetailSectionKind } from '@/lib/admin/content'
import { detailPages } from '@/lib/detail-pages'
import { ImageUploader } from '@/components/admin/ImageUploader'
import type { SupportedLocale } from '@/lib/admin/content'
import { inputCls, Field, SaveBar, LocaleTabs, type SaveStatus } from '@/components/admin/shared'
import { DetailPagePreview } from '@/components/admin/DetailPagePreview'

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string
  value: string | undefined
  onChange: (c: string) => void
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-slate-100"
      title={`Màu ${label}`}
    >
      <span>A</span>
      <span
        className="inline-block h-3.5 w-5 rounded-sm border border-slate-300"
        style={{ background: value ?? '#000000' }}
      />
      <input
        type="color"
        className="sr-only"
        value={value ?? '#000000'}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

const EMPTY_SECTION: CMSDetailSection = {
  kind: 'content',
  title: '',
  description: '',
  image: '',
  imageAlt: '',
  imagePosition: 'auto',
  imageStyle: 'cover',
  buttonHref: '',
}

type PageLayoutOption = { value: DetailPageLayout; label: string; desc: string; icon: React.ReactNode }

const PAGE_LAYOUT_OPTIONS: PageLayoutOption[] = [
  {
    value: 'headline',
    label: 'Headline',
    desc: 'Tiêu đề trái, ảnh phải',
    icon: (
      <svg viewBox="0 0 80 52" className="w-full" aria-hidden="true">
        {/* left col: eyebrow + title + summary */}
        <rect x="2" y="12" width="18" height="3" rx="1" fill="#fca5a5"/>
        <rect x="2" y="18" width="32" height="6" rx="1.5" fill="#94a3b8"/>
        <rect x="2" y="27" width="28" height="2.5" rx="1" fill="#e2e8f0"/>
        <rect x="2" y="31" width="24" height="2.5" rx="1" fill="#e2e8f0"/>
        <rect x="2" y="35" width="26" height="2.5" rx="1" fill="#e2e8f0"/>
        {/* right col: image */}
        <rect x="42" y="2" width="36" height="48" rx="3" fill="#cbd5e1"/>
        <rect x="42" y="36" width="36" height="14" rx="0" fill="url(#g1)"/>
        <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="#64748b" stopOpacity="0.4"/></linearGradient></defs>
      </svg>
    ),
  },
  {
    value: 'magazine',
    label: 'Magazine',
    desc: 'Ảnh trên, tiêu đề + tóm tắt bên dưới',
    icon: (
      <svg viewBox="0 0 80 52" className="w-full" aria-hidden="true">
        {/* top: full image */}
        <rect x="2" y="2" width="76" height="24" rx="2" fill="#cbd5e1"/>
        {/* below: left title + right summary */}
        <rect x="2" y="30" width="10" height="2.5" rx="1" fill="#fca5a5"/>
        <rect x="2" y="35" width="30" height="5" rx="1.5" fill="#94a3b8"/>
        <rect x="42" y="30" width="36" height="2.5" rx="1" fill="#e2e8f0"/>
        <rect x="42" y="35" width="32" height="2.5" rx="1" fill="#e2e8f0"/>
        <rect x="42" y="40" width="34" height="2.5" rx="1" fill="#e2e8f0"/>
        <rect x="42" y="45" width="28" height="2.5" rx="1" fill="#e2e8f0"/>
      </svg>
    ),
  },
  {
    value: 'immersive',
    label: 'Immersive',
    desc: 'Ảnh full màn hình, chữ phủ bên dưới',
    icon: (
      <svg viewBox="0 0 80 52" className="w-full" aria-hidden="true">
        {/* full bleed image */}
        <rect x="0" y="0" width="80" height="52" rx="3" fill="#94a3b8"/>
        {/* overlay gradient at bottom */}
        <rect x="0" y="26" width="80" height="26" rx="0" fill="#1e3a5f" opacity="0.75"/>
        {/* text */}
        <rect x="6" y="29" width="14" height="2" rx="1" fill="rgba(255,255,255,0.5)"/>
        <rect x="6" y="34" width="46" height="6" rx="1.5" fill="#fff"/>
        <rect x="6" y="43" width="38" height="2.5" rx="1" fill="rgba(255,255,255,0.55)"/>
      </svg>
    ),
  },
  {
    value: 'editorial',
    label: 'Editorial',
    desc: 'Chữ căn giữa trên, ảnh panorama bên dưới',
    icon: (
      <svg viewBox="0 0 80 52" className="w-full" aria-hidden="true">
        {/* centered title area */}
        <rect x="22" y="4" width="12" height="2.5" rx="1" fill="#fca5a5"/>
        <rect x="14" y="9" width="52" height="6" rx="1.5" fill="#94a3b8"/>
        <rect x="10" y="18" width="60" height="2.5" rx="1" fill="#e2e8f0"/>
        <rect x="14" y="23" width="52" height="2.5" rx="1" fill="#e2e8f0"/>
        {/* wide panoramic image below */}
        <rect x="2" y="30" width="76" height="20" rx="2" fill="#cbd5e1"/>
      </svg>
    ),
  },
]

const TEMPLATES = [
  { label: '1 ảnh', count: 1 },
  { label: '2 ảnh', count: 2 },
  { label: '3 ảnh', count: 3 },
  { label: '4 ảnh', count: 4 },
  { label: '5 ảnh', count: 5 },
]

function sanitizeEditorHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

function ToolBtn({
  children,
  onClick,
  title,
  className = '',
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  className?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 ${className}`}
    >
      {children}
    </button>
  )
}

const FONT_SIZES = [
  { value: '1', label: 'Rất nhỏ' },
  { value: '2', label: 'Nhỏ' },
  { value: '3', label: 'Bình thường' },
  { value: '4', label: 'Lớn' },
  { value: '5', label: 'Rất lớn' },
  { value: '6', label: 'Cực lớn' },
  { value: '7', label: 'Khổng lồ' },
]

const FONT_FAMILIES = [
  { value: 'sans-serif', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Helvetica', label: 'Helvetica' },
]

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)
  const savedRange = useRef<Range | null>(null)
  const colorRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== value) {
      el.innerHTML = value
    }
  }, [value])

  function saveRange() {
    const sel = window.getSelection()
    savedRange.current = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null
  }

  function restoreRange() {
    const range = savedRange.current
    const el = editorRef.current
    if (!range || !el) return
    el.focus()
    const sel = window.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    sel.addRange(range)
  }

  function runCommand(command: string, commandValue?: string) {
    document.execCommand('styleWithCSS', false, 'true')
    isInternalChange.current = true
    document.execCommand(command, false, commandValue)
    const html = editorRef.current?.innerHTML ?? ''
    onChange(sanitizeEditorHtml(html))
  }

  function onInput() {
    isInternalChange.current = true
    const html = editorRef.current?.innerHTML ?? ''
    onChange(sanitizeEditorHtml(html))
  }

  const Divider = () => <div className="mx-0.5 h-4 w-px bg-slate-200 self-center" aria-hidden="true" />

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        {/* Basic format */}
        <ToolBtn title="In đậm" onClick={() => runCommand('bold')}>
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn title="In nghiêng" onClick={() => runCommand('italic')}>
          <em>I</em>
        </ToolBtn>
        <ToolBtn title="Gạch chân" onClick={() => runCommand('underline')}>
          <u>U</u>
        </ToolBtn>

        <Divider />

        {/* Alignment */}
        <ToolBtn title="Căn trái" onClick={() => runCommand('justifyLeft')}>
          <svg viewBox="0 0 14 14" fill="currentColor" className="h-3 w-3" aria-hidden="true">
            <rect x="1" y="1"    width="12" height="1.5" rx="0.5"/>
            <rect x="1" y="4.5"  width="8"  height="1.5" rx="0.5"/>
            <rect x="1" y="8"    width="12" height="1.5" rx="0.5"/>
            <rect x="1" y="11.5" width="6"  height="1.5" rx="0.5"/>
          </svg>
        </ToolBtn>
        <ToolBtn title="Căn giữa" onClick={() => runCommand('justifyCenter')}>
          <svg viewBox="0 0 14 14" fill="currentColor" className="h-3 w-3" aria-hidden="true">
            <rect x="1" y="1"    width="12" height="1.5" rx="0.5"/>
            <rect x="3" y="4.5"  width="8"  height="1.5" rx="0.5"/>
            <rect x="1" y="8"    width="12" height="1.5" rx="0.5"/>
            <rect x="4" y="11.5" width="6"  height="1.5" rx="0.5"/>
          </svg>
        </ToolBtn>
        <ToolBtn title="Căn phải" onClick={() => runCommand('justifyRight')}>
          <svg viewBox="0 0 14 14" fill="currentColor" className="h-3 w-3" aria-hidden="true">
            <rect x="1" y="1"    width="12" height="1.5" rx="0.5"/>
            <rect x="5" y="4.5"  width="8"  height="1.5" rx="0.5"/>
            <rect x="1" y="8"    width="12" height="1.5" rx="0.5"/>
            <rect x="7" y="11.5" width="6"  height="1.5" rx="0.5"/>
          </svg>
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn title="Danh sách bullet" onClick={() => runCommand('insertUnorderedList')}>
          • List
        </ToolBtn>
        <ToolBtn title="Danh sách số" onClick={() => runCommand('insertOrderedList')}>
          1. List
        </ToolBtn>

        <Divider />

        {/* Font size */}
        <select
          className="rounded border border-slate-200 bg-white px-1 py-0.5 text-xs text-slate-600 cursor-pointer"
          title="Cỡ chữ"
          defaultValue=""
          onMouseDown={saveRange}
          onChange={(e) => {
            const v = e.target.value
            if (!v) return
            restoreRange()
            runCommand('fontSize', v)
            e.target.value = ''
          }}
        >
          <option value="" disabled>Cỡ chữ</option>
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Font family */}
        <select
          className="rounded border border-slate-200 bg-white px-1 py-0.5 text-xs text-slate-600 cursor-pointer"
          title="Font chữ"
          defaultValue=""
          onMouseDown={saveRange}
          onChange={(e) => {
            const v = e.target.value
            if (!v) return
            restoreRange()
            runCommand('fontName', v)
            e.target.value = ''
          }}
        >
          <option value="" disabled>Font</option>
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* Font color */}
        <label
          className="relative flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-200"
          title="Màu chữ"
          onMouseDown={saveRange}
        >
          <span className="text-xs font-bold text-slate-600 underline decoration-red-500">A</span>
          <input
            ref={colorRef}
            type="color"
            defaultValue="#000000"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(e) => {
              restoreRange()
              runCommand('foreColor', e.target.value)
            }}
          />
        </label>

        <Divider />

        {/* Link */}
        <ToolBtn
          title="Chèn liên kết"
          onClick={() => {
            const url = window.prompt('Nhập URL liên kết:')
            if (!url) return
            runCommand('createLink', url)
          }}
        >
          Link
        </ToolBtn>

        {/* Clear format */}
        <ToolBtn title="Xóa định dạng" onClick={() => runCommand('removeFormat')}>
          Clear
        </ToolBtn>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onSelect={saveRange}
        onKeyUp={saveRange}
        onMouseUp={saveRange}
        className="min-h-28 w-full px-3 py-2 text-sm leading-7 text-slate-700 focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_li]:leading-7 [&_li]:mt-1 [&_p]:mb-2"
      />
    </div>
  )
}

const HEADING_SECTION: CMSDetailSection = {
  kind: 'heading',
  title: '',
  titleAlign: 'center',
  description: '',
  image: '',
  imageAlt: '',
  imagePosition: 'auto',
  imageStyle: 'cover',
  buttonHref: '',
}

const IMAGE_POINTS_SECTION: CMSDetailSection = {
  kind: 'image-points',
  title: '',
  description: '',
  image: '',
  imageAlt: '',
  imagePosition: 'right',
  imageStyle: 'wide',
  buttonHref: '',
  points: [],
}


export default function DetailPageEditor() {
  const params = useParams()
  const id = params.id as string
  const [rawType, slug] = id.split('--')
  const type = rawType as 'solutions' | 'projects'

  const [locale, setLocale] = useState<SupportedLocale>('vi')
  const [page, setPage] = useState<CMSDetailPage | null>(null)
  const [allPages, setAllPages] = useState<CMSDetailPage[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [showPreview, setShowPreview] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set())

  useEffect(() => {
    setPage(null)
    const hardcoded = locale === 'vi' ? detailPages.find((p) => p.type === type && p.slug === slug) : undefined

    fetch(`/api/admin/content?locale=${locale}`)
      .then((r) => r.json())
      .then((data: { detailPages?: CMSDetailPage[] }) => {
        const cmsPages = data.detailPages ?? []
        setAllPages(cmsPages)
        const cmsPage = cmsPages.find((p) => p.type === type && p.slug === slug)
        if (cmsPage) {
          setPage(cmsPage)
        } else if (hardcoded) {
          setPage({
            type: hardcoded.type,
            slug: hardcoded.slug,
            eyebrow: hardcoded.eyebrow,
            title: hardcoded.title,
            summary: hardcoded.summary,
            heroImage: hardcoded.heroImage,
            heroImageAlt: hardcoded.heroImageAlt,
            sections: hardcoded.sections.map((s) => ({
              title: s.title,
              description: s.description,
              image: s.image,
              imageAlt: s.imageAlt,
              imagePosition: 'auto' as const,
              imageStyle: 'cover' as const,
            })),
          })
        } else {
          setPage({
            type,
            slug,
            eyebrow: '',
            title: '',
            summary: '',
            heroImage: '',
            heroImageAlt: '',
            sections: [],
          })
        }
      })
  }, [type, slug, locale])

  function updatePage<K extends keyof CMSDetailPage>(key: K, value: CMSDetailPage[K]) {
    setPage((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  function updateSection(i: number, key: keyof CMSDetailSection, value: string) {
    setPage((prev) => {
      if (!prev) return prev
      const sections = [...prev.sections]
      sections[i] = { ...sections[i], [key]: value }
      return { ...prev, sections }
    })
  }

  function updateSectionKind(i: number, nextKind: DetailSectionKind) {
    setPage((prev) => {
      if (!prev) return prev
      const sections = [...prev.sections]
      const current = sections[i]
      const nextPoints = nextKind === 'image-points' ? (current.points ?? []) : current.points

      sections[i] = {
        ...current,
        kind: nextKind,
        points: nextPoints,
      }
      return { ...prev, sections }
    })
  }

  function updatePoint(i: number, pointIndex: number, key: keyof CMSDetailPoint, value: string) {
    setPage((prev) => {
      if (!prev) return prev
      const sections = [...prev.sections]
      const target = sections[i]
      const points = target.points ? [...target.points] : []
      if (!points[pointIndex]) return prev
      points[pointIndex] = { ...points[pointIndex], [key]: value }
      sections[i] = { ...target, points }
      return { ...prev, sections }
    })
  }

  function addPoint(i: number) {
    setPage((prev) => {
      if (!prev) return prev
      const sections = [...prev.sections]
      const target = sections[i]
      const points = target.points ? [...target.points] : []
      points.push({ title: '', description: '' })
      sections[i] = { ...target, points }
      return { ...prev, sections }
    })
  }

  function removePoint(i: number, pointIndex: number) {
    setPage((prev) => {
      if (!prev) return prev
      const sections = [...prev.sections]
      const target = sections[i]
      const points = (target.points ?? []).filter((_, idx) => idx !== pointIndex)
      sections[i] = { ...target, points }
      return { ...prev, sections }
    })
  }

  function addSection() {
    setPage((prev) => {
      if (!prev) return prev
      return { ...prev, sections: [...prev.sections, { ...EMPTY_SECTION }] }
    })
  }

  function removeSection(i: number) {
    setPage((prev) => {
      if (!prev) return prev
      return { ...prev, sections: prev.sections.filter((_, idx) => idx !== i) }
    })
  }

  function moveSection(i: number, dir: -1 | 1) {
    setPage((prev) => {
      if (!prev) return prev
      const sections = [...prev.sections]
      const j = i + dir
      if (j < 0 || j >= sections.length) return prev
      ;[sections[i], sections[j]] = [sections[j], sections[i]]
      return { ...prev, sections }
    })
  }

  function applyTemplate(count: number) {
    if (!page) return
    const current = page.sections.length
    if (current === count) return
    if (current > count) {
      if (!window.confirm(`Giảm từ ${current} xuống ${count} mục? ${current - count} mục cuối sẽ bị xoá.`)) return
      setPage((prev) => prev ? { ...prev, sections: prev.sections.slice(0, count) } : prev)
    } else {
      const toAdd = count - current
      const empties = Array.from({ length: toAdd }, () => ({ ...EMPTY_SECTION }))
      setPage((prev) => prev ? { ...prev, sections: [...prev.sections, ...empties] } : prev)
    }
  }

  function applyFreeTemplate() {
    if (!page) return
    if (page.sections.length > 0) {
      if (!window.confirm('Xoá tất cả mục để bắt đầu tự do từ đầu?')) return
    }
    setPage((prev) => prev ? { ...prev, sections: [] } : prev)
  }

  function applyHeadingTemplate() {
    setPage((prev) => {
      if (!prev) return prev
      const first = prev.sections[0]
      if (first?.kind === 'heading') return prev
      return { ...prev, sections: [{ ...HEADING_SECTION }, ...prev.sections] }
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!page) return
    setStatus('saving')
    try {
      // 1. Save current locale
      const idx = allPages.findIndex((p) => p.type === page.type && p.slug === page.slug)
      const updatedPages =
        idx >= 0 ? allPages.map((p, i) => (i === idx ? page : p)) : [...allPages, page]
      const res = await fetch(`/api/admin/content?locale=${locale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detailPages: updatedPages }),
      })
      if (!res.ok) { setStatus('error'); return }
      setAllPages(updatedPages)

      // 2. Sync locale-independent fields (layout, buttonHref, imagePosition, imageStyle)
      //    to the other locale so they stay in sync without manual re-editing
      const otherLocale = locale === 'vi' ? 'en' : 'vi'
      const otherData: { detailPages?: CMSDetailPage[] } = await fetch(
        `/api/admin/content?locale=${otherLocale}`
      ).then((r) => r.json())
      const otherPages = otherData.detailPages ?? []
      const otherIdx = otherPages.findIndex(
        (p) => p.type === page.type && p.slug === page.slug
      )
      if (otherIdx >= 0) {
        const other = otherPages[otherIdx]
        const synced: CMSDetailPage = {
          ...other,
          layout: page.layout,
          sections: other.sections.map((s, i) => {
            const src = page.sections[i]
            if (!src) return s
            return {
              ...s,
              buttonHref: src.buttonHref,
              imagePosition: src.imagePosition,
              imageStyle: src.imageStyle,
              kind: src.kind,
              titleSize: src.titleSize,
              titleAlign: src.titleAlign,
            }
          }),
        }
        const updatedOther = otherPages.map((p, i) => (i === otherIdx ? synced : p))
        await fetch(`/api/admin/content?locale=${otherLocale}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ detailPages: updatedOther }),
        })
      }

      setStatus('ok')
    } catch {
      setStatus('error')
    } finally {
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <>
      {showPreview && page && (
        <DetailPagePreview page={page} locale={locale} onClose={() => setShowPreview(false)} />
      )}

    <div className="p-8">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/detail-pages" className="text-sm text-blue-600 hover:underline">
            ← Trang chi tiết
          </Link>
          <h1 className="mt-2 text-xl font-bold text-slate-800">{page?.title ?? '…'}</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {type} / {slug}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          disabled={!page}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-40"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 10C3.732 5.943 6.524 3 10 3s6.268 2.943 7.542 7c-1.274 4.057-4.066 7-7.542 7S3.732 14.057 2.458 10z" />
            <circle cx="10" cy="10" r="2.5" strokeLinecap="round" />
          </svg>
          Xem trước
        </button>
      </div>

      <LocaleTabs value={locale} onChange={setLocale} />

      {!page ? (
        <div className="mt-6 text-sm text-slate-500">Đang tải…</div>
      ) : (
      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-6">
        {/* General info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Thông tin chung
          </h2>

          {/* Page layout picker */}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">Bố cục trang</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PAGE_LAYOUT_OPTIONS.map((opt) => {
                const active = (page.layout ?? 'headline') === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updatePage('layout', opt.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-left transition-colors ${
                      active ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="w-full">{opt.icon}</div>
                    <div>
                      <p className={`text-xs font-semibold ${active ? 'text-blue-600' : 'text-slate-700'}`}>{opt.label}</p>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Eyebrow */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Eyebrow (nhãn nhỏ phía trên tiêu đề)</span>
              <ColorSwatch label="eyebrow" value={page.eyebrowColor} onChange={(c) => updatePage('eyebrowColor', c)} />
            </div>
            <input className={inputCls} value={page.eyebrow} onChange={(e) => updatePage('eyebrow', e.target.value)} />
          </div>

          {/* Tiêu đề trang */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Tiêu đề trang</span>
              <ColorSwatch label="tiêu đề" value={page.titleColor} onChange={(c) => updatePage('titleColor', c)} />
            </div>
            <input className={inputCls} value={page.title} onChange={(e) => updatePage('title', e.target.value)} required />
          </div>

          {/* Tóm tắt */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Tóm tắt</span>
              <ColorSwatch label="tóm tắt" value={page.summaryColor} onChange={(c) => updatePage('summaryColor', c)} />
            </div>
            <textarea
              className={`${inputCls} min-h-24 resize-y`}
              value={page.summary}
              onChange={(e) => updatePage('summary', e.target.value)}
            />
          </div>
          <ImageUploader
            label="Ảnh hero"
            value={page.heroImage}
            onChange={(url) => updatePage('heroImage', url)}
            previewClassName="h-32 w-52 object-cover"
          />
          <Field label="Alt text ảnh hero">
            <input
              className={inputCls}
              value={page.heroImageAlt}
              onChange={(e) => updatePage('heroImageAlt', e.target.value)}
            />
          </Field>
        </div>

        {/* Sections header + template picker */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-700">
                Các mục nội dung
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                  {page.sections.length} mục
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Dùng ↑↓ để sắp xếp thứ tự hiển thị
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Nhanh:</span>
              {TEMPLATES.map((t) => (
                <button
                  key={t.count}
                  type="button"
                  onClick={() => applyTemplate(t.count)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    page.sections.length === t.count
                      ? 'border-blue-300 bg-blue-50 text-blue-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
              <button
                type="button"
                onClick={applyFreeTemplate}
                className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-100 transition-colors"
              >
                Tự do
              </button>
              <button
                type="button"
                onClick={applyHeadingTemplate}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                Thêm đầu mục + so le
              </button>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {page.sections.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-center">
            <p className="text-sm text-slate-400">Chưa có mục nào.</p>
            <p className="mt-1 text-xs text-slate-300">
              Chọn template nhanh phía trên hoặc nhấn &quot;+ Thêm mục&quot; bên dưới.
            </p>
          </div>
        )}

        {/* Section cards */}
        {page.sections.map((section, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            {(() => {
              const sectionKind = section.kind ?? 'content'
              const isHeading = sectionKind === 'heading'
              const isImagePoints = sectionKind === 'image-points'
              const isCollapsed = collapsedSections.has(i)

              return (
                <>
            {/* Section header */}
            <div
              className="flex cursor-pointer select-none items-center justify-between"
              onClick={() => setCollapsedSections(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })}
            >
              <div className="flex min-w-0 items-center gap-2">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-150 ${isCollapsed ? '-rotate-90' : ''}`} aria-hidden="true">
                  <path d="M4 6l4 4 4-4" />
                </svg>
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Mục {i + 1}
                  <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-slate-500">
                    {isHeading ? 'Đầu mục' : isImagePoints ? 'Ảnh + danh sách' : 'Nội dung'}
                  </span>
                </h2>
                {isCollapsed && section.title && (
                  <span className="ml-1 max-w-[200px] truncate text-xs text-slate-400">{section.title}</span>
                )}
              </div>
              <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => moveSection(i, -1)}
                  disabled={i === 0}
                  title="Di chuyển lên"
                  className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M8 3l5 5H3l5-5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(i, 1)}
                  disabled={i === page.sections.length - 1}
                  title="Di chuyển xuống"
                  className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M8 13l-5-5h10l-5 5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(i)}
                  title="Xoá mục này"
                  className="ml-2 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-100"
                >
                  Xoá
                </button>
              </div>
            </div>

            {!isCollapsed && (<>
            <Field label="Loại mục">
              <select
                className={inputCls}
                value={sectionKind}
                onChange={(e) => updateSectionKind(i, e.target.value as DetailSectionKind)}
              >
                <option value="content">Nội dung (ảnh + text so le)</option>
                <option value="heading">Đầu mục (tiêu đề + mô tả)</option>
                <option value="image-points">Ảnh + danh sách text/desc</option>
              </select>
            </Field>

            {/* Title + size + alignment row */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium text-slate-500">
                  {isImagePoints ? 'Tiêu đề khối (tuỳ chọn)' : 'Tiêu đề mục'}
                </label>
                <div className="flex items-center gap-2">
                  {/* Title color */}
                  <ColorSwatch
                    label="tiêu đề mục"
                    value={section.titleColor}
                    onChange={(c) => updateSection(i, 'titleColor', c)}
                  />
                  {/* Title size */}
                  <select
                    className="rounded border border-slate-200 bg-white px-1 py-0.5 text-xs text-slate-600"
                    title="Cỡ chữ tiêu đề"
                    value={section.titleSize ?? ''}
                    onChange={(e) => updateSection(i, 'titleSize', e.target.value)}
                  >
                    <option value="">Cỡ mặc định</option>
                    <option value="xs">Rất nhỏ</option>
                    <option value="sm">Nhỏ</option>
                    <option value="base">Vừa</option>
                    <option value="lg">Lớn</option>
                    <option value="xl">Rất lớn</option>
                    <option value="2xl">Lớn hơn</option>
                    <option value="3xl">Rất lớn</option>
                    <option value="4xl">Cực lớn</option>
                  </select>
                  {/* Title alignment */}
                  <div className="flex items-center rounded border border-slate-200 bg-white overflow-hidden">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        title={align === 'left' ? 'Căn trái' : align === 'center' ? 'Căn giữa' : 'Căn phải'}
                        onClick={() => updateSection(i, 'titleAlign', align)}
                        className={`px-2 py-1 text-xs transition-colors ${
                          (section.titleAlign ?? 'left') === align
                            ? 'bg-blue-500 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {align === 'left' ? (
                          <svg viewBox="0 0 12 12" fill="currentColor" className="h-2.5 w-2.5" aria-hidden="true">
                            <rect x="0" y="0.5" width="12" height="1.5" rx="0.5"/>
                            <rect x="0" y="4"   width="8"  height="1.5" rx="0.5"/>
                            <rect x="0" y="7.5" width="12" height="1.5" rx="0.5"/>
                            <rect x="0" y="11"  width="5"  height="1.5" rx="0.5"/>
                          </svg>
                        ) : align === 'center' ? (
                          <svg viewBox="0 0 12 12" fill="currentColor" className="h-2.5 w-2.5" aria-hidden="true">
                            <rect x="0" y="0.5" width="12" height="1.5" rx="0.5"/>
                            <rect x="2" y="4"   width="8"  height="1.5" rx="0.5"/>
                            <rect x="0" y="7.5" width="12" height="1.5" rx="0.5"/>
                            <rect x="3" y="11"  width="6"  height="1.5" rx="0.5"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 12 12" fill="currentColor" className="h-2.5 w-2.5" aria-hidden="true">
                            <rect x="0" y="0.5" width="12" height="1.5" rx="0.5"/>
                            <rect x="4" y="4"   width="8"  height="1.5" rx="0.5"/>
                            <rect x="0" y="7.5" width="12" height="1.5" rx="0.5"/>
                            <rect x="7" y="11"  width="5"  height="1.5" rx="0.5"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <input
                className={inputCls}
                value={section.title}
                onChange={(e) => updateSection(i, 'title', e.target.value)}
              />
            </div>
            {isHeading && (
              <>
                <ImageUploader
                  label="Ảnh nền (tuỳ chọn)"
                  value={section.image}
                  onChange={(url) => updateSection(i, 'image', url)}
                />
                {section.image && (
                  <Field label="Alt text ảnh">
                    <input
                      className={inputCls}
                      value={section.imageAlt}
                      onChange={(e) => updateSection(i, 'imageAlt', e.target.value)}
                    />
                  </Field>
                )}
              </>
            )}

            {!isHeading && !isImagePoints && (
              <Field label="Nội dung">
                <RichTextEditor
                  value={section.description}
                  onChange={(nextValue) => updateSection(i, 'description', nextValue)}
                />
              </Field>
            )}

            {isImagePoints && (
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Danh sách nội dung dưới ảnh
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addPoint(i)}
                      className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      + Thêm dòng
                    </button>
                  </div>
                </div>

                {(section.points ?? []).length === 0 && (
                  <p className="text-xs text-slate-400">Chưa có dòng nội dung nào. Nhấn &quot;+ Thêm dòng&quot; để bắt đầu.</p>
                )}

                {(section.points ?? []).map((point, pointIndex) => (
                  <div key={pointIndex} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Dòng {pointIndex + 1}</p>
                      <button
                        type="button"
                        onClick={() => removePoint(i, pointIndex)}
                        className="rounded border border-red-100 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-500 transition-colors hover:bg-red-100"
                      >
                        Xoá
                      </button>
                    </div>

                    <Field label="Tiêu đề">
                      <input
                        className={inputCls}
                        value={point.title}
                        onChange={(e) => updatePoint(i, pointIndex, 'title', e.target.value)}
                      />
                    </Field>

                    <Field label="Mô tả">
                      <textarea
                        className={`${inputCls} min-h-20 resize-y`}
                        value={point.description}
                        onChange={(e) => updatePoint(i, pointIndex, 'description', e.target.value)}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            )}

            {!isHeading && !isImagePoints && (
              <>

            {/* Button link toggle */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <label className="flex cursor-pointer items-center gap-3">
                <div className="relative flex-none">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={!!section.buttonHref}
                    onChange={(e) => updateSection(i, 'buttonHref', e.target.checked ? `/${type}/` : '')}
                  />
                  <div className="h-5 w-9 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-500" />
                  <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Thêm nút &ldquo;Xem thêm&rdquo;
                  </span>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Nhãn tự động dịch · URL đồng bộ cả 2 ngôn ngữ khi lưu
                  </p>
                </div>
              </label>
              {!!section.buttonHref && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 font-mono text-[10px] text-slate-400">URL</span>
                    <input
                      className={`${inputCls} flex-1 font-mono text-xs`}
                      placeholder={`/${type}/ten-trang-con`}
                      value={section.buttonHref}
                      onChange={(e) => updateSection(i, 'buttonHref', e.target.value)}
                    />
                  </div>
                  <p className="pl-8 text-[10px] text-slate-400">
                    Ví dụ: <span className="font-mono">/{type}/{slug}/sub-page</span> hoặc <span className="font-mono">/{type === 'solutions' ? 'projects' : 'solutions'}/ten-khac</span>
                  </p>
                </div>
              )}
            </div>

            <ImageUploader
              label="Ảnh mục"
              value={section.image}
              onChange={(url) => updateSection(i, 'image', url)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vị trí ảnh">
                <select
                  className={inputCls}
                  value={section.imagePosition ?? 'auto'}
                  onChange={(e) => updateSection(i, 'imagePosition', e.target.value)}
                >
                  <option value="auto">Tự động (xen kẽ)</option>
                  <option value="left">Trái</option>
                  <option value="right">Phải</option>
                </select>
              </Field>
              <Field label="Kiểu ảnh">
                <select
                  className={inputCls}
                  value={section.imageStyle ?? 'cover'}
                  onChange={(e) => updateSection(i, 'imageStyle', e.target.value)}
                >
                  <option value="cover">Cover (lấp đầy 4:3)</option>
                  <option value="contain">Contain (vừa khung)</option>
                  <option value="portrait">Portrait (dọc 3:4)</option>
                  <option value="wide">Wide (ngang 16:9)</option>
                  <option value="background">Nền (ảnh phủ toàn khối)</option>
                </select>
              </Field>
            </div>
            <Field label="Alt text ảnh">
              <input
                className={inputCls}
                value={section.imageAlt}
                onChange={(e) => updateSection(i, 'imageAlt', e.target.value)}
              />
            </Field>
              </>
            )}

            {isImagePoints && (
              <>
                <Field label="Vị trí ảnh">
                  <select
                    className={inputCls}
                    value={section.imagePosition === 'left' ? 'left' : 'right'}
                    onChange={(e) => updateSection(i, 'imagePosition', e.target.value)}
                  >
                    <option value="right">Phải</option>
                    <option value="left">Trái</option>
                  </select>
                </Field>
                <ImageUploader
                  label="Ảnh khối"
                  value={section.image}
                  onChange={(url) => updateSection(i, 'image', url)}
                />
                <Field label="Alt text ảnh">
                  <input
                    className={inputCls}
                    value={section.imageAlt}
                    onChange={(e) => updateSection(i, 'imageAlt', e.target.value)}
                  />
                </Field>
              </>
            )}
            </>)}
                </>
              )
            })()}
          </div>
        ))}

        {/* Add section */}
        <button
          type="button"
          onClick={addSection}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white py-4 text-sm font-medium text-slate-400 transition-colors hover:border-blue-300 hover:text-blue-600"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" />
          </svg>
          Thêm mục
        </button>

        <SaveBar status={status} />
      </form>
      )}
    </div>
    </>
  )
}
