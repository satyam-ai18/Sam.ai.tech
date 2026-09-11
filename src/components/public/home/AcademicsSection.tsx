'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { parseJsonField } from '@/lib/utils'
import styles from './AcademicsSection.module.css'

interface Academic {
  id: string
  title: string
  slug: string
  description: string
  image?: string | null
  subjects: string
  ageGroup?: string | null
}

const PROGRAM_COLORS = ['blue', 'green', 'gold', 'purple']

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}
const headerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export function AcademicsSection({ academics }: { academics: Academic[] }) {
  return (
    <section className={`section ${styles.section}`} id="academics" aria-labelledby="academics-heading">
      <div className="container">
        <motion.div
          className="section-header"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="section-badge primary">Academics</div>
          <h2 id="academics-heading" className="section-title">Our Academic Programs</h2>
          <div className="section-divider" />
          <p className="section-subtitle">
            A comprehensive curriculum from Pre-Primary through Secondary, designed to nurture every student's potential.
          </p>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {academics.map((a, i) => {
            const subjects = parseJsonField<string[]>(a.subjects, [])
            const color = PROGRAM_COLORS[i % PROGRAM_COLORS.length]
            return (
              <motion.div
                key={a.id}
                className={`${styles.card} ${styles[`card${color.charAt(0).toUpperCase()}${color.slice(1)}`]}`}
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardNumber}>0{i + 1}</div>
                  {a.ageGroup && <span className={styles.cardBadge}>{a.ageGroup}</span>}
                </div>
                <h3 className={styles.cardTitle}>{a.title}</h3>
                <p className={styles.cardDesc}>{a.description}</p>
                {subjects.length > 0 && (
                  <div className={styles.subjects}>
                    {subjects.slice(0, 4).map(s => (
                      <span key={s} className={styles.subject}>{s}</span>
                    ))}
                    {subjects.length > 4 && (
                      <span className={styles.subject}>+{subjects.length - 4} more</span>
                    )}
                  </div>
                )}
                <Link href={`/academics`} className={styles.cardLink}>
                  Learn More →
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          className={styles.cta}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Link href="/academics" className="btn btn-outline">
            View All Academic Programs
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
