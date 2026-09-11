import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { AcademicsAdminClient } from './AcademicsAdminClient'

export const metadata: Metadata = {
  title: 'Academics CMS | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default function AdminAcademicsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Academics' }]} />
      <AcademicsAdminClient />
    </div>
  )
}
