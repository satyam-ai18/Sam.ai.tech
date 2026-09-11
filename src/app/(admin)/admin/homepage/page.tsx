import { prisma } from '@/lib/db'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { HomepageClient } from './HomepageClient'

export const dynamic = 'force-dynamic'

export default async function AdminHomepagePage() {
  const sections = await prisma.homepageSection.findMany({
    orderBy: { order: 'asc' },
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Website', href: '/admin/website' }, { label: 'Homepage' }]} />
      <HomepageClient initialSections={sections as any} />
    </div>
  )
}
