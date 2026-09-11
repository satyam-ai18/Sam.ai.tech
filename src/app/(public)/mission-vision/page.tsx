import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { PublicCard } from '@/components/ui/Card'
import { SCHOOL_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Mission & Vision | ${SCHOOL_INFO.name}`,
  description: `Discover the mission, vision, and core educational objectives of ${SCHOOL_INFO.name}.`,
}

export const dynamic = 'force-dynamic'

export default async function MissionVisionPage() {
  const [mission, vision] = await Promise.all([
    prisma.aboutSection.findUnique({ where: { key: 'mission' } }),
    prisma.aboutSection.findUnique({ where: { key: 'vision' } }),
  ])

  return (
    <main>
      <PageHeader
        badge="Guiding Principles"
        title="Our Mission & Vision"
        description="Fostering character, academic rigor, and global competency in every student."
      />

      <Section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <PublicCard style={{ padding: '2.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Purpose & Direction
            </span>
            <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading, "Playfair Display", serif)', fontWeight: 700, margin: '0.5rem 0 1rem 0' }}>
              {mission?.heading || 'Our Mission'}
            </h2>
            <div
              style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-text-muted)' }}
              dangerouslySetInnerHTML={{
                __html: mission?.content || '<p>Maa Kaushilya Convent School is an autonomous, charitable, non-profit educational institution dedicated to providing quality CBSE-pattern education with moral values and all-round development. May the sapling grow into a sturdy tree and spread its branches.</p>',
              }}
            />
          </PublicCard>

          <PublicCard style={{ padding: '2.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-accent, hsl(40, 92%, 50%))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Long-term Aspiration
            </span>
            <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading, "Playfair Display", serif)', fontWeight: 700, margin: '0.5rem 0 1rem 0' }}>
              {vision?.heading || 'Our Vision'}
            </h2>
            <div
              style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-text-muted)' }}
              dangerouslySetInnerHTML={{
                __html: vision?.content || '<p>To nurture self-discipline, curiosity, leadership, independent thinking, sportsmanship, and social responsibility in every student from early childhood onwards.</p>',
              }}
            />
          </PublicCard>
        </div>
      </Section>
    </main>
  )
}
