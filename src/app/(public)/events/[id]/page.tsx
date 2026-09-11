import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, MapPin, ChevronRight, ArrowLeft, ExternalLink } from 'lucide-react'
import { SCHOOL_INFO } from '@/lib/constants'

interface EventDetailProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: EventDetailProps): Promise<Metadata> {
  const { id } = await params
  const event = await prisma.event.findFirst({
    where: {
      OR: [{ slug: id }, { id: id }],
      status: 'PUBLISHED',
    },
  })

  if (!event) {
    return { title: `Event Not Found | ${SCHOOL_INFO.name}` }
  }

  return {
    title: event.seoTitle || `${event.title} | ${SCHOOL_INFO.name}`,
    description: event.seoDescription || event.description.slice(0, 160),
    openGraph: {
      title: event.seoTitle || event.title,
      description: event.description.slice(0, 160),
      images: event.image ? [event.image] : undefined,
    },
  }
}

export default async function EventDetailPage({ params }: EventDetailProps) {
  const { id } = await params
  const event = await prisma.event.findFirst({
    where: {
      OR: [{ slug: id }, { id: id }],
      status: 'PUBLISHED',
    },
  })

  if (!event) {
    notFound()
  }

  // Fetch upcoming related events
  const relatedEvents = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      NOT: { id: event.id },
    },
    take: 3,
    orderBy: { startDate: 'asc' },
  })

  return (
    <main style={{ minHeight: '80vh', background: 'hsl(220, 20%, 98%)' }}>
      {/* Header Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, hsl(220, 65%, 22%) 0%, hsl(220, 55%, 14%) 100%)',
          color: '#ffffff',
          padding: '3.5rem 1.5rem 3rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8125rem',
              color: 'hsl(220, 20%, 75%)',
              marginBottom: '1.25rem',
            }}
          >
            <Link href="/" style={{ color: '#ffffff', textDecoration: 'none' }}>
              Home
            </Link>
            <ChevronRight size={13} />
            <Link href="/events" style={{ color: '#ffffff', textDecoration: 'none' }}>
              Events
            </Link>
            <ChevronRight size={13} />
            <span style={{ color: 'hsl(40, 95%, 65%)' }}>Event Details</span>
          </nav>

          <span
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              background: 'hsl(40, 92%, 50%)',
              color: 'hsl(220, 35%, 15%)',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          >
            School Event
          </span>

          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              lineHeight: 1.25,
              margin: '0 0 1.5rem 0',
              fontFamily: 'var(--font-heading, Playfair Display, serif)',
            }}
          >
            {event.title}
          </h1>

          {/* Details Bar */}
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              fontSize: '0.875rem',
              color: 'hsl(220, 20%, 85%)',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} />
              {new Date(event.startDate).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>

            {event.startTime && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} />
                {event.startTime} {event.endTime ? `– ${event.endTime}` : ''}
              </span>
            )}

            {event.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} />
                {event.location}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Body Container */}
      <div style={{ maxWidth: '840px', margin: '-1.5rem auto 4rem auto', padding: '0 1.5rem' }}>
        <article
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
            border: '1px solid hsl(220, 20%, 92%)',
            overflow: 'hidden',
          }}
        >
          {event.image && (
            <div style={{ position: 'relative', width: '100%', height: '380px', background: 'hsl(220, 20%, 95%)' }}>
              <Image src={event.image} alt={event.title} fill priority style={{ objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', marginBottom: '1rem' }}>
              About This Event
            </h3>

            <div
              style={{
                fontSize: '1.0625rem',
                lineHeight: 1.8,
                color: 'hsl(220, 25%, 25%)',
                whiteSpace: 'pre-wrap',
                marginBottom: '2.5rem',
              }}
            >
              {event.description}
            </div>

            {event.registrationUrl && (
              <div style={{ marginBottom: '2.5rem' }}>
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.75rem',
                    borderRadius: '8px',
                    background: 'hsl(220, 65%, 28%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                  }}
                >
                  <span>Register for Event</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            )}

            <div
              style={{
                borderTop: '1px solid hsl(220, 20%, 92%)',
                paddingTop: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Link
                href="/events"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'hsl(220, 65%, 28%)',
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to All Events</span>
              </Link>
            </div>
          </div>
        </article>

        {/* Other Upcoming Events */}
        {relatedEvents.length > 0 && (
          <div style={{ marginTop: '3.5rem' }}>
            <h3
              style={{
                fontSize: '1.5rem',
                fontFamily: 'var(--font-heading, Playfair Display, serif)',
                fontWeight: 700,
                color: 'hsl(220, 35%, 15%)',
                marginBottom: '1.5rem',
              }}
            >
              Other Upcoming Events
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {relatedEvents.map((re) => (
                <Link
                  key={re.id}
                  href={`/events/${re.slug || re.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid hsl(220, 20%, 90%)',
                      padding: '1.25rem',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(40, 92%, 45%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} />
                        {new Date(re.startDate).toLocaleDateString()}
                      </span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.5rem 0', color: 'hsl(220, 35%, 15%)' }}>
                        {re.title}
                      </h4>
                      {re.location && (
                        <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={12} /> {re.location}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
