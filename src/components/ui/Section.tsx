import React from 'react'
import { Container } from './Container'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  badge?: string
  title?: string
  subtitle?: string
  centered?: boolean
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export function Section({
  children,
  badge,
  title,
  subtitle,
  centered = true,
  containerSize = 'lg',
  className = '',
  style,
  ...props
}: SectionProps) {
  return (
    <section
      style={{
        padding: 'clamp(3.5rem, 7vw, 6rem) 0',
        ...style,
      }}
      className={className}
      {...props}
    >
      <Container size={containerSize}>
        {(badge || title || subtitle) && (
          <div
            style={{
              textAlign: centered ? 'center' : 'left',
              maxWidth: centered ? '680px' : '100%',
              margin: centered ? '0 auto 3rem auto' : '0 0 3rem 0',
            }}
          >
            {badge && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.35rem 0.875rem',
                  borderRadius: '9999px',
                  background: 'var(--color-primary-muted, hsl(220, 65%, 95%))',
                  color: 'var(--color-primary, hsl(220, 65%, 28%))',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                }}
              >
                {badge}
              </span>
            )}
            {title && (
              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  fontFamily: 'var(--font-heading, "Playfair Display", serif)',
                  fontWeight: 700,
                  color: 'var(--color-text, hsl(220, 20%, 15%))',
                  lineHeight: 1.25,
                  margin: '0 0 0.75rem 0',
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
                  color: 'var(--color-text-muted, hsl(220, 15%, 45%))',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}
