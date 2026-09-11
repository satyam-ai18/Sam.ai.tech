import React from 'react'
import Link from 'next/link'
import { ArrowRight, UserCheck, FileSearch, Users, GraduationCap } from 'lucide-react'
import styles from './AdmissionProcess.module.css'

interface Step {
  num: string
  title: string
  desc: string
  icon: React.ReactNode
}

export function AdmissionProcess() {
  const steps: Step[] = [
    {
      num: '01',
      title: 'Online Application',
      desc: 'Submit student information, select the academic grade, and provide parent contact details online.',
      icon: <UserCheck size={24} />,
    },
    {
      num: '02',
      title: 'Document Verification',
      desc: 'Submit birth certificate, previous school transfer certificate, and passport-size photographs.',
      icon: <FileSearch size={24} />,
    },
    {
      num: '03',
      title: 'Interactive Assessment',
      desc: 'Friendly interaction with the student and parents to understand learning aptitude and foundational skills.',
      icon: <Users size={24} />,
    },
    {
      num: '04',
      title: 'Admission Confirmation',
      desc: 'Confirmation of seat allocation, completion of enrollment formalities, and formal induction.',
      icon: <GraduationCap size={24} />,
    },
  ]

  return (
    <section className={styles.section} id="admission-process" aria-label="Admission Process">
      <div className="container">
        <div className={styles.header}>
          <span className={styles.eyebrow}>Transparent & Structured</span>
          <h2 className={styles.heading}>Admission Process in 4 Simple Steps</h2>
          <p className={styles.subheading}>
            Our admissions procedure is transparent, convenient, and designed to guide families at every stage of enrollment.
          </p>
        </div>

        <div className={styles.grid}>
          {steps.map((st) => (
            <div key={st.num} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.num}>{st.num}</span>
                <div className={styles.iconWrap}>{st.icon}</div>
              </div>
              <h3 className={styles.cardTitle}>{st.title}</h3>
              <p className={styles.cardDesc}>{st.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <Link href="/admissions/apply" className={styles.ctaBtn} id="process-apply-btn">
            <span>Start Online Application</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
