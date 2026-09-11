import Link from 'next/link'
import { Phone, MapPin, Clock, BookOpen } from 'lucide-react'
import styles from './QuickInfo.module.css'

interface QuickInfoProps {
  settings: Record<string, string>
}

export function QuickInfo({ settings }: QuickInfoProps) {
  const phone = settings.contact_phone || '8858514567'
  const address = settings.contact_address || 'Sukkhipur, Shakarmandi, Jaunpur'
  const admissionOpen = settings.admission_open === 'true'
  const admissionYear = settings.admission_year || '2026-2027'

  const items = [
    { icon: <Phone size={22} />, label: 'Call Us', value: phone, href: `tel:${phone}` },
    { icon: <MapPin size={22} />, label: 'Location', value: address },
    { icon: <Clock size={22} />, label: 'School Hours', value: 'Mon–Sat: 8:00 AM – 3:00 PM' },
    { icon: <BookOpen size={22} />, label: 'Admissions', value: admissionOpen ? `Open for ${admissionYear}` : 'Currently Closed', isAdmission: true },
  ]

  return (
    <section className={styles.section} aria-labelledby="quick-info-heading">
      <h2 id="quick-info-heading" className="sr-only">Quick Information</h2>
      <div className="container">
        <div className={styles.grid}>
          {items.map((item, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.icon}>{item.icon}</div>
              <div className={styles.text}>
                <div className={styles.label}>{item.label}</div>
                {item.href ? (
                  <a href={item.href} className={styles.value}>{item.value}</a>
                ) : item.isAdmission ? (
                  <Link href="/admissions" className={`${styles.value} ${styles.admissionLink}`}>
                    {item.value} →
                  </Link>
                ) : (
                  <div className={styles.value}>{item.value}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
