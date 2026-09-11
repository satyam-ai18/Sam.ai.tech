import { prisma } from '@/lib/db'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { NavigationClient } from './NavigationClient'

export const dynamic = 'force-dynamic'

export default async function AdminNavigationPage() {
  const items = await prisma.navigationItem.findMany({
    orderBy: { order: 'asc' },
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Website', href: '/admin/website' }, { label: 'Navigation' }]} />
      <NavigationClient initialItems={items} />
    </div>
  )
}
