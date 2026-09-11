'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './HeroSection.module.css'

interface Slide {
  id: string
  heading: string
  subheading?: string | null
  badge?: string | null
  primaryBtnText?: string | null
  primaryBtnUrl?: string | null
  secondaryBtnText?: string | null
  secondaryBtnUrl?: string | null
  backgroundImage?: string | null
  overlayIntensity: number
}

// Premium gradient backgrounds for when no image is uploaded
const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, hsl(220, 65%, 18%) 0%, hsl(250, 50%, 25%) 50%, hsl(220, 65%, 30%) 100%)',
  'linear-gradient(135deg, hsl(220, 65%, 22%) 0%, hsl(200, 60%, 28%) 50%, hsl(160, 45%, 25%) 100%)',
  'linear-gradient(135deg, hsl(230, 55%, 20%) 0%, hsl(220, 65%, 28%) 50%, hsl(40, 50%, 25%) 100%)',
]

interface HeroSectionProps {
  slides: Slide[]
}

export function HeroSection({ slides }: HeroSectionProps) {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  const goTo = (index: number) => {
    if (animating) return
    setAnimating(true)
    setCurrent(index)
    setTimeout(() => setAnimating(false), 700)
  }

  const next = () => goTo((current + 1) % slides.length)
  const prev = () => goTo((current - 1 + slides.length) % slides.length)

  useEffect(() => {
    intervalRef.current = setInterval(next, 6000)
    return () => clearInterval(intervalRef.current)
  }, [current])

  if (!slides.length) return null

  const slide = slides[current]
  const overlayOpacity = (slide.overlayIntensity || 50) / 100
  const gradient = FALLBACK_GRADIENTS[current % FALLBACK_GRADIENTS.length]

  return (
    <section className={styles.hero} aria-label="Hero slider" id="hero">
      {/* Background */}
      <div className={styles.bg}>
        {slide.backgroundImage ? (
          <img src={slide.backgroundImage} alt="" className={`${styles.bgImg} ${animating ? styles.animating : ''}`} aria-hidden />
        ) : (
          <div className={styles.bgGradient} style={{ background: gradient }} aria-hidden />
        )}
        <div className={styles.overlay} style={{ opacity: overlayOpacity }} />

        {/* Decorative elements */}
        <div className={styles.decor1} />
        <div className={styles.decor2} />
      </div>

      {/* Content */}
      <div className={`container ${styles.content}`}>
        <div className={`${styles.slideContent} ${animating ? styles.slideOut : styles.slideIn}`}>
          {slide.badge && (
            <div className={styles.badge} aria-label="School badge">
              <span className={styles.badgeDot} />
              {slide.badge}
            </div>
          )}

          <h1 className={styles.heading}>{slide.heading}</h1>

          {slide.subheading && (
            <p className={styles.subheading}>{slide.subheading}</p>
          )}

          <div className={styles.actions}>
            {slide.primaryBtnText && (
              <Link href={slide.primaryBtnUrl || '/admissions'} className={`btn btn-accent btn-lg ${styles.btnPrimary}`} id="hero-primary-btn">
                {slide.primaryBtnText}
              </Link>
            )}
            {slide.secondaryBtnText && (
              <Link href={slide.secondaryBtnUrl || '/about'} className={`btn btn-outline-white btn-lg ${styles.btnSecondary}`} id="hero-secondary-btn">
                {slide.secondaryBtnText}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={prev}
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={next}
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className={styles.dots} role="tablist" aria-label="Slide indicators">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === current}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-hidden>
        <div className={styles.scrollDot} />
      </div>
    </section>
  )
}
