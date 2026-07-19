import Image from 'next/image'
import { getStrapiMedia } from '@/lib/strapi/client'
import type { StrapiImage as StrapiImageType } from '@/lib/strapi/client'

interface StrapiImageProps {
  image: StrapiImageType
  className?: string
  priority?: boolean
  sizes?: string
}

export function StrapiImage({
  image,
  className = '',
  priority = false,
  sizes = '100vw',
}: StrapiImageProps) {
  const src = getStrapiMedia(image.url)
  const alt = image.alternativeText ?? ''

  return (
    <Image
      src={src}
      alt={alt}
      width={image.width}
      height={image.height}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  )
}
