import type { StrapiImage } from '@/lib/strapi/client'

// ─── Shared ───────────────────────────────────────────────────────────────────

export type SEO = {
  metaTitle: string
  metaDescription: string
  shareImage?: StrapiImage
  keywords?: string
  canonicalURL?: string
}

export type Link = {
  id: number
  label: string
  href: string
  isExternal?: boolean
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export type HeroSection = {
  id: number
  heading: string
  subheading?: string
  description?: string
  cta?: Link
  backgroundVideo?: StrapiMedia
  backgroundImage?: StrapiImage
}

export type FeatureItem = {
  id: number
  title: string
  description: string
  icon?: string
  image?: StrapiImage
}

export type FeaturesSection = {
  id: number
  heading: string
  subheading?: string
  features: FeatureItem[]
}

export type LandingPage = {
  id: number
  documentId: string
  title: string
  slug: string
  seo?: SEO
  hero?: HeroSection
  features?: FeaturesSection
  publishedAt: string
  updatedAt: string
}

export type StrapiMedia = {
  id: number
  url: string
  mime: string
  name: string
}

// ─── Global ───────────────────────────────────────────────────────────────────

export type NavLink = {
  id: number
  label: string
  href: string
}

export type GlobalData = {
  siteName: string
  favicon?: StrapiImage
  navbar?: {
    logo?: StrapiImage
    links: NavLink[]
    cta?: Link
  }
  footer?: {
    copyright: string
    links?: NavLink[]
  }
}
