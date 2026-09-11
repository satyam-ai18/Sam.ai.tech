import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Failed to load content',
  message = 'An unexpected error occurred while loading this data. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        borderRadius: '16px',
        border: '1px solid hsl(0, 75%, 88%)',
        background: 'hsl(0, 75%, 98%)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'hsl(0, 75%, 92%)',
          color: 'hsl(0, 75%, 45%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <AlertCircle size={28} />
      </div>

      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'hsl(0, 75%, 25%)',
          margin: '0 0 0.35rem 0',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: 'hsl(0, 30%, 45%)',
          maxWidth: '400px',
          margin: '0 0 1.25rem 0',
        }}
      >
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            borderRadius: '8px',
            border: '1px solid hsl(0, 75%, 75%)',
            background: '#ffffff',
            color: 'hsl(0, 75%, 35%)',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={15} />
          Try Again
        </button>
      )}
    </div>
  )
}
