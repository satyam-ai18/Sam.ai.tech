import { prisma } from '@/lib/db'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { WebsiteClient } from './WebsiteClient'

export const dynamic = 'force-dynamic'

export default async function AdminWebsitePage() {
  const [aboutSection, principalSection, coreValues] = await Promise.all([
    prisma.aboutSection.findUnique({ where: { key: 'about' } }),
    prisma.aboutSection.findUnique({ where: { key: 'principal' } }),
    prisma.coreValue.findMany({ orderBy: { order: 'asc' } }),
  ])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Website' }]} />
      <WebsiteClient
        initialAbout={aboutSection as any}
        initialPrincipal={principalSection as any}
        initialCoreValues={coreValues as any}
      />
    </div>
  )
}
