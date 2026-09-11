import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { PublicCard } from '@/components/ui/Card'
import { SCHOOL_INFO } from '@/lib/constants'
import { Sparkles, Trophy, Music, Compass } from 'lucide-react'

export const metadata: Metadata = {
  title: `Campus Life | ${SCHOOL_INFO.name}`,
  description: `Experience everyday student life, co-curriculars, sports, and creative arts at ${SCHOOL_INFO.name}.`,
}

export const dynamic = 'force-dynamic'

export default async function CampusLifePage() {
  const page = await prisma.page.findUnique({ where: { slug: 'campus-life' } })

  const activities = [
    { title: 'Sports & Athletics', desc: 'Cricket, football, track events, and regular physical conditioning encouraging teamwork and resilience.', icon: <Trophy size={20} /> },
    { title: 'Visual & Performing Arts', desc: 'Music, classical and folk dance, theater, and fine arts nurturing creativity and aesthetic sensibility.', icon: <Music size={20} /> },
    { title: 'Science & Innovation Club', desc: 'Practical lab experimentation, robotics workshops, and annual district science competitions.', icon: <Sparkles size={20} /> },
    { title: 'Leadership & Community', desc: 'Student council, environmental conservation drives, and community outreach promoting social responsibility.', icon: <Compass size={20} /> },
  ]

  return (
    <main>
      <PageHeader
        badge="Beyond Academics"
        title="Vibrant Campus Life"
        description="A dynamic and inclusive atmosphere where sports, arts, leadership, and friendships flourish."
      />

      <Section>
        {page?.content && (
          <div
            style={{ maxWidth: '800px', margin: '0 auto 3.5rem auto', fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--color-text)' }}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {activities.map((act, i) => (
            <PublicCard key={i} style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--color-primary-muted, hsl(220, 65%, 95%))',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                {act.icon}
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>
                {act.title}
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                {act.desc}
              </p>
            </PublicCard>
          ))}
        </div>
      </Section>
    </main>
  )
}
