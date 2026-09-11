import Link from 'next/link'
import { Bell, AlertCircle, ChevronRight, Calendar } from 'lucide-react'
import styles from './NoticeBoardSection.module.css'

interface Notice {
  id: string
  title: string
  description?: string | null
  date: Date | string
  isImportant: boolean
  expiryDate?: Date | string | null
}

interface NoticeBoardSectionProps {
  notices: Notice[]
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function NoticeBoardSection({ notices }: NoticeBoardSectionProps) {
  if (!notices || notices.length === 0) return null

  return (
    <section className={styles.section} id="notice-board" aria-labelledby="notice-board-heading">
      <div className="container">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className="section-badge primary">
              <Bell size={14} />
              School Notices
            </div>
            <h2 id="notice-board-heading" className="section-title" style={{ textAlign: 'left', marginInline: 0 }}>
              Notice Board
            </h2>
            <p className={styles.subtitle}>
              Important announcements and circulars from Maa Kaushilya Convent School
            </p>
          </div>
          <Link href="/notices" className={styles.viewAllBtn} aria-label="View all notices">
            View All Notices
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className={styles.noticeList}>
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`${styles.noticeCard} ${notice.isImportant ? styles.important : ''}`}
            >
              {notice.isImportant && (
                <div className={styles.importantBadge}>
                  <AlertCircle size={12} />
                  Important
                </div>
              )}
              <div className={styles.noticeContent}>
                <div className={styles.noticeTitle}>{notice.title}</div>
                {notice.description && (
                  <p className={styles.noticeDesc}>{notice.description}</p>
                )}
              </div>
              <div className={styles.noticeMeta}>
                <span className={styles.noticeDate}>
                  <Calendar size={13} />
                  {formatDate(notice.date)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.adminNote}>
          <Bell size={14} />
          Notices are managed by the school admin and updated regularly. Check back for latest circulars.
        </div>
      </div>
    </section>
  )
}
