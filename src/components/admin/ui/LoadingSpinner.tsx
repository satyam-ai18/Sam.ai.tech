import React from 'react'
import { Loader2 } from 'lucide-react'

export function LoadingSpinner({
  size = 24,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: 'hsl(220, 70%, 45%)',
      }}
      className={className}
    >
      <Loader2 size={size} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export function Skeleton({
  height = '1.25rem',
  width = '100%',
  borderRadius = '6px',
}: {
  height?: string
  width?: string
  borderRadius?: string
}) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius,
        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
