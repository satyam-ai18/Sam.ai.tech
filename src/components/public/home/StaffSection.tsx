import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, GraduationCap } from 'lucide-react'
import styles from './StaffSection.module.css'

interface TeacherItem {
  id: string
  name: string
  designation: string
  qualification: string
  department: string
  photo?: string | null
  isActive: boolean
}

interface StaffSectionProps {
  teachers: TeacherItem[]
}

export function StaffSection({ teachers }: StaffSectionProps) {
  const activeTeachers = teachers.filter((t) => t.isActive).slice(0, 4)
  if (activeTeachers.length === 0) return null

  return (
    <section className={styles.section} id="faculty" aria-label="Faculty and Leadership">
      <div className="container">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.eyebrow}>Dedicated Mentors</span>
            <h2 className={styles.heading}>Our Esteemed Faculty</h2>
            <p className={styles.subheading}>
              Passionate educators committed to inspiring academic curiosity, moral values, and student growth.
            </p>
          </div>
          <Link href="/teachers" className={styles.viewAllBtn} id="view-all-faculty-btn">
            <span>View All Faculty</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.grid}>
          {activeTeachers.map((teacher) => (
            <div key={teacher.id} className={styles.card}>
              <div className={styles.photoWrap}>
                {teacher.photo ? (
                  <Image
                    src={teacher.photo}
                    alt={teacher.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 280px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className={styles.placeholderPhoto}>
                    <GraduationCap size={44} strokeWidth={1.2} />
                  </div>
                )}
                <span className={styles.deptBadge}>{teacher.department}</span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.name}>{teacher.name}</h3>
                <div className={styles.designation}>{teacher.designation}</div>
                {teacher.qualification && (
                  <div className={styles.qualification}>{teacher.qualification}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
