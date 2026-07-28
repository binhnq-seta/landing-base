import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AdminSidebar } from './AdminSidebar'

export const metadata: Metadata = { title: 'Admin CMS – General Systems' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
