import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { AchievementsClient } from './AchievementsClient'
import { SCHOOL_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Student Achievements & Accolades | ${SCHOOL_INFO.name}`,
  description: `Celebrate academic, sports, cultural, and Olympiad achievements and honors won by students of ${SCHOOL_INFO.name}.`,
}

export const dynamic = 'force-dynamic'

export default async function AchievementsPage() {
  let achievements: any[] = []
  try {
    achievements = await prisma.achievement.findMany({
      where: { isVisible: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
  } catch (error) {
    console.warn('DB not available for AchievementsPage, using defaults:', error)
  }

  return (
    <main>
      <PageHeader
        badge="Accolades & Honors"
        title="Student Achievements"
        description="Celebrating outstanding merit, board toppers, state championship medals, and creative excellence across disciplines."
      />

      <Section>
        <AchievementsClient achievements={achievements as any} />
      </Section>
    </main>
  )
}
