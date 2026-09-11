'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from './AboutSection.module.css'

interface AboutSectionProps {
  about: {
    heading: string
    subheading?: string | null
    content: string
    image?: string | null
    imageAlt?: string | null
  }
}

const fadeLeft = {
  hidden: { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}
const fadeRight = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export function AboutSection({ about }: AboutSectionProps) {
  return (
    <section className={`section ${styles.section}`} id="about" aria-labelledby="about-heading">
      <div className="container">
        <div className={styles.grid}>
          {/* Animated Image */}
          <motion.div
            className={styles.imageCol}
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className={styles.imageWrap}>
              {about.image ? (
                <img src={about.image} alt={about.imageAlt || 'About MK Convent School'} className={styles.image} loading="lazy" />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <div className={styles.placeholderInner}>
                    <div className={styles.placeholderIcon}>🏫</div>
                    <p>Maa Kaushilya Convent School</p>
                    <span>Sukkhipur, Jaunpur</span>
                  </div>
                </div>
              )}
              {/* Decorative accent */}
              <div className={styles.imageAccent} />
              <div className={styles.imageBadge}>
                <div className={styles.badgeText} style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                  🙏 Founded by<br /><strong>Late Kamla Devi</strong>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Animated Content */}
          <motion.div
            className={styles.content}
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="section-badge primary">About Our School</div>
            <h2 id="about-heading" className="section-title" style={{ textAlign: 'left', marginInline: 0 }}>
              {about.heading}
            </h2>
            {about.subheading && (
              <p className={styles.subheading}>{about.subheading}</p>
            )}
            <div
              className={styles.richText}
              dangerouslySetInnerHTML={{ __html: about.content }}
            />
            <div className={styles.actions}>
              <Link href="/about" className="btn btn-primary">
                Learn More About Us
              </Link>
              <Link href="/admissions" className="btn btn-outline">
                Apply for Admission
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
