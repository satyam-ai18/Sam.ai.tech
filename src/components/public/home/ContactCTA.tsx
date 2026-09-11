import Link from 'next/link'
import { Phone, Mail, ArrowRight, MessageCircle } from 'lucide-react'
import styles from './ContactCTA.module.css'

interface ContactCTAProps {
  settings: Record<string, string>
}

export function ContactCTA({ settings }: ContactCTAProps) {
  const phone = settings.contact_phone || '8858514567'
  const whatsapp = settings.contact_whatsapp || '8858514567'

  return (
    <section className={styles.section} aria-label="Admissions and Contact Call to Action">
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.content}>
            <span className={styles.badge}>Admissions Open 2026-2027</span>
            <h2 className={styles.title}>
              Enroll Your Child at MK Convent School, Jaunpur
            </h2>
            <p className={styles.desc}>
              Visit our school at Sukkhipur, Shakarmandi, Jaunpur or call us during school hours. We are here to guide you through the admission process and answer any questions.
            </p>

            <div className={styles.actions}>
              <Link href="/admissions/apply" className={styles.primaryBtn}>
                <span>Apply for Admission</span>
                <ArrowRight size={18} />
              </Link>

              <a href={`tel:${phone}`} className={styles.phoneBtn}>
                <Phone size={18} />
                <span>Call +91 {phone}</span>
              </a>

              <a
                href={`https://wa.me/91${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
