import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { GalleryAdminClient } from './GalleryAdminClient'

export const metadata: Metadata = {
  title: 'Gallery CMS | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default function AdminGalleryPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Content' }, { label: 'Gallery' }]} />
      <GalleryAdminClient />
    </div>
  )
}
