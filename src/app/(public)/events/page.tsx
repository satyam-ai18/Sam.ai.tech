import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { PublicCard } from '@/components/ui/Card'
import { SCHOOL_INFO } from '@/lib/constants'
import { Calendar, MapPin, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: `Upcoming Events | ${SCHOOL_INFO.name}`,
  description: `Check out upcoming school sports days, cultural festivals, exhibitions, and parent-teacher meetings at ${SCHOOL_INFO.name}.`,
}

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { startDate: 'asc' },
  })

  return (
    <main>
      <PageHeader
        badge="School Calendar"
        title="Upcoming Events"
        description="Key dates, annual day celebrations, athletic meets, and academic exhibitions."
      />

      <Section>
        {events.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No upcoming events scheduled right now.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {events.map((evt) => (
              <PublicCard key={evt.id} style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  <Calendar size={15} />
                  <span>{new Date(evt.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.75rem 0' }}>
                  {evt.title}
                </h3>

                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.25rem', flex: 1 }}>
                  {evt.description}
                </p>

                <div style={{ borderTop: '1px solid hsl(220, 20%, 92%)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  {evt.startTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} />
                      <span>{evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}</span>
                    </div>
                  )}
                  {evt.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} />
                      <span>{evt.location}</span>
                    </div>
                  )}
                </div>
              </PublicCard>
            ))}
          </div>
        )}
      </Section>
    </main>
  )
}
