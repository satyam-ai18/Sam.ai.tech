import React from 'react'

interface PublicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hoverEffect?: boolean
  className?: string
}

export function PublicCard({
  children,
  hoverEffect = true,
  className = '',
  style,
  ...props
}: PublicCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border-light, hsl(220, 20%, 92%))',
        borderRadius: 'var(--radius-xl, 16px)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}
