'use client'

import Link from 'next/link'
import { Monitor, FlaskConical, Laptop, BookOpen, Trophy, Shield, Bus, Music, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { parseJsonField } from '@/lib/utils'
import styles from './FacilitiesSection.module.css'

const ICON_MAP: Record<string, React.ReactNode> = {
  Monitor: <Monitor size={28} />,
  FlaskConical: <FlaskConical size={28} />,
  Laptop: <Laptop size={28} />,
  BookOpen: <BookOpen size={28} />,
  Trophy: <Trophy size={28} />,
  Shield: <Shield size={28} />,
  Bus: <Bus size={28} />,
  Music: <Music size={28} />,
}

interface Facility {
  id: string
  title: string
  slug: string
  description: string
  icon?: string | null
  features: string
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export function FacilitiesSection({ facilities }: { facilities: Facility[] }) {
  return (
    <section className={`section ${styles.section}`} id="facilities" aria-labelledby="facilities-heading">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="section-badge">Facilities</div>
          <h2 id="facilities-heading" className="section-title">World-Class Facilities</h2>
          <div className="section-divider" />
          <p className="section-subtitle">
            Modern infrastructure and facilities designed to provide the best learning and development environment for every student.
          </p>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {facilities.map((f, i) => {
            const features = parseJsonField<string[]>(f.features, [])
            return (
              <motion.div
                key={f.id}
                className={styles.card}
                variants={cardVariants}
                whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.1)', transition: { duration: 0.2 } }}
              >
                <div className={styles.cardTop}>
                  <div className={styles.icon}>
                    {f.icon && ICON_MAP[f.icon] ? ICON_MAP[f.icon] : <CheckCircle size={28} />}
                  </div>
                  <h3 className={styles.title}>{f.title}</h3>
                </div>
                <p className={styles.desc}>{f.description}</p>
                {features.length > 0 && (
                  <ul className={styles.features}>
                    {features.slice(0, 3).map(feat => (
                      <li key={feat} className={styles.feature}>
                        <CheckCircle size={13} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                )}
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
          <Link href="/facilities" className="btn btn-primary">
            Explore All Facilities
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
