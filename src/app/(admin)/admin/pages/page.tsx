import { prisma } from '@/lib/db'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { PagesClient } from './PagesClient'

export const dynamic = 'force-dynamic'

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Pages' }]} />
      <PagesClient initialPages={pages as any} />
    </div>
  )
}
