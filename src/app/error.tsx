'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log securely on client side console without disclosing secrets
    console.error('Handled application error:', error.message)
  }, [error])

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
      <div style={{ maxWidth: '500px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'hsl(0, 75%, 94%)',
            color: 'hsl(0, 75%, 50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <AlertCircle size={36} />
        </div>

        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'hsl(220, 20%, 15%)',
            margin: '0 0 0.75rem 0',
          }}
        >
          Something Went Wrong
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: 'hsl(220, 15%, 45%)',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          An unexpected error occurred while loading this page. Our team has been notified.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              background: 'hsl(220, 65%, 28%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9375rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={16} />
            Try Again
          </button>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid hsl(220, 20%, 80%)',
              background: '#ffffff',
              color: 'hsl(220, 20%, 25%)',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.9375rem',
            }}
          >
            <Home size={16} />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
