'use client'

import Image from 'next/image'
import Link from 'next/link'
import { GraduationCap, BookOpen, Users, ImageOff } from 'lucide-react'
import { motion } from 'framer-motion'
import styles from './WhyUsSection.module.css'

// ── Static fallback images (if admin hasn't uploaded) ──
const FALLBACK_IMAGES: Record<string, string> = {
  default_0: '/features/science-lab.jpg',
  default_1: '/features/computer-lab.jpg',
  default_2: '/features/library.jpg',
  default_3: '/features/sports.jpg',
}

const SERVICE_BOXES = [
  { icon: <GraduationCap size={28} />, title: 'Quality Education', desc: 'Holistic & overall development of every student through CBSE curriculum.', color: 'blue' },
  { icon: <BookOpen size={28} />,       title: 'Books & Library',   desc: 'In-campus library with thousands of books for students to explore.', color: 'gold' },
  { icon: <Users size={28} />,          title: 'Skilled Teachers',  desc: 'Subject expert teachers dedicated to nurturing every child\'s potential.', color: 'green' },
]

// stagger variants
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

interface Facility {
  id: string
  title: string
  slug: string
  description: string
  image?: string | null
  icon?: string | null
}

export function WhyUsSection({ facilities }: { facilities: Facility[]; values?: unknown[] }) {
  // Use top 4 facilities; fallback to hardcoded images if facility has no image
  const displayFacilities = facilities.slice(0, 4)

  return (
    <section className={styles.section} id="why-us" aria-labelledby="why-us-heading">

      {/* ── Animated Service Boxes Row ─────────────── */}
      <div className={styles.serviceRow}>
        <div className="container">
          <motion.div
            className={styles.serviceGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {SERVICE_BOXES.map((box) => (
              <motion.div
                key={box.title}
                className={`${styles.serviceBox} ${styles[`service${box.color.charAt(0).toUpperCase()}${box.color.slice(1)}`]}`}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className={styles.serviceIcon}>{box.icon}</div>
                <div className={styles.serviceText}>
                  <h3 className={styles.serviceTitle}>{box.title}</h3>
                  <p className={styles.serviceDesc}>{box.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Feature Cards with Images ──────────────── */}
      <div className="container">
        <motion.div
          className="section-header"
          style={{ marginTop: 'clamp(2rem, 3vw, 3rem)' }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="section-badge">Our Facilities</div>
          <h2 id="why-us-heading" className="section-title">Our Main Features &amp; Facilities</h2>
          <div className="section-divider" />
          <p className="section-subtitle">
            World-class infrastructure designed to give every student the best learning environment.
          </p>
        </motion.div>

        {displayFacilities.length > 0 ? (
          <motion.div
            className={styles.featureGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {displayFacilities.map((facility, i) => {
              const imgSrc = facility.image || FALLBACK_IMAGES[`default_${i}`] || '/features/science-lab.jpg'
              return (
                <motion.div
                  key={facility.id}
                  className={styles.featureCard}
                  variants={itemVariants}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                >
                  <div className={styles.featureImgWrap}>
                    <Image
                      src={imgSrc}
                      alt={facility.title}
                      fill
                      className={styles.featureImg}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className={styles.featureOverlay} />
                    <span className={styles.featureNumber}>0{i + 1}</span>
                  </div>
                  <div className={styles.featureBody}>
                    <h3 className={styles.featureTitle}>{facility.title}</h3>
                    <p className={styles.featureDesc}>{facility.description}</p>
                    <Link href={`/facilities`} className={styles.featureBtn} id={`feature-${facility.id}-btn`}>
                      Learn More →
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          // Fallback hardcoded cards if no facilities in DB
          <motion.div
            className={styles.featureGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {[
              { title: 'Science Lab', desc: 'State-of-the-art lab for experiments to understand principles of science.', img: '/features/science-lab.jpg' },
              { title: 'Computer Lab', desc: 'Computer education for all students to make them confident in this digital era.', img: '/features/computer-lab.jpg' },
              { title: 'Library & Books', desc: 'A rich in-campus library that fosters reading habits and broadens horizons.', img: '/features/library.jpg' },
              { title: 'Physical & Sports', desc: 'All-round development through sports, yoga and activities for overall skill building.', img: '/features/sports.jpg' },
            ].map((card, i) => (
              <motion.div key={card.title} className={styles.featureCard} variants={itemVariants} whileHover={{ y: -6 }}>
                <div className={styles.featureImgWrap}>
                  <Image src={card.img} alt={card.title} fill className={styles.featureImg} sizes="25vw" />
                  <div className={styles.featureOverlay} />
                  <span className={styles.featureNumber}>0{i + 1}</span>
                </div>
                <div className={styles.featureBody}>
                  <h3 className={styles.featureTitle}>{card.title}</h3>
                  <p className={styles.featureDesc}>{card.desc}</p>
                  <Link href="/facilities" className={styles.featureBtn}>Learn More →</Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          className={styles.viewAllWrap}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link href="/facilities" className="btn btn-primary" id="features-view-all-btn">
            Explore All Facilities
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
