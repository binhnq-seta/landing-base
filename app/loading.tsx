'use client'

import { useEffect, useState } from 'react'
import { InitialLoadingScreen } from '@/components/layout/InitialLoadingScreen'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

export default function Loading() {
  const [copy, setCopy] = useState(vi.loading)

  useEffect(() => {
    const locale = document.cookie.split('; ').find((item) => item.startsWith('locale='))?.split('=')[1]
    setCopy(locale === 'en' ? en.loading : vi.loading)
  }, [])

  return <InitialLoadingScreen eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
}
