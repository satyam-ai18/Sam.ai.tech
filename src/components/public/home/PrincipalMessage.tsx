import styles from './PrincipalMessage.module.css'
import { Quote } from 'lucide-react'

interface PrincipalMessageProps {
  principal: {
    heading: string
    subheading?: string | null
    content: string
    image?: string | null
  }
}

export function PrincipalMessage({ principal }: PrincipalMessageProps) {
  return (
    <section className={`section ${styles.section}`} id="principal" aria-labelledby="principal-heading">
      <div className="container">
        <div className={styles.grid}>
          {/* Image */}
          <div className={styles.imageCol}>
            <div className={styles.imageFrame}>
              {principal.image ? (
                <img src={principal.image} alt="School Principal" className={styles.image} loading="lazy" />
              ) : (
                <div className={styles.imageFallback}>
                  <div className={styles.fallbackInitial}>P</div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            <div className="section-badge">A Word from Leadership</div>
            <h2 id="principal-heading" className="section-title" style={{ textAlign: 'left', marginInline: 0 }}>
              {principal.heading}
            </h2>
            {principal.subheading && (
              <p className={styles.subheading}>{principal.subheading}</p>
            )}
            <div className={styles.quoteWrap}>
              <Quote size={36} className={styles.quoteIcon} />
              <div
                className={styles.richText}
                dangerouslySetInnerHTML={{ __html: principal.content }}
              />
            </div>
            <div className={styles.signature}>
              <div className={styles.sigLine} />
              <div className={styles.sigName}>School Principal</div>
              <div className={styles.sigSchool}>Maa Kaushilya Convent School</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
