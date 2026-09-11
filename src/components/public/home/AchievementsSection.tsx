import { Trophy, Medal, Award } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'
import styles from './AchievementsSection.module.css'

interface Achievement {
  id: string
  title: string
  description?: string | null
  studentName?: string | null
  category: string
  award?: string | null
  position?: string | null
  date?: Date | null
}

const CATEGORY_COLORS: Record<string, string> = {
  Academics: 'blue',
  Sports: 'green',
  Cultural: 'purple',
  Science: 'teal',
  Arts: 'rose',
  General: 'gold',
}

export function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
  return (
    <section className={`section ${styles.section}`} id="achievements" aria-labelledby="achievements-heading">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">Achievements</div>
          <h2 id="achievements-heading" className="section-title">Our Pride & Achievements</h2>
          <div className="section-divider" />
          <p className="section-subtitle">
            Celebrating the excellence, talent, and accomplishments of our students and school community.
          </p>
        </div>

        <div className={styles.grid}>
          {achievements.map((a, i) => {
            const color = CATEGORY_COLORS[a.category] || 'gold'
            return (
              <div key={a.id} className={`${styles.card} ${styles[`card${color.charAt(0).toUpperCase()}${color.slice(1)}`]}`}>
                <div className={styles.cardTop}>
                  <div className={styles.icon}>
                    {i % 3 === 0 ? <Trophy size={20} /> : i % 3 === 1 ? <Medal size={20} /> : <Award size={20} />}
                  </div>
                  <span className={styles.category}>{a.category}</span>
                </div>
                <h3 className={styles.title}>{a.title}</h3>
                {a.description && <p className={styles.desc}>{a.description}</p>}
                <div className={styles.meta}>
                  {a.studentName && <span className={styles.student}>🎓 {a.studentName}</span>}
                  {a.position && <span className={styles.position}>{a.position}</span>}
                  {a.date && <span className={styles.date}>{formatDateShort(a.date)}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
