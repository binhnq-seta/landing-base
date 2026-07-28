'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { inputCls, Field, PageHeader } from '@/components/admin/shared'

type SaveStatus = 'idle' | 'saving' | 'ok' | 'error'

function StatusMsg({ status, error }: { status: SaveStatus; error: string }) {
  if (status === 'saving') return <span className="text-sm text-slate-500">Đang lưu…</span>
  if (status === 'ok') return <span className="text-sm font-medium text-green-600">✓ Thành công</span>
  if (status === 'error') return <span className="text-sm font-medium text-red-600">✗ {error}</span>
  return null
}

function SubmitBtn({ status, label }: { status: SaveStatus; label: string }) {
  return (
    <button
      type="submit"
      disabled={status === 'saving'}
      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
    >
      {status === 'saving' ? 'Đang lưu…' : label}
    </button>
  )
}

function ChangePasswordSection() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (next !== confirm) {
      setError('Mật khẩu xác nhận không khớp.')
      setStatus('error')
      return
    }
    setStatus('saving')
    setError('')
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Lỗi không xác định.')
        setStatus('error')
        return
      }
      setStatus('ok')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch {
      setError('Không thể kết nối đến server.')
      setStatus('error')
    } finally {
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-500">
        Đổi mật khẩu
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <Field label="Mật khẩu hiện tại">
          <input
            type="password"
            className={inputCls}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            autoComplete="current-password"
          />
        </Field>
        <Field label="Mật khẩu mới (ít nhất 6 ký tự)">
          <input
            type="password"
            className={inputCls}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Xác nhận mật khẩu mới">
          <input
            type="password"
            className={inputCls}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </Field>
        <div className="flex items-center gap-4 pt-1">
          <SubmitBtn status={status} label="Đổi mật khẩu" />
          <StatusMsg status={status} error={error} />
        </div>
      </form>
    </div>
  )
}

function UsersSection() {
  const [usernames, setUsernames] = useState<string[]>([])
  const [newUser, setNewUser] = useState('')
  const [newPass, setNewPass] = useState('')
  const [addStatus, setAddStatus] = useState<SaveStatus>('idle')
  const [addError, setAddError] = useState('')

  function load() {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d: { usernames?: string[] }) => setUsernames(d.usernames ?? []))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setAddStatus('saving')
    setAddError('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUser, password: newPass }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setAddError(data.error ?? 'Lỗi.')
        setAddStatus('error')
        return
      }
      setAddStatus('ok')
      setNewUser('')
      setNewPass('')
      load()
    } catch {
      setAddError('Lỗi kết nối.')
      setAddStatus('error')
    } finally {
      setTimeout(() => setAddStatus('idle'), 3000)
    }
  }

  async function handleDelete(username: string) {
    if (!confirm(`Xóa user "${username}"?`)) return
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
    load()
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-500">
        Quản lý người dùng
      </h2>

      {usernames.length === 0 ? (
        <p className="mb-4 text-sm text-slate-400">
          Chưa có user nào trong file — hệ thống đang dùng biến môi trường ADMIN_USERNAME/ADMIN_PASSWORD.
        </p>
      ) : (
        <ul className="mb-4 space-y-1">
          {usernames.map((u) => (
            <li
              key={u}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-2.5"
            >
              <span className="text-sm font-medium text-slate-700">{u}</span>
              {usernames.length > 1 && (
                <button
                  onClick={() => handleDelete(u)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Xóa
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="space-y-3 max-w-sm border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-500">Thêm người dùng mới</p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Tên đăng nhập">
            <input
              className={inputCls}
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              required
              autoComplete="off"
            />
          </Field>
          <Field label="Mật khẩu">
            <input
              type="password"
              className={inputCls}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </Field>
        </div>
        <div className="flex items-center gap-4">
          <SubmitBtn status={addStatus} label="Thêm" />
          <StatusMsg status={addStatus} error={addError} />
        </div>
      </form>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="p-8">
      <PageHeader title="Cài đặt" description="Quản lý mật khẩu và tài khoản đăng nhập." />
      <div className="mt-6 max-w-2xl space-y-6">
        <ChangePasswordSection />
        <UsersSection />
      </div>
    </div>
  )
}
