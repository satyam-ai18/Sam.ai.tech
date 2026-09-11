import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { GalleryClient } from './GalleryClient'
import { SCHOOL_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Photo Gallery | ${SCHOOL_INFO.name}`,
  description: `Explore photo memories, academic events, sports championships, and campus life at ${SCHOOL_INFO.name}.`,
}

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const albums = await prisma.galleryAlbum.findMany({
    where: { isActive: true, status: 'PUBLISHED' },
    include: {
      media: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })

  return (
    <main>
      <PageHeader
        badge="Visual Memories"
        title="School Photo Gallery"
        description="A visual journey into vibrant campus life, annual functions, science exhibitions, sports, and student achievements."
      />

      <Section>
        <GalleryClient albums={albums as any} />
      </Section>
    </main>
  )
}
