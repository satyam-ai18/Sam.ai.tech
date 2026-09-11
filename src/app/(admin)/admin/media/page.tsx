import { prisma } from '@/lib/db'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { MediaClient } from './MediaClient'

export const dynamic = 'force-dynamic'

export default async function AdminMediaPage() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Media Library' }]} />
      <MediaClient initialMedia={media as any} />
    </div>
  )
}
