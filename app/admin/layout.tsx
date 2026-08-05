import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AdminSidebar } from './AdminSidebar'

export const metadata: Metadata = { title: 'Admin CMS – General Systems' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-y-scroll">{children}</main>
    </div>
  )
}
