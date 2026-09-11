import Link from 'next/link'
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'
import styles from './EventsSection.module.css'

interface Event {
  id: string
  title: string
  slug: string
  description: string
  startDate: Date
  startTime?: string | null
  endTime?: string | null
  location?: string | null
}

export function EventsSection({ events }: { events: Event[] }) {
  return (
    <section className={`section ${styles.section}`} id="events" aria-labelledby="events-heading">
      <div className="container">
        <div className={styles.header}>
          <div>
            <div className="section-badge">Events</div>
            <h2 id="events-heading" className="section-title" style={{ textAlign: 'left', marginInline: 0, marginBottom: 0 }}>
              Upcoming Events
            </h2>
          </div>
          <Link href="/events" className="btn btn-outline btn-sm">
            All Events <ArrowRight size={15} />
          </Link>
        </div>

        <div className={styles.grid}>
          {events.map(event => {
            const date = new Date(event.startDate)
            return (
              <Link key={event.id} href={`/events/${event.slug}`} className={styles.card}>
                <div className={styles.dateBadge}>
                  <span className={styles.day}>{date.getDate()}</span>
                  <span className={styles.month}>{date.toLocaleDateString('en-IN', { month: 'short' })}</span>
                  <span className={styles.year}>{date.getFullYear()}</span>
                </div>
                <div className={styles.body}>
                  <h3 className={styles.title}>{event.title}</h3>
                  <div className={styles.meta}>
                    {event.startTime && (
                      <span className={styles.metaItem}>
                        <Clock size={13} />
                        {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                      </span>
                    )}
                    {event.location && (
                      <span className={styles.metaItem}>
                        <MapPin size={13} />
                        {event.location}
                      </span>
                    )}
                  </div>
                  <p className={styles.desc}>{event.description.slice(0, 100)}...</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
