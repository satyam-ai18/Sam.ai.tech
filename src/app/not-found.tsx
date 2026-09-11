import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'var(--font-sans, "Inter", sans-serif)',
      }}
    >
      <div style={{ maxWidth: '520px' }}>
        <div
          style={{
            fontSize: 'clamp(5rem, 12vw, 8rem)',
            fontWeight: 900,
            color: 'hsl(220, 65%, 28%)',
            lineHeight: 1,
            marginBottom: '1rem',
            opacity: 0.85,
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'hsl(220, 20%, 15%)',
            margin: '0 0 0.75rem 0',
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: 'hsl(220, 15%, 45%)',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          The page you are looking for might have been moved, removed, or is temporarily unavailable.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              background: 'hsl(220, 65%, 28%)',
              color: '#ffffff',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.9375rem',
            }}
          >
            <Home size={16} />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
