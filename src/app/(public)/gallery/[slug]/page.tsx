import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Section } from '@/components/ui/Section'
import { AlbumDetailClient } from './AlbumDetailClient'
import { SCHOOL_INFO } from '@/lib/constants'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const album = await prisma.galleryAlbum.findUnique({
    where: { slug: params.slug },
  })

  if (!album || !album.isActive || album.status !== 'PUBLISHED') {
    return {
      title: `Album Not Found | ${SCHOOL_INFO.name}`,
    }
  }

  const title = album.seoTitle || `${album.title} | Photo Gallery | ${SCHOOL_INFO.name}`
  const description = album.seoDescription || album.description || `View photo collection of ${album.title} at ${SCHOOL_INFO.name}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: album.coverImage ? [{ url: album.coverImage }] : [],
    },
  }
}

export default async function AlbumDetailPage({ params }: Props) {
  const album = await prisma.galleryAlbum.findUnique({
    where: { slug: params.slug },
    include: {
      media: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!album || !album.isActive || album.status !== 'PUBLISHED') {
    notFound()
  }

  return (
    <main>
      <Section>
        <AlbumDetailClient album={album as any} />
      </Section>
    </main>
  )
}
