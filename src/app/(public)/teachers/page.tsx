import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { TeachersClient } from './TeachersClient'
import { SCHOOL_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Our Faculty & Leadership | ${SCHOOL_INFO.name}`,
  description: `Meet the dedicated educators, subject specialists, and academic leadership team of ${SCHOOL_INFO.name}.`,
}

export const dynamic = 'force-dynamic'

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    where: { isActive: true, status: 'ACTIVE' },
    orderBy: { order: 'asc' },
  })

  return (
    <main>
      <PageHeader
        badge="Educators & Mentors"
        title="Our Dedicated Faculty"
        description="Passionate, experienced educators committed to nurturing character, critical intellect, and holistic student potential."
      />

      <Section>
        <TeachersClient teachers={teachers as any} />
      </Section>
    </main>
  )
}
