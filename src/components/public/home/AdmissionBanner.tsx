import React from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Search, Calendar } from 'lucide-react'
import styles from './AdmissionBanner.module.css'

interface AdmissionBannerProps {
  settings: Record<string, string>
}

export function AdmissionBanner({ settings }: AdmissionBannerProps) {
  const isOpen = settings.admission_open !== 'false'
  if (!isOpen) return null

  const year = settings.admission_year || '2026–2027'
  const deadline = settings.admission_deadline || 'March 31, 2027'

  return (
    <section className={styles.banner} aria-label="Admissions Announcement">
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.left}>
            <div className={styles.badge}>
              <Sparkles size={14} className={styles.badgeIcon} />
              <span>Admissions Open {year}</span>
            </div>
            <h2 className={styles.title}>Admissions Open for Academic Year {year}</h2>
            <p className={styles.desc}>
              Dear Parents, secure your child&apos;s future with quality English medium education in Jaunpur. MK Convent School offers a safe and nurturing environment for all-round development — contact us and enroll your child today.
              {deadline && (
                <span className={styles.deadline}>
                  <Calendar size={13} />
                  Last Date: {deadline}
                </span>
              )}
            </p>
          </div>

          <div className={styles.right}>
            <Link href="/admissions/apply" className={styles.applyBtn} id="admission-banner-apply">
              <span>Apply Online</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/admissions/status" className={styles.statusBtn} id="admission-banner-status">
              <Search size={15} />
              <span>Check Application Status</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
