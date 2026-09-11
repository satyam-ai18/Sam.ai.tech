import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'
import styles from './CampusLifeSection.module.css'

export function CampusLifeSection() {
  const highlights = [
    {
      title: 'Co-Curricular Arts & Music',
      desc: 'Nurturing creativity and cultural self-expression through dedicated performing arts and musical activities.',
      category: 'Arts & Culture',
      image: 'https://www.mkconvent.com/uploads/gallery/media/v-4banner4.jpg',
    },
    {
      title: 'Athletics & Team Sports',
      desc: 'School grounds for physical education, yoga, badminton, cricket, and sports fitness.',
      category: 'Sports & Fitness',
      image: 'https://www.mkconvent.com/uploads/gallery/media/v-4banner4.jpg',
    },
    {
      title: 'Science & Activity Clubs',
      desc: 'Hands-on practical experiments encouraging innovative inquiry and scientific curiosity.',
      category: 'STEM & Activities',
      image: 'https://www.mkconvent.com/uploads/gallery/media/v-4banner4.jpg',
    },
  ]

  return (
    <section className={styles.section} id="campus-life" aria-label="Campus Life and Student Experience">
      <div className="container">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.eyebrow}>Beyond the Classroom</span>
            <h2 className={styles.heading}>Vibrant Campus Life</h2>
            <p className={styles.subheading}>
              Education at MK Convent transcends textbooks. We empower every child through dynamic sports, cultural clubs, science exhibitions, and community leadership.
            </p>
          </div>
          <Link href="/campus-life" className={styles.exploreBtn} id="explore-campus-life-btn">
            <span>Explore Campus Life</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.grid}>
          {highlights.map((item, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.imageWrap}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  style={{ objectFit: 'cover' }}
                />
                <span className={styles.categoryBadge}>{item.category}</span>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.desc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
