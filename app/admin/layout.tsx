import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AdminSidebar } from './AdminSidebar'

export const metadata: Metadata = {
  title: { absolute: 'Admin CMS – General Systems' },
  robots: { index: false, follow: false, noarchive: true },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-y-scroll">{children}</main>
    </div>
  )
}
