import qs from 'qs'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || ''

export interface StrapiMeta {
  pagination?: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}

export interface StrapiResponse<T> {
  data: T
  meta: StrapiMeta
}

export interface StrapiError {
  status: number
  name: string
  message: string
  details: Record<string, unknown>
}

export type StrapiImage = {
  id: number
  documentId: string
  url: string
  alternativeText: string | null
  width: number
  height: number
  formats?: {
    thumbnail?: StrapiImageFormat
    small?: StrapiImageFormat
    medium?: StrapiImageFormat
    large?: StrapiImageFormat
  }
}

type StrapiImageFormat = {
  url: string
  width: number
  height: number
}

async function fetchStrapi<T>(
  endpoint: string,
  queryParams?: Record<string, unknown>,
  options?: RequestInit
): Promise<StrapiResponse<T>> {
  const query = queryParams ? `?${qs.stringify(queryParams, { encodeValuesOnly: true })}` : ''
  const url = `${STRAPI_URL}/api${endpoint}${query}`

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(error?.error?.message || `Strapi API error: ${res.status}`)
  }

  return res.json()
}

// ─── API helpers ─────────────────────────────────────────────────────────────

export async function getSingle<T>(
  singular: string,
  queryParams?: Record<string, unknown>
): Promise<T> {
  const res = await fetchStrapi<T>(`/${singular}`, queryParams, {
    next: { tags: [singular] },
  })
  return res.data
}

export async function getCollection<T>(
  plural: string,
  queryParams?: Record<string, unknown>
): Promise<StrapiResponse<T[]>> {
  return fetchStrapi<T[]>(`/${plural}`, queryParams, {
    next: { tags: [plural] },
  })
}

export function getStrapiMedia(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${STRAPI_URL}${url}`
}

export { fetchStrapi }
