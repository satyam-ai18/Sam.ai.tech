'use client'

import { motion } from 'framer-motion'
import styles from './StatsSection.module.css'
import { GraduationCap, BookOpen, FlaskConical, Laptop } from 'lucide-react'

const STATS = [
  { value: 'CBSE', label: 'Pattern Curriculum', icon: <GraduationCap size={28} /> },
  { value: 'Co-Ed', label: 'English Medium School', icon: <BookOpen size={28} /> },
  { value: 'Science', label: 'Lab & Computer Lab', icon: <FlaskConical size={28} /> },
  { value: 'Nur–X', label: 'Classes Offered', icon: <Laptop size={28} /> },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const statVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export function StatsSection() {
  return (
    <section className={styles.section} aria-label="School at a glance">
      <div className={styles.container}>
        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={index}
              className={styles.statItem}
              variants={statVariants}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <div className={styles.iconWrapper}>{stat.icon}</div>
              <div className={styles.value}>{stat.value}</div>
              <div className={styles.label}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
