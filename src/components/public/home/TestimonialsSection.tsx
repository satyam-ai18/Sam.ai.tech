'use client'

import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import styles from './TestimonialsSection.module.css'

interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  rating: number
  photo?: string | null
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0)
  const perPage = 3
  const pages = Math.ceil(testimonials.length / perPage)
  const visible = testimonials.slice(current * perPage, current * perPage + perPage)

  return (
    <section className={`section ${styles.section}`} id="testimonials" aria-labelledby="testimonials-heading">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">Testimonials</div>
          <h2 id="testimonials-heading" className="section-title">What Parents Say</h2>
          <div className="section-divider" />
          <p className="section-subtitle">
            Hear from the families who have trusted MK Convent with their children's education and future.
          </p>
        </div>

        <div className={styles.grid}>
          {visible.map(t => (
            <div key={t.id} className={styles.card}>
              <div className={styles.quoteIcon}><Quote size={28} /></div>
              <p className={styles.content}>{t.content}</p>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < t.rating ? 'var(--color-accent)' : 'none'} stroke={i < t.rating ? 'var(--color-accent)' : 'var(--color-border)'} />
                ))}
              </div>
              <div className={styles.author}>
                {t.photo ? (
                  <img src={t.photo} alt={t.name} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarFallback}>{getInitials(t.name)}</div>
                )}
                <div>
                  <div className={styles.name}>{t.name}</div>
                  <div className={styles.role}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pages > 1 && (
          <div className={styles.controls}>
            <button
              className={styles.btn}
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              aria-label="Previous testimonials"
            >
              <ChevronLeft size={20} />
            </button>
            <div className={styles.dots}>
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                  onClick={() => setCurrent(i)}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>
            <button
              className={styles.btn}
              onClick={() => setCurrent(Math.min(pages - 1, current + 1))}
              disabled={current === pages - 1}
              aria-label="Next testimonials"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
