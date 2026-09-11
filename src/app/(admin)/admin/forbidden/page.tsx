import Link from 'next/link'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '403 Access Denied | Admin Dashboard',
}

export default function ForbiddenPage() {
  return (
    <div
      style={{
        minHeight: '65vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '480px', background: '#ffffff', borderRadius: '16px', padding: '3rem 2rem', border: '1px solid hsl(220, 20%, 90%)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'hsl(0, 85%, 95%)',
            color: 'hsl(0, 80%, 45%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(0, 80%, 45%)' }}>
          Error 403 · Forbidden
        </span>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(220, 35%, 15%)', margin: '0.5rem 0 0.75rem 0' }}>
          Access Restricted
        </h1>

        <p style={{ fontSize: '0.9375rem', color: 'hsl(220, 15%, 50%)', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
          Your current staff account role does not have authorization to view or manage this administrative section. Please contact a Super Administrator if you require elevated privileges.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/admin/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              background: 'hsl(220, 70%, 35%)',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Home size={15} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
