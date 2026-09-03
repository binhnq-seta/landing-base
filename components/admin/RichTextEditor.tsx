'use client'

import { useEffect, useRef } from 'react'

export function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

const WORD_FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]

const FONT_FAMILIES = [
  { value: 'sans-serif', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Helvetica', label: 'Helvetica' },
]

function ToolBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
    >
      {children}
    </button>
  )
}

const Divider = () => <div className="mx-0.5 h-4 w-px bg-slate-200 self-center" aria-hidden="true" />

export function RichTextEditor({
  value,
  onChange,
  minHeight = 'min-h-28',
}: {
  value: string
  onChange: (value: string) => void
  minHeight?: string
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)
  const savedRange = useRef<Range | null>(null)
  const pendingColor = useRef('#000000')
  const pendingBgColor = useRef('#ffff00')

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== value) el.innerHTML = value
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
    onChange(sanitizeHtml(editorRef.current?.innerHTML ?? ''))
  }

  function applyExactFontSize(px: number) {
    const editor = editorRef.current
    if (!editor) return
    isInternalChange.current = true
    document.execCommand('styleWithCSS', false, 'false')
    document.execCommand('fontSize', false, '7')
    document.execCommand('styleWithCSS', false, 'true')
    editor.querySelectorAll('font[size="7"]').forEach((el) => {
      const span = document.createElement('span')
      span.style.fontSize = `${px}px`
      span.innerHTML = (el as HTMLElement).innerHTML
      el.parentNode?.replaceChild(span, el)
    })
    onChange(sanitizeHtml(editor.innerHTML ?? ''))
  }

  function onInput() {
    isInternalChange.current = true
    onChange(sanitizeHtml(editorRef.current?.innerHTML ?? ''))
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <ToolBtn title="In đậm" onClick={() => runCommand('bold')}><strong>B</strong></ToolBtn>
        <ToolBtn title="In nghiêng" onClick={() => runCommand('italic')}><em>I</em></ToolBtn>
        <ToolBtn title="Gạch chân" onClick={() => runCommand('underline')}><u>U</u></ToolBtn>

        <Divider />

        <ToolBtn title="Căn trái" onClick={() => runCommand('justifyLeft')}>
          <svg viewBox="0 0 14 14" fill="currentColor" className="h-3 w-3" aria-hidden="true">
            <rect x="1" y="1" width="12" height="1.5" rx="0.5"/><rect x="1" y="4.5" width="8" height="1.5" rx="0.5"/>
            <rect x="1" y="8" width="12" height="1.5" rx="0.5"/><rect x="1" y="11.5" width="6" height="1.5" rx="0.5"/>
          </svg>
        </ToolBtn>
        <ToolBtn title="Căn giữa" onClick={() => runCommand('justifyCenter')}>
          <svg viewBox="0 0 14 14" fill="currentColor" className="h-3 w-3" aria-hidden="true">
            <rect x="1" y="1" width="12" height="1.5" rx="0.5"/><rect x="3" y="4.5" width="8" height="1.5" rx="0.5"/>
            <rect x="1" y="8" width="12" height="1.5" rx="0.5"/><rect x="4" y="11.5" width="6" height="1.5" rx="0.5"/>
          </svg>
        </ToolBtn>
        <ToolBtn title="Căn phải" onClick={() => runCommand('justifyRight')}>
          <svg viewBox="0 0 14 14" fill="currentColor" className="h-3 w-3" aria-hidden="true">
            <rect x="1" y="1" width="12" height="1.5" rx="0.5"/><rect x="5" y="4.5" width="8" height="1.5" rx="0.5"/>
            <rect x="1" y="8" width="12" height="1.5" rx="0.5"/><rect x="7" y="11.5" width="6" height="1.5" rx="0.5"/>
          </svg>
        </ToolBtn>

        <Divider />

        <ToolBtn title="Danh sách bullet" onClick={() => runCommand('insertUnorderedList')}>• List</ToolBtn>
        <ToolBtn title="Danh sách số" onClick={() => runCommand('insertOrderedList')}>1. List</ToolBtn>

        <Divider />

        <select
          className="rounded border border-slate-200 bg-white px-1 py-0.5 text-xs text-slate-600 cursor-pointer"
          title="Cỡ chữ (px)"
          defaultValue=""
          onMouseDown={saveRange}
          onChange={(e) => {
            const px = parseInt(e.target.value)
            if (!px) return
            restoreRange()
            applyExactFontSize(px)
            e.target.value = ''
          }}
        >
          <option value="" disabled>px</option>
          {WORD_FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

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
          {FONT_FAMILIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <label
          className="relative flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-200"
          title="Màu chữ"
          onMouseDown={saveRange}
        >
          <span className="text-xs font-bold text-slate-600 underline decoration-red-500">A</span>
          <input
            type="color"
            defaultValue="#000000"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(e) => { pendingColor.current = e.target.value }}
            onBlur={() => { restoreRange(); runCommand('foreColor', pendingColor.current) }}
          />
        </label>

        <label
          className="relative flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-200"
          title="Màu nền chữ"
          onMouseDown={saveRange}
        >
          <span className="text-xs font-bold" style={{ background: '#facc15', padding: '0 2px', borderRadius: 2 }}>A</span>
          <input
            type="color"
            defaultValue="#ffff00"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(e) => { pendingBgColor.current = e.target.value }}
            onBlur={() => { restoreRange(); runCommand('hiliteColor', pendingBgColor.current) }}
          />
        </label>

        <Divider />

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
        <ToolBtn title="Xóa định dạng" onClick={() => runCommand('removeFormat')}>Clear</ToolBtn>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onSelect={saveRange}
        onKeyUp={saveRange}
        onMouseUp={saveRange}
        className={`${minHeight} w-full px-3 py-2 text-sm leading-7 text-slate-700 focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_li]:leading-7 [&_li]:mt-1 [&_p]:mb-2`}
      />
    </div>
  )
}
