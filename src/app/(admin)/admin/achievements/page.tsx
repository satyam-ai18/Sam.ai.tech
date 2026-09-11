import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { AchievementsAdminClient } from './AchievementsAdminClient'

export const metadata: Metadata = {
  title: 'Achievements CMS | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default function AdminAchievementsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Achievements' }]} />
      <AchievementsAdminClient />
    </div>
  )
}
