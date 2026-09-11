import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { TeachersAdminClient } from './TeachersAdminClient'

export const metadata: Metadata = {
  title: 'Faculty & Teachers CMS | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default function AdminTeachersPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Teachers' }]} />
      <TeachersAdminClient />
    </div>
  )
}
