import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { FacilitiesAdminClient } from './FacilitiesAdminClient'

export const metadata: Metadata = {
  title: 'Campus Facilities CMS | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default function AdminFacilitiesPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Facilities' }]} />
      <FacilitiesAdminClient />
    </div>
  )
}
