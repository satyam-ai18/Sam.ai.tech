import React from 'react'

export function PageHeader({
  badge,
  title,
  description,
}: {
  badge?: string
  title: string
  description?: string
}) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--color-primary, hsl(220, 65%, 28%)) 0%, hsl(220, 65%, 20%) 100%)',
        color: '#ffffff',
        padding: 'clamp(3rem, 6vw, 4.5rem) 0 clamp(2.5rem, 5vw, 3.5rem) 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 1.5rem',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {badge && (
          <span
            style={{
              display: 'inline-block',
              padding: '0.35rem 0.875rem',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(4px)',
              color: 'var(--color-accent, hsl(40, 92%, 50%))',
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
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontFamily: 'var(--font-heading, "Playfair Display", serif)',
            fontWeight: 700,
            margin: '0 0 1rem 0',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.125rem)',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
